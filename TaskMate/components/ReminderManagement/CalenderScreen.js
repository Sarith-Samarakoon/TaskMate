import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  Button,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../ThemeContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import TopBar from "../MenuBars/TopBar";
import { Client, Databases } from "appwrite";
import moment from "moment";

// Appwrite setup
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");
const databases = new Databases(client);
const databaseId = "67de6cb1003c63a59683";
const tasksCollectionId = "67e15b720007d994f573";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState("2025-03-04");
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState("");
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [isPM, setIsPM] = useState(false);
  const [reminderDate, setReminderDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const modalAnim = useRef(new Animated.Value(0)).current;

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
      filterActive: "#007AFF",
      filterInactive: "#CCCCCC",
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
      filterActive: "#40C4FF",
      filterInactive: "#666666",
    },
  };

  const themeColors = colors[theme];

  // Function to open Google Calendar
  const openGoogleCalendar = async () => {
    const deepLink = "googlecalendar://";
    const webUrl = "https://calendar.google.com/calendar/r";

    try {
      // Check if Google Calendar app is installed
      const supported = await Linking.canOpenURL(deepLink);
      if (supported) {
        await Linking.openURL(deepLink);
      } else {
        // Fallback to web version
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error("Error opening Google Calendar:", error);
      Alert.alert(
        "Error",
        "Failed to open Google Calendar. Please ensure the app or browser is available."
      );
    }
  };

  // Function to open Outlook Calendar
  const openOutlookCalendar = async () => {
    const deepLink = "ms-outlook://calendar";
    const webUrl = "https://outlook.live.com/calendar/";

    try {
      // Try deep link first
      const supported = await Linking.canOpenURL(deepLink);
      if (supported) {
        await Linking.openURL(deepLink);
      } else {
        // Fallback to web version
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error("Error opening Outlook Calendar:", error);
      Alert.alert(
        "Error",
        "Failed to open Outlook Calendar. Please ensure the app or browser is available."
      );
    }
  };

  const animateModal = (visible) => {
    Animated.timing(modalAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setModalVisible(false);
      }
    });
  };

  const openModal = () => {
    setModalVisible(true);
    animateModal(true);
  };

  const closeModal = () => {
    animateModal(false);
  };

  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments(
        databaseId,
        tasksCollectionId
      );
      setTasks(response.documents);
      setFilteredTasks(response.documents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const filterTasks = (filterType) => {
    setFilter(filterType);
    if (filterType === "All") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.schedule === filterType));
    }
  };

  const formatDeadline = (deadline) => {
    return moment(deadline).format("MMMM Do YYYY, h:mm a");
  };

  const renderTaskItem = ({ item }) => (
    <View style={[styles.taskItem, { backgroundColor: themeColors.card }]}>
      <View
        style={[
          styles.taskIndicator,
          { backgroundColor: item.color || themeColors.accent },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskTitle, { color: themeColors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.taskTime, { color: themeColors.subText }]}>
          {formatDeadline(item.Deadline)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.reminderButton}
        onPress={() => {
          setSelectedTask(item);
          setReminderDate(selectedDate);
          openModal();
        }}
      >
        <Ionicons name="alarm-outline" size={24} color={themeColors.accent} />
      </TouchableOpacity>
    </View>
  );

  const handleSetReminder = async () => {
    try {
      if (!selectedTask) {
        setError("No task selected.");
        return;
      }

      const parsedHours = parseInt(hours) || 12;
      const parsedMinutes = parseInt(minutes) || 0;

      if (parsedHours < 1 || parsedHours > 12) {
        setError("Hours must be between 1 and 12.");
        return;
      }
      if (parsedMinutes < 0 || parsedMinutes > 59) {
        setError("Minutes must be between 00 and 59.");
        return;
      }

      const adjustedHours = isPM ? (parsedHours % 12) + 12 : parsedHours % 12;
      const reminderDateTime = moment(
        `${reminderDate} ${adjustedHours}:${parsedMinutes}`,
        "YYYY-MM-DD H:mm"
      );
      const deadlineDateTime = moment(selectedTask.Deadline);

      if (!reminderDateTime.isBefore(deadlineDateTime)) {
        setError("Reminder must be set before the task's deadline.");
        return;
      }

      const formattedDateTime = reminderDateTime.format("DD/MM/YYYY h:mm A");
      const isoFormattedDateTime = reminderDateTime.toISOString();
      const isoFormattedDate = reminderDateTime.format("YYYY-MM-DD");
      const isoFormattedSelectedDate = moment(selectedDate, "YYYY-MM-DD")
        .startOf("day")
        .toISOString();

      await databases.createDocument(
        databaseId,
        "67e00a9c0006981492be",
        "unique()",
        {
          TaskTitle: selectedTask.title,
          Date: isoFormattedSelectedDate,
          Note: note || null,
          SetTime: isoFormattedDateTime,
          SetDate: isoFormattedDate,
        }
      );

      alert(`Reminder set for ${selectedTask.title} at ${formattedDateTime}`);
      closeModal();
      setHours("12");
      setMinutes("00");
      setIsPM(false);
      setNote("");
      setReminderDate(moment().format("YYYY-MM-DD"));
      setError("");
    } catch (error) {
      console.error("Error setting reminder:", error);
      setError("Failed to set reminder. Please try again.");
    }
  };

  const today = moment().format("YYYY-MM-DD");

  const handleDayPress = (day) => {
    const selectedDay = moment(day.dateString);
    const deadlineDate = moment(selectedTask?.Deadline);

    if (!selectedTask || !deadlineDate.isValid()) {
      return alert("Please select a valid task with a valid deadline.");
    }

    if (
      selectedDay.isAfter(today, "day") &&
      selectedDay.isSameOrBefore(deadlineDate, "day")
    ) {
      setSelectedDate(day.dateString);
    } else {
      alert("It should be a future date on or before the task's deadline.");
    }
  };

  const handleReminderDayPress = (day) => {
    const selectedDay = moment(day.dateString);
    const deadlineDate = moment(selectedTask?.Deadline);

    if (!selectedTask || !deadlineDate.isValid()) {
      return alert("Please select a valid task with a valid deadline.");
    }

    if (
      selectedDay.isAfter(today, "day") &&
      selectedDay.isSameOrBefore(deadlineDate, "day")
    ) {
      setReminderDate(day.dateString);
    } else {
      alert(
        "It should be a future reminder date on or before the task's deadline."
      );
    }
  };

  return (
    <ScrollView style={{ backgroundColor: themeColors.background }}>
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <TopBar title="Calendar" />

        <View style={styles.header}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Calendar
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Reminder")}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={themeColors.text}
            />
          </TouchableOpacity>
        </View>

        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: themeColors.accent,
            },
          }}
          minDate={today}
          theme={{
            backgroundColor: themeColors.background,
            calendarBackground: themeColors.background,
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

        <View style={styles.filterContainer}>
          {["All", "Daily", "Weekly", "Monthly"].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === filterType
                      ? themeColors.filterActive
                      : themeColors.inputBg,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => filterTasks(filterType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: filter === filterType ? "#FFFFFF" : themeColors.text,
                  },
                ]}
              >
                {filterType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          TASKS
        </Text>
        {loading ? (
          <Text style={[styles.loadingText, { color: themeColors.subText }]}>
            Loading tasks...
          </Text>
        ) : filteredTasks.length === 0 ? (
          <Text style={[styles.loadingText, { color: themeColors.subText }]}>
            No tasks found for this filter.
          </Text>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.$id}
            renderItem={renderTaskItem}
          />
        )}

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          CONNECTED CALENDARS
        </Text>
        <View style={styles.calendarSync}>
          <Text style={[styles.calendarText, { color: themeColors.text }]}>
            Google Calendar
          </Text>
          <TouchableOpacity
            style={[
              styles.calendarButton,
              { backgroundColor: themeColors.accent },
            ]}
            onPress={openGoogleCalendar}
          >
            <Text style={styles.buttonText}>Open</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.calendarSync}>
          <Text style={[styles.calendarText, { color: themeColors.text }]}>
            Outlook
          </Text>
          <TouchableOpacity
            style={[
              styles.calendarButton,
              { backgroundColor: themeColors.accent },
            ]}
            onPress={openOutlookCalendar}
          >
            <Text style={styles.buttonText}>Open</Text>
          </TouchableOpacity>
        </View>

        {/* Reminder Modal */}
        <Modal
          visible={modalVisible}
          animationType="none"
          transparent
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackdrop}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: themeColors.modalBg,
                  transform: [
                    {
                      scale: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                    {
                      translateY: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  opacity: modalAnim,
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text
                    style={[styles.modalTitle, { color: themeColors.text }]}
                  >
                    Set Reminder
                  </Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Ionicons name="close" size={24} color={themeColors.text} />
                  </TouchableOpacity>
                </View>

                {selectedTask && (
                  <View style={styles.taskInfo}>
                    <Text
                      style={[styles.taskInfoText, { color: themeColors.text }]}
                    >
                      Task: {selectedTask.title}
                    </Text>
                    <Text
                      style={[styles.taskInfoText, { color: themeColors.text }]}
                    >
                      Deadline: {formatDeadline(selectedTask.Deadline)}
                    </Text>
                  </View>
                )}

                {error ? (
                  <Text
                    style={[styles.errorText, { color: themeColors.error }]}
                  >
                    {error}
                  </Text>
                ) : null}

                <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                  Reminder Note
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBg,
                      color: themeColors.text,
                      borderColor: error
                        ? themeColors.error
                        : themeColors.border,
                    },
                  ]}
                  placeholder="Add a note..."
                  placeholderTextColor={theme === "dark" ? "#999" : "#666"}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                />

                <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                  Select Reminder Date
                </Text>
                <Calendar
                  onDayPress={handleReminderDayPress}
                  markedDates={{
                    [reminderDate]: {
                      selected: true,
                      selectedColor: themeColors.accent,
                    },
                  }}
                  minDate={today}
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
                  style={[
                    styles.reminderCalendar,
                    { width: SCREEN_WIDTH - 80 },
                  ]}
                />

                <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                  Set Reminder Time
                </Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: themeColors.inputBg,
                        color: themeColors.text,
                        borderColor: error
                          ? themeColors.error
                          : themeColors.border,
                      },
                    ]}
                    keyboardType="numeric"
                    value={hours}
                    onChangeText={(val) => {
                      setHours(val);
                      setError("");
                    }}
                    placeholder="12"
                    maxLength={2}
                  />
                  <Text
                    style={[styles.timeSeparator, { color: themeColors.text }]}
                  >
                    :
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: themeColors.inputBg,
                        color: themeColors.text,
                        borderColor: error
                          ? themeColors.error
                          : themeColors.border,
                      },
                    ]}
                    keyboardType="numeric"
                    value={minutes}
                    onChangeText={(val) => {
                      setMinutes(val);
                      setError("");
                    }}
                    placeholder="00"
                    maxLength={2}
                  />
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      {
                        backgroundColor: !isPM
                          ? themeColors.accent
                          : themeColors.inputBg,
                        borderColor: themeColors.border,
                      },
                    ]}
                    onPress={() => setIsPM(false)}
                  >
                    <Text
                      style={[
                        styles.amPmText,
                        { color: !isPM ? "#FFFFFF" : themeColors.text },
                      ]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      {
                        backgroundColor: isPM
                          ? themeColors.accent
                          : themeColors.inputBg,
                        borderColor: themeColors.border,
                      },
                    ]}
                    onPress={() => setIsPM(true)}
                  >
                    <Text
                      style={[
                        styles.amPmText,
                        { color: isPM ? "#FFFFFF" : themeColors.text },
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.inputBg,
                      },
                    ]}
                    onPress={closeModal}
                  >
                    <Text
                      style={[styles.buttonText, { color: themeColors.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.setButton,
                      { backgroundColor: themeColors.accent },
                    ]}
                    onPress={handleSetReminder}
                  >
                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                      Set Reminder
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 30,
    marginTop: 15,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop:30
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  taskIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  taskTime: {
    fontSize: 12,
    marginTop: 4,
  },
  reminderButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  calendarSync: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },
  calendarText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  calendarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
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
    width: SCREEN_WIDTH - 40,
    maxHeight: "85%",
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
    letterSpacing: 0.3,
  },
  taskInfo: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  taskInfoText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 80,
    lineHeight: 20,
  },
  reminderCalendar: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    overflow: "hidden",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  timeInput: {
    width: 60,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 5,
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  amPmButton: {
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
    minWidth: 60,
    alignItems: "center",
    borderWidth: 1,
  },
  amPmText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 10,
  },
  setButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default CalendarScreen;