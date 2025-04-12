import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../MenuBars/TopBar";
import { Client, Databases } from "appwrite";
import moment from "moment";
import DatePicker from "react-native-date-picker";

// Appwrite setup
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");
const databases = new Databases(client);
const databaseId = "67de6cb1003c63a59683";
const tasksCollectionId = "67e15b720007d994f573";

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState("2025-03-04");
  const [googleSync, setGoogleSync] = useState(true);
  const [outlookSync, setOutlookSync] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [note, setNote] = useState("");
  const [time, setTime] = useState(new Date());
  const [isPM, setIsPM] = useState(false);

  const colors = {
    light: {
      background: "#F5F5F5",
      card: "#FFFFFF",
      text: "#000000",
      subText: "#757575",
      accent: "#007AFF",
      modalBg: "#FFFFFF",
      inputBg: "#F5F7FA",
    },
    dark: {
      background: "#121212",
      card: "#1E1E1E",
      text: "#FFFFFF",
      subText: "#AAAAAA",
      accent: "#007AFF",
      modalBg: "#2C2C2C",
      inputBg: "#2C2C2C",
    },
  };

  const themeColors = colors[theme];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments(
        databaseId,
        tasksCollectionId
      );
      setTasks(response.documents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      setLoading(false);
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
          setModalVisible(true);
        }}
      >
        <Ionicons name="alarm-outline" size={24} color={themeColors.accent} />
      </TouchableOpacity>
    </View>
  );

  const handleSetReminder = async () => {
    try {
      if (!selectedTask) return alert("No task selected.");
      const formattedTime = moment(time).format("HH:mm");

      await databases.createDocument(
        databaseId,
        "67e00a9c0006981492be",
        "unique()",
        {
          TaskTitle: selectedTask.title,
          Date: selectedDate,
          Note: note,
          SetTime: formattedTime,
        }
      );

      alert(
        `Reminder set for ${selectedTask.title} at ${formattedTime} on ${selectedDate}`
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error setting reminder:", error);
      alert("Failed to set reminder.");
    }
  };

  const today = moment().format("YYYY-MM-DD");

  const handleDayPress = (day) => {
    const selectedDay = moment(day.dateString);
    if (selectedDay.isAfter(today, "day")) {
      setSelectedDate(day.dateString);
    } else {
      alert("You can only select future dates.");
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
          style={styles.calender}
        />

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          TODAY'S TASKS
        </Text>
        {loading ? (
          <Text style={[styles.loadingText, { color: themeColors.subText }]}>
            Loading tasks...
          </Text>
        ) : (
          <FlatList
            data={tasks}
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
          <Switch value={googleSync} onValueChange={setGoogleSync} />
        </View>
        <View style={styles.calendarSync}>
          <Text style={[styles.calendarText, { color: themeColors.text }]}>
            Outlook
          </Text>
          <Switch value={outlookSync} onValueChange={setOutlookSync} />
        </View>

        {/* Reminder Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: themeColors.modalBg },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                  🔔 Set Reminder
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={themeColors.text} />
                </TouchableOpacity>
              </View>

              {selectedTask && (
                <>
                  <Text style={{ fontWeight: "bold", color: themeColors.text }}>
                    Title: {selectedTask.title}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginTop: 15,
                      color: themeColors.text,
                    }}
                  >
                    Deadline: {formatDeadline(selectedTask.Deadline)}
                  </Text>
                </>
              )}

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBg,
                    color: themeColors.text,
                  },
                ]}
                placeholder="Add a note..."
                placeholderTextColor={theme === "dark" ? "#999" : "#666"}
                value={note}
                onChangeText={setNote}
              />

              <Text
                style={{
                  fontWeight: "bold",
                  marginTop: 15,
                  color: themeColors.text,
                }}
              >
                Set Time
              </Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: themeColors.inputBg,
                      color: themeColors.text,
                    },
                  ]}
                  keyboardType="numeric"
                  value={time.getHours().toString().padStart(2, "0")}
                  onChangeText={(val) => {
                    const newTime = new Date(time);
                    newTime.setHours(parseInt(val) || 0);
                    setTime(newTime);
                  }}
                />
                <Text
                  style={[
                    {
                      fontSize: 18,
                      fontWeight: "bold",
                      color: themeColors.text,
                    },
                  ]}
                >
                  :
                </Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: themeColors.inputBg,
                      color: themeColors.text,
                    },
                  ]}
                  keyboardType="numeric"
                  value={time.getMinutes().toString().padStart(2, "0")}
                  onChangeText={(val) => {
                    const newTime = new Date(time);
                    newTime.setMinutes(parseInt(val) || 0);
                    setTime(newTime);
                  }}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: !isPM ? "#FFEB3B" : "#E0E0E0",
                    padding: 8,
                    borderRadius: 5,
                    marginLeft: 10,
                  }}
                  onPress={() => setIsPM(false)}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: !isPM ? "blue" : "black",
                    }}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: isPM ? "#FFEB3B" : "#E0E0E0",
                    padding: 8,
                    borderRadius: 5,
                    marginLeft: 5,
                  }}
                  onPress={() => setIsPM(true)}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: isPM ? "blue" : "black",
                    }}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#3D5AFE",
                  padding: 15,
                  borderRadius: 5,
                  marginTop: 15,
                  alignItems: "center",
                }}
                onPress={handleSetReminder}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Set Reminder
                </Text>
              </TouchableOpacity>
            </View>
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
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  addButton: { padding: 10, borderRadius: 5 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  taskIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  taskTitle: { fontSize: 14, fontWeight: "bold" },
  taskTime: { fontSize: 12 },
  reminderButton: { justifyContent: "center", alignItems: "center" },
  calendarSync: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  calendarText: { fontSize: 14, fontWeight: "bold" },
  loadingText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { padding: 20, borderRadius: 10 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  input: { padding: 10, borderRadius: 5, marginTop: 10 },
  timeInputRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  timeInput: {
    width: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 5,
  },
});

export default CalendarScreen;
