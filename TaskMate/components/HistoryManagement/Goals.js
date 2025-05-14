import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Client, Databases } from "appwrite";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import TopBar from "../MenuBars/TopBar";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");

const databases = new Databases(client);

const GoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const navigation = useNavigation();

  // Fetch Goals
  const fetchGoals = async () => {
    try {
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e16137002384116add"
      );
      setGoals(response.documents);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  // Calculate Total Goal Progress
  const completedGoals = goals.filter((goal) => goal.Completed).length;
  const totalGoals = goals.length;

  // Delete Goal
  const deleteGoal = async (goalId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId
      );
      setGoals(goals.filter((goal) => goal.$id !== goalId));
      Alert.alert("Success", "Goal has been deleted.");
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete goal.");
    }
  };

  // Complete Goal
  const completeGoal = async (goalId, currentStatus) => {
    try {
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId,
        {
          Completed: !currentStatus,
        }
      );
      fetchGoals();
      Alert.alert(
        "Success",
        `Goal marked as ${!currentStatus ? "completed" : "incomplete"}.`
      );
    } catch (error) {
      console.error("Error completing goal:", error);
      Alert.alert("Error", "Failed to update goal status.");
    }
  };

  // Open Edit Modal
  const openEditModal = (goal) => {
    setSelectedGoal({
      ...goal,
      Start_Date: goal.Start_Date || "2025-05-13T00:00:00.000Z",
      End_Date: goal.End_Date || "2025-05-13T00:00:00.000Z",
      GoalNote: goal.GoalNote || "",
    });
    setStartDateError("");
    setEndDateError("");
    setModalVisible(true);
  };

  // Validate Date
  const validateDate = (date, fieldName) => {
    if (!date) {
      return `${fieldName} is required.`;
    }
    const parsedDate = moment(date);
    if (!parsedDate.isValid()) {
      return `Invalid ${fieldName.toLowerCase()}.`;
    }
    if (fieldName === "Start Date" && parsedDate.isBefore(moment(), "day")) {
      return "Start date cannot be before today.";
    }
    return "";
  };

  // Validate End Date is After Start Date
  const validateEndDateAfterStartDate = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    if (start.isValid() && end.isValid() && end.isSameOrBefore(start, "day")) {
      return "End date must be after start date.";
    }
    return "";
  };

  // Format Date for Display
  const formatDateForDisplay = (date) => {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  };

  // Handle Start Date Selection
  const handleStartDatePress = (day) => {
    const selectedDay = moment(day.dateString);
    const today = moment();
    if (selectedDay.isBefore(today, "day")) {
      Alert.alert("Error", "Start date cannot be before today.");
      return;
    }
    const isoDate = selectedDay.startOf("day").toISOString();
    setSelectedGoal({ ...selectedGoal, Start_Date: isoDate });
    setStartDateError(validateDate(isoDate, "Start Date"));
    setEndDateError(
      validateDate(selectedGoal?.End_Date, "End Date") ||
        validateEndDateAfterStartDate(isoDate, selectedGoal?.End_Date)
    );
    setShowStartDatePicker(false);
  };

  // Handle End Date Selection
  const handleEndDatePress = (day) => {
    const selectedDay = moment(day.dateString);
    const start = moment(selectedGoal?.Start_Date);
    if (selectedDay.isSameOrBefore(start, "day")) {
      Alert.alert("Error", "End date must be after start date.");
      return;
    }
    const isoDate = selectedDay.startOf("day").toISOString();
    setSelectedGoal({ ...selectedGoal, End_Date: isoDate });
    setEndDateError(
      validateDate(isoDate, "End Date") ||
        validateEndDateAfterStartDate(selectedGoal?.Start_Date, isoDate)
    );
    setShowEndDatePicker(false);
  };

  // Update Goal
  const updateGoal = async () => {
    if (!selectedGoal?.GoalName.trim()) {
      Alert.alert("Error", "Goal name cannot be empty");
      return;
    }

    const startDateValidationError = validateDate(
      selectedGoal?.Start_Date,
      "Start Date"
    );
    const endDateValidationError = validateDate(
      selectedGoal?.End_Date,
      "End Date"
    );
    const endDateAfterStartError = validateEndDateAfterStartDate(
      selectedGoal?.Start_Date,
      selectedGoal?.End_Date
    );

    setStartDateError(startDateValidationError);
    setEndDateError(endDateValidationError || endDateAfterStartError);

    if (
      startDateValidationError ||
      endDateValidationError ||
      endDateAfterStartError
    ) {
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
      fetchGoals();
      setModalVisible(false);
      setSelectedGoal(null);
      setStartDateError("");
      setEndDateError("");
      Alert.alert("Success", "Your Goal is Updated!");
    } catch (error) {
      console.error("Error updating goal:", error);
      Alert.alert("Error", "Failed to update goal.");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Header and Summary Component for FlatList
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Goals</Text>
        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => navigation.navigate("SetGoals")}
        >
          <Text style={styles.addGoalText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalSummaryContainer}>
        <View style={styles.goalCard}>
          <Text style={styles.goalCardTitle}>Total Goals</Text>
          <Text style={styles.goalProgress}>
            {completedGoals}/{totalGoals}
          </Text>
          <Text style={styles.goalSubtext}>Goals completed</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Goals" />
      <FlatList
        data={goals}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.goalItem,
              item.Completed ? styles.goalItemCompleted : null,
            ]}
          >
            <Ionicons
              name={item.Completed ? "checkmark-circle" : "calendar"}
              size={24}
              color={item.Completed ? "#28A745" : "#6A5AE0"}
              style={styles.goalIcon}
            />
            <View style={styles.goalTextContainer}>
              <Text
                style={[
                  styles.goalTitle,
                  item.Completed ? styles.goalTitleCompleted : null,
                ]}
              >
                {item.GoalName}
              </Text>
              <Text style={styles.goalDetails}>
                Start:{" "}
                {item.Start_Date
                  ? moment(item.Start_Date).format("YYYY-MM-DD")
                  : "N/A"}
              </Text>
              <Text style={styles.goalDetails}>
                End:{" "}
                {item.End_Date
                  ? moment(item.End_Date).format("YYYY-MM-DD")
                  : "N/A"}
              </Text>
              <Text style={styles.goalDetails}>
                Note: {item.GoalNote || "N/A"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <MaterialIcons name="edit" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteGoal(item.$id)}>
              <MaterialIcons name="delete" size={20} color="red" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => completeGoal(item.$id, item.Completed)}
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
      />

      {/* Update Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Goal</Text>
            <TextInput
              style={styles.input}
              value={selectedGoal?.GoalName || ""}
              onChangeText={(text) =>
                setSelectedGoal({ ...selectedGoal, GoalName: text })
              }
              placeholder="Goal Name"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <View
                style={[
                  styles.inputContainer,
                  startDateError ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.inputWithIcon}
                  value={formatDateForDisplay(selectedGoal?.Start_Date)}
                  editable={false}
                  placeholder="Select start date"
                  placeholderTextColor="#888"
                />
                <MaterialIcons
                  name="calendar-today"
                  size={24}
                  color="#2A4D9B"
                  style={styles.icon}
                />
              </View>
            </TouchableOpacity>
            {startDateError ? (
              <Text style={styles.errorText}>{startDateError}</Text>
            ) : null}

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <View
                style={[
                  styles.inputContainer,
                  endDateError ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.inputWithIcon}
                  value={formatDateForDisplay(selectedGoal?.End_Date)}
                  editable={false}
                  placeholder="Select end date"
                  placeholderTextColor="#888"
                />
                <MaterialIcons
                  name="calendar-today"
                  size={24}
                  color="#2A4D9B"
                  style={styles.icon}
                />
              </View>
            </TouchableOpacity>
            {endDateError ? (
              <Text style={styles.errorText}>{endDateError}</Text>
            ) : null}

            <TextInput
              style={styles.input}
              value={selectedGoal?.GoalNote || ""}
              onChangeText={(text) =>
                setSelectedGoal({ ...selectedGoal, GoalNote: text })
              }
              placeholder="Goal Note"
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={updateGoal} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSelectedGoal(null);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Start Date Calendar Modal */}
      <Modal
        visible={showStartDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStartDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Start Date</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleStartDatePress}
              markedDates={{
                [formatDateForDisplay(selectedGoal?.Start_Date)]: {
                  selected: true,
                  selectedColor: "#2A4D9B",
                },
              }}
              minDate={moment().format("YYYY-MM-DD")}
              theme={{
                backgroundColor: "#fff",
                calendarBackground: "#fff",
                textSectionTitleColor: "#555",
                selectedDayBackgroundColor: "#2A4D9B",
                selectedDayTextColor: "#fff",
                todayTextColor: "#2A4D9B",
                dayTextColor: "#333",
                arrowColor: "#2A4D9B",
                monthTextColor: "#333",
              }}
              style={styles.calendar}
            />
          </View>
        </View>
      </Modal>

      {/* End Date Calendar Modal */}
      <Modal
        visible={showEndDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select End Date</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleEndDatePress}
              markedDates={{
                [formatDateForDisplay(selectedGoal?.End_Date)]: {
                  selected: true,
                  selectedColor: "#2A4D9B",
                },
              }}
              minDate={moment(selectedGoal?.Start_Date)
                .add(1, "day")
                .format("YYYY-MM-DD")}
              theme={{
                backgroundColor: "#fff",
                calendarBackground: "#fff",
                textSectionTitleColor: "#555",
                selectedDayBackgroundColor: "#2A4D9B",
                selectedDayTextColor: "#fff",
                todayTextColor: "#2A4D9B",
                dayTextColor: "#333",
                arrowColor: "#2A4D9B",
                monthTextColor: "#333",
              }}
              style={styles.calendar}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#101010",
  },
  addGoalButton: {
    backgroundColor: "#FF8C42",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addGoalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  goalSummaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingVertical: 12,
    width: 350,
    borderRadius: 12,
    backgroundColor: "#74BBFB", // Light blueish background
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    borderWidth: 1,
    borderColor: "#74BBFB", // Light border color
  },
  goalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: "60%",
    shadowColor: "#000",
    marginLeft: 70,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3567D4",
  },
  goalProgress: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#28A745",
  },
  goalSubtext: {
    fontSize: 14,
    color: "#555",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goalItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  goalItemCompleted: {
    backgroundColor: "#E8F5E9",
  },
  goalTextContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  goalTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#555",
  },
  goalDetails: {
    fontSize: 14,
    color: "#555",
  },
  goalIcon: {
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  icon: {
    marginLeft: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#2A4D9B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: "#FF5733",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
    padding: 10,
  },
});

export default GoalsScreen;
