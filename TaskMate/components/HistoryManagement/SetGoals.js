import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { Client, Databases, ID } from "appwrite";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");

const databases = new Databases(client);

const SetGoalsScreen = () => {
  // State for form inputs and errors
  const [goalName, setGoalName] = useState("");
  const [goalNote, setGoalNote] = useState("");
  const [startDate, setStartDate] = useState("2025-05-13T00:00:00.000Z");
  const [endDate, setEndDate] = useState("2025-05-13T00:00:00.000Z");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [goalNameError, setGoalNameError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [goals, setGoals] = useState([]);
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Theme colors for light and dark modes
  const colors = {
    light: {
      background: "#F5F5F5",
      card: "#FFFFFF",
      text: "#1A1A1A",
      subText: "#757575",
      accent: "#007AFF",
      modalBg: "#FFFFFF",
      inputBg: "#F8F9FA",
      border: "#E0E0E0",
      error: "#FF3B30",
    },
    dark: {
      background: "#121212",
      card: "#1E1E1E",
      text: "#FFFFFF",
      subText: "#AAAAAA",
      accent: "#007AFF",
      modalBg: "#2C2C2C",
      inputBg: "#333333",
      border: "#444444",
      error: "#FF453A",
    },
  };

  const themeColors = colors[theme];

  // Fetch goals from Appwrite
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

  // Validate goal name
  const validateGoalName = (name) => {
    if (!name.trim()) {
      return "Goal name is required.";
    }
    if (name.length < 3) {
      return "Goal name must be at least 3 characters long.";
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
  return "Goal name can only contain letters, numbers, or spaces.";
 }
    return "";
  };

  // Validate date
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

  // Validate end date is after start date
  const validateEndDateAfterStartDate = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    if (start.isValid() && end.isValid() && end.isSameOrBefore(start, "day")) {
      return "End date must be after start date.";
    }
    return "";
  };

  // Format date for display (YYYY-MM-DD)
  const formatDateForDisplay = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  // Handle start date selection
  const handleStartDatePress = (day) => {
    const selectedDay = moment(day.dateString);
    const today = moment();
    if (selectedDay.isBefore(today, "day")) {
      Alert.alert("Error", "Start date cannot be before today.");
      return;
    }
    const isoDate = selectedDay.startOf("day").toISOString();
    setStartDate(isoDate);
    setStartDateError(validateDate(isoDate, "Start Date"));
    setEndDateError(
      validateDate(endDate, "End Date") ||
        validateEndDateAfterStartDate(isoDate, endDate)
    );
    setShowStartDatePicker(false);
  };

  // Handle end date selection
  const handleEndDatePress = (day) => {
    const selectedDay = moment(day.dateString);
    const start = moment(startDate);
    if (selectedDay.isSameOrBefore(start, "day")) {
      Alert.alert("Error", "End date must be after start date.");
      return;
    }
    const isoDate = selectedDay.startOf("day").toISOString();
    setEndDate(isoDate);
    setEndDateError(
      validateDate(isoDate, "End Date") ||
        validateEndDateAfterStartDate(startDate, isoDate)
    );
    setShowEndDatePicker(false);
  };

  // Save goal to Appwrite
  const saveGoalToDatabase = async () => {
    const goalNameValidationError = validateGoalName(goalName);
    const startDateValidationError = validateDate(startDate, "Start Date");
    const endDateValidationError = validateDate(endDate, "End Date");
    const endDateAfterStartError = validateEndDateAfterStartDate(
      startDate,
      endDate
    );

    setGoalNameError(goalNameValidationError);
    setStartDateError(startDateValidationError);
    setEndDateError(endDateValidationError || endDateAfterStartError);

    if (
      goalNameValidationError ||
      startDateValidationError ||
      endDateValidationError ||
      endDateAfterStartError
    ) {
      Alert.alert("Error", "Please correct the errors in the form.");
      return;
    }

    try {
      await databases.createDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        ID.unique(),
        {
          GoalName: goalName,
          GoalNote: goalNote || "",
          Completed: false,
          Start_Date: startDate,
          End_Date: endDate,
        }
      );

      Alert.alert("Success", "Goal saved successfully!");
      setGoalName("");
      setGoalNote("");
      setStartDate("2025-05-13T00:00:00.000Z");
      setEndDate("2025-05-13T00:00:00.000Z");
      setGoalNameError("");
      setStartDateError("");
      setEndDateError("");
      fetchGoals();
      navigation.navigate("Goals");
    } catch (error) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", "Failed to save goal. Please try again.");
    }
  };

  // Delete goal from Appwrite
  const deleteGoal = async (goalId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId
      );
      Alert.alert("Deleted", "Goal has been deleted.");
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete goal.");
    }
  };

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={themeColors.accent} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: themeColors.text }]}>
          Set Your Goals
        </Text>
      </View>

      {/* Goal Name Input */}
      <Text style={[styles.label, { color: themeColors.text }]}>Goal Name</Text>
      <TextInput
        style={[
          styles.input,
          goalNameError ? styles.inputError : null,
          { backgroundColor: themeColors.inputBg, color: themeColors.text },
        ]}
        placeholder="Enter goal name"
        placeholderTextColor={themeColors.subText}
        value={goalName}
        onChangeText={(text) => {
          setGoalName(text);
          setGoalNameError(validateGoalName(text));
        }}
      />
      {goalNameError ? (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {goalNameError}
        </Text>
      ) : null}

      {/* Start Date Picker */}
      <Text style={[styles.label, { color: themeColors.text }]}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <View
          style={[
            styles.inputContainer,
            startDateError ? styles.inputError : null,
            { backgroundColor: themeColors.inputBg, borderColor: themeColors.border },
          ]}
        >
          <TextInput
            style={[styles.inputWithIcon, { color: themeColors.text }]}
            value={formatDateForDisplay(startDate)}
            editable={false}
            placeholder="Select start date"
            placeholderTextColor={themeColors.subText}
          />
          <Icon
            name="calendar-today"
            size={24}
            color={themeColors.accent}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
      {startDateError ? (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {startDateError}
        </Text>
      ) : null}

      {/* Start Date Calendar Modal */}
      <Modal
        visible={showStartDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStartDatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Select Start Date
              </Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <Icon name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleStartDatePress}
              markedDates={{
                [moment(startDate).format("YYYY-MM-DD")]: {
                  selected: true,
                  selectedColor: themeColors.accent,
                },
              }}
              minDate={moment().format("YYYY-MM-DD")}
              theme={{
                backgroundColor: themeColors.modalBg,
                calendarBackground: themeColors.modalBg,
                textSectionTitleColor: themeColors.subText,
                selectedDayBackgroundColor: themeColors.accent,
                selectedDayTextColor: "#fff",
                todayTextColor: themeColors.accent,
                dayTextColor: themeColors.text,
                arrowColor: themeColors.accent,
                monthTextColor: themeColors.text,
              }}
              style={styles.calendar}
            />
          </View>
        </View>
      </Modal>

      {/* End Date Picker */}
      <Text style={[styles.label, { color: themeColors.text }]}>End Date</Text>
      <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
        <View
          style={[
            styles.inputContainer,
            endDateError ? styles.inputError : null,
            { backgroundColor: themeColors.inputBg, borderColor: themeColors.border },
          ]}
        >
          <TextInput
            style={[styles.inputWithIcon, { color: themeColors.text }]}
            value={formatDateForDisplay(endDate)}
            editable={false}
            placeholder="Select end date"
            placeholderTextColor={themeColors.subText}
          />
          <Icon
            name="calendar-today"
            size={24}
            color={themeColors.accent}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
      {endDateError ? (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {endDateError}
        </Text>
      ) : null}

      {/* End Date Calendar Modal */}
      <Modal
        visible={showEndDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Select End Date
              </Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <Icon name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleEndDatePress}
              markedDates={{
                [moment(endDate).format("YYYY-MM-DD")]: {
                  selected: true,
                  selectedColor: themeColors.accent,
                },
              }}
              minDate={moment(startDate).add(1, "day").format("YYYY-MM-DD")}
              theme={{
                backgroundColor: themeColors.modalBg,
                calendarBackground: themeColors.modalBg,
                textSectionTitleColor: themeColors.subText,
                selectedDayBackgroundColor: themeColors.accent,
                selectedDayTextColor: "#fff",
                todayTextColor: themeColors.accent,
                dayTextColor: themeColors.text,
                arrowColor: themeColors.accent,
                monthTextColor: themeColors.text,
              }}
              style={styles.calendar}
            />
          </View>
        </View>
      </Modal>

      {/* Motivation Input */}
      <Text style={[styles.label, { color: themeColors.text }]}>
        Why this goal? (optional)
      </Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: themeColors.inputBg, color: themeColors.text },
        ]}
        placeholder="Write down your motivation"
        placeholderTextColor={themeColors.subText}
        multiline
        numberOfLines={4}
        value={goalNote}
        onChangeText={setGoalNote}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeColors.accent }]}
        onPress={saveGoalToDatabase}
      >
        <Text style={styles.buttonText}>Save Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    fontSize: 12,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  calendar: {
    borderRadius: 10,
    padding: 10,
  },
});

export default SetGoalsScreen;