import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Client, Databases } from 'appwrite';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import TopBar from "../MenuBars/TopBar";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");

const databases = new Databases(client);

const GoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const navigation = useNavigation();

  const fetchGoals = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e16137002384116add"
      );
      setGoals(response.documents);
      setFilteredGoals(response.documents);
      console.log("Goals fetched:", response.documents.length);
    } catch (error) {
      console.error("Error fetching goals:", error);
      Alert.alert("Error", "Failed to fetch goals.");
    }
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredGoals(goals);
    } else {
      const filtered = goals.filter(goal =>
        goal.GoalName.toLowerCase().startsWith(query.toLowerCase())
      );
      setFilteredGoals(filtered);
    }
  }, [goals]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredGoals(goals);
  }, [goals]);

  const completedGoals = filteredGoals.filter(goal => goal.Completed).length;
  const totalGoals = filteredGoals.length;

  const deleteGoal = useCallback(async (goalId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId
      );
      setGoals(prev => prev.filter(goal => goal.$id !== goalId));
      setFilteredGoals(prev => prev.filter(goal => goal.$id !== goalId));
      Alert.alert("Success", "Goal has been deleted.");
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete goal.");
    }
  }, []);

  const completeGoal = useCallback(async (goalId, currentStatus) => {
    try {
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId,
        { Completed: !currentStatus }
      );
      await fetchGoals();
      Alert.alert("Success", `Goal marked as ${!currentStatus ? 'completed' : 'incomplete'}.`);
    } catch (error) {
      console.error("Error completing goal:", error);
      Alert.alert("Error", "Failed to update goal status.");
    }
  }, [fetchGoals]);

  const openEditModal = useCallback((goal) => {
    setSelectedGoal({
      ...goal,
      Start_Date: goal.Start_Date || moment().toISOString(),
      End_Date: goal.End_Date || moment().add(1, 'day').toISOString(),
      GoalNote: goal.GoalNote || '',
    });
    setStartDateError('');
    setEndDateError('');
    setModalVisible(true);
    console.log("Edit modal opened for goal:", goal.$id);
  }, []);

  const validateDate = useCallback((date, fieldName) => {
    if (!date) return `${fieldName} is required.`;
    const parsedDate = moment(date);
    if (!parsedDate.isValid()) return `Invalid ${fieldName.toLowerCase()}.`;
    if (fieldName === "Start Date" && parsedDate.isBefore(moment(), "day")) {
      return "Start date cannot be before today.";
    }
    return "";
  }, []);

  const validateEndDateAfterStartDate = useCallback((startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    if (start.isValid() && end.isValid() && end.isSameOrBefore(start, "day")) {
      return "End date must be after start date.";
    }
    return "";
  }, []);

  const formatDateForDisplay = useCallback((date) => {
    return date ? moment(date).format("YYYY-MM-DD") : 'Select date';
  }, []);

  const handleStartDatePress = useCallback((day) => {
    const selectedDay = moment(day.dateString);
    const today = moment();
    if (selectedDay.isBefore(today, "day")) {
      Alert.alert("Error", "Start date cannot be before today.");
      return;
    }
    const isoDate = selectedDay.startOf("day").toISOString();
    setSelectedGoal(prev => ({ ...prev, Start_Date: isoDate }));
    setStartDateError(validateDate(isoDate, "Start Date"));
    setEndDateError(
      validateDate(selectedGoal?.End_Date, "End Date") ||
      validateEndDateAfterStartDate(isoDate, selectedGoal?.End_Date)
    );
    setShowStartDatePicker(false);
    console.log("Start date selected:", isoDate);
  }, [selectedGoal, validateDate, validateEndDateAfterStartDate]);

  const handleEndDatePress = useCallback((day) => {
    const selectedDay = moment(day.dateString);
    const start = moment(selectedGoal?.Start_Date);
    if (selectedDay.isSameOrBefore(start, "day")) {
      Alert.alert("Error", "End date must be after start date.");
      return;
    }
    const isoDate = selectedDay.startOf("day").toISOString();
    setSelectedGoal(prev => ({ ...prev, End_Date: isoDate }));
    setEndDateError(
      validateDate(isoDate, "End Date") ||
      validateEndDateAfterStartDate(selectedGoal?.Start_Date, isoDate)
    );
    setShowEndDatePicker(false);
    console.log("End date selected:", isoDate);
  }, [selectedGoal, validateDate, validateEndDateAfterStartDate]);

  const updateGoal = useCallback(async () => {
    if (!selectedGoal?.GoalName.trim()) {
      Alert.alert("Error", "Goal name cannot be empty.");
      return;
    }

    const startDateValidationError = validateDate(selectedGoal?.Start_Date, "Start Date");
    const endDateValidationError = validateDate(selectedGoal?.End_Date, "End Date");
    const endDateAfterStartError = validateEndDateAfterStartDate(
      selectedGoal?.Start_Date,
      selectedGoal?.End_Date
    );

    setStartDateError(startDateValidationError);
    setEndDateError(endDateValidationError || endDateAfterStartError);

    if (startDateValidationError || endDateValidationError || endDateAfterStartError) {
      Alert.alert("Error", "Please correct the date errors.");
      return;
    }

    try {
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        selectedGoal.$id,
        {
          GoalName: selectedGoal.GoalName,
          GoalNote: selectedGoal.GoalNote,
          Start_Date: selectedGoal.Start_Date,
          End_Date: selectedGoal.End_Date,
          Completed: selectedGoal.Completed || false,
        }
      );
      await fetchGoals();
      setModalVisible(false);
      setSelectedGoal(null);
      setStartDateError('');
      setEndDateError('');
      Alert.alert("Success", "Your goal has been updated!");
    } catch (error) {
      console.error("Error updating goal:", error);
      Alert.alert("Error", "Failed to update goal.");
    }
  }, [selectedGoal, fetchGoals, validateDate, validateEndDateAfterStartDate]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          accessible={true} 
          accessibilityLabel="Go back" 
          accessibilityHint="Navigate to previous screen"
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Goals</Text>
        <TouchableOpacity 
          style={styles.addGoalButton} 
          onPress={() => navigation.navigate('SetGoals')}
          accessible={true}
          accessibilityLabel="Add new goal"
          accessibilityHint="Navigate to set goals screen"
        >
          <Text style={styles.addGoalText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalSummaryContainer}>
        <View style={styles.goalCard}>
          <Text style={styles.goalCardTitle}>Total Goals</Text>
          <Text style={styles.goalProgress}>{completedGoals}/{totalGoals}</Text>
          <Text style={styles.goalSubtext}>Goals completed</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={isSearchFocused ? "Type to search..." : "Search goals by name"}
          placeholderTextColor="#888"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          autoFocus={false}
          returnKeyType="search"
          accessible={true}
          accessibilityLabel="Search goals"
          accessibilityHint="Enter text to filter goals by name"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={clearSearch}
            style={styles.clearButton}
            accessible={true}
            accessibilityLabel="Clear search"
            accessibilityHint="Remove all text from the search bar"
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Goals" />
      <FlatList
        data={filteredGoals}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={[styles.goalItem, item.Completed ? styles.goalItemCompleted : null]}>
            <Ionicons 
              name={item.Completed ? "checkmark-circle" : "calendar"} 
              size={24} 
              color={item.Completed ? "#28A745" : "#6A5AE0"} 
              style={styles.goalIcon} 
            />
            <View style={styles.goalTextContainer}>
              <Text style={[styles.goalTitle, item.Completed ? styles.goalTitleCompleted : null]}>
                {item.GoalName}
              </Text>
              <Text style={styles.goalDetails}>
                Start: {item.Start_Date ? moment(item.Start_Date).format('YYYY-MM-DD') : 'N/A'}
              </Text>
              <Text style={styles.goalDetails}>
                End: {item.End_Date ? moment(item.End_Date).format('YYYY-MM-DD') : 'N/A'}
              </Text>
              <Text style={styles.goalDetails}>Note: {item.GoalNote || 'N/A'}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => openEditModal(item)}
              accessible={true}
              accessibilityLabel="Edit goal"
              accessibilityHint="Open modal to edit this goal"
            >
              <MaterialIcons name="edit" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteGoal(item.$id)}
              accessible={true}
              accessibilityLabel="Delete goal"
              accessibilityHint="Delete this goal"
            >
              <MaterialIcons name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => completeGoal(item.$id, item.Completed)}
              accessible={true}
              accessibilityLabel={item.Completed ? "Mark goal as incomplete" : "Mark goal as completed"}
              accessibilityHint="Toggle goal completion status"
            >
              <MaterialIcons 
                name={item.Completed ? "undo" : "check"} 
                size={20} 
                color={item.Completed ? "#FF5733" : "#28A745"} 
              />
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />

      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedGoal(null);
          console.log("Edit modal closed");
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Goal</Text>
            <TextInput
              style={styles.input}
              value={selectedGoal?.GoalName || ''}
              onChangeText={(text) => setSelectedGoal(prev => ({ ...prev, GoalName: text }))}
              placeholder="Goal Name"
              placeholderTextColor="#888"
              accessible={true}
              accessibilityLabel="Goal name input"
              accessibilityHint="Enter the name of the goal"
            />
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                setShowStartDatePicker(true);
                console.log("Start date picker opened");
              }}
              style={[styles.inputContainer, startDateError ? styles.inputError : null]}
              accessible={true}
              accessibilityLabel="Select start date"
              accessibilityHint="Open calendar to select goal start date"
            >
              <Text style={styles.inputWithIcon}>
                {formatDateForDisplay(selectedGoal?.Start_Date)}
              </Text>
              <MaterialIcons name="calendar-today" size={24} color="#2A4D9B" style={styles.icon} />
            </TouchableOpacity>
            {startDateError ? <Text style={styles.errorText}>{startDateError}</Text> : null}

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                setShowEndDatePicker(true);
                console.log("End date picker opened");
              }}
              style={[styles.inputContainer, endDateError ? styles.inputError : null]}
              accessible={true}
              accessibilityLabel="Select end date"
              accessibilityHint="Open calendar to select goal end date"
            >
              <Text style={styles.inputWithIcon}>
                {formatDateForDisplay(selectedGoal?.End_Date)}
              </Text>
              <MaterialIcons name="calendar-today" size={24} color="#2A4D9B" style={styles.icon} />
            </TouchableOpacity>
            {endDateError ? <Text style={styles.errorText}>{endDateError}</Text> : null}

            <TextInput
              style={styles.input}
              value={selectedGoal?.GoalNote || ''}
              onChangeText={(text) => setSelectedGoal(prev => ({ ...prev, GoalNote: text }))}
              placeholder="Goal Note"
              placeholderTextColor="#888"
              accessible={true}
              accessibilityLabel="Goal note input"
              accessibilityHint="Enter a note for the goal (optional)"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={updateGoal} 
                style={styles.saveButton}
                accessible={true}
                accessibilityLabel="Save goal"
                accessibilityHint="Save the updated goal details"
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setSelectedGoal(null);
                  setStartDateError('');
                  setEndDateError('');
                  console.log("Edit modal closed via cancel");
                }} 
                style={styles.cancelButton}
                accessible={true}
                accessibilityLabel="Cancel edit"
                accessibilityHint="Close the modal without saving changes"
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showStartDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowStartDatePicker(false);
          console.log("Start date picker closed");
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Start Date</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowStartDatePicker(false);
                  console.log("Start date picker closed via close button");
                }}
                accessible={true}
                accessibilityLabel="Close start date calendar"
                accessibilityHint="Close the start date calendar without selecting a date"
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleStartDatePress}
              markedDates={{
                [formatDateForDisplay(selectedGoal?.Start_Date)]: {
                  selected: true,
                  selectedColor: '#2A4D9B',
                },
              }}
              minDate={moment().format("YYYY-MM-DD")}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#555',
                selectedDayBackgroundColor: '#2A4D9B',
                selectedDayTextColor: '#fff',
                todayTextColor: '#2A4D9B',
                dayTextColor: '#333',
                arrowColor: '#2A4D9B',
                monthTextColor: '#333',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEndDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEndDatePicker(false);
          console.log("End date picker closed");
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select End Date</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowEndDatePicker(false);
                  console.log("End date picker closed via close button");
                }}
                accessible={true}
                accessibilityLabel="Close end date calendar"
                accessibilityHint="Close the end date calendar without selecting a date"
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleEndDatePress}
              markedDates={{
                [formatDateForDisplay(selectedGoal?.End_Date)]: {
                  selected: true,
                  selectedColor: '#2A4D9B',
                },
              }}
              minDate={selectedGoal?.Start_Date ? moment(selectedGoal.Start_Date).add(1, "day").format("YYYY-MM-DD") : moment().add(1, "day").format("YYYY-MM-DD")}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#555',
                selectedDayBackgroundColor: '#2A4D9B',
                selectedDayTextColor: '#fff',
                todayTextColor: '#2A4D9B',
                dayTextColor: '#333',
                arrowColor: '#2A4D9B',
                monthTextColor: '#333',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#101010',
  },
  addGoalButton: {
    backgroundColor: '#FF8C42',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addGoalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 12,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#74BBFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#74BBFB',
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3567D4',
  },
  goalProgress: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28A745',
  },
  goalSubtext: {
    fontSize: 14,
    color: '#555',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainerFocused: {
    borderColor: '#2A4D9B',
    shadowOpacity: 0.2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goalItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  goalItemCompleted: {
    backgroundColor: '#E8F5E9',
  },
  goalTextContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
  goalDetails: {
    fontSize: 14,
    color: '#555',
  },
  goalIcon: {
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginLeft: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#2A4D9B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
});

export default GoalsScreen;