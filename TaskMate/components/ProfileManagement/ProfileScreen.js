import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

const CalendarScreen = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [selectedDate, setSelectedDate] = useState("2025-03-04");
  const [googleSync, setGoogleSync] = useState(true);
  const [outlookSync, setOutlookSync] = useState(false);
  const { theme } = useTheme();

  const events = [
    { id: "1", title: "Flownuet Project Meeting", time: "8:15 AM - 9:00 AM", color: "#34A853" },
    { id: "2", title: "Team Meeting Reminder", time: "8:15 AM - 9:00 AM", color: "#FBBC05" },
    { id: "3", title: "Project Review", time: "8:15 AM - 9:00 AM", color: "#A142F4" },
  ];

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Calendar</Text>

        {/* Reminder Button (Navigates to ReminderScreen) */}
        <TouchableOpacity onPress={() => navigation.navigate("ReminderScreen")}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Calendar Component */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: "#007AFF" } }}
        theme={{
          selectedDayBackgroundColor: "#007AFF",
          todayTextColor: "#007AFF",
          arrowColor: "#007AFF",
        }}
      />

      {/* Today's Tasks */}
      <Text style={styles.sectionTitle}>TODAY'S TASKS</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={[styles.taskIndicator, { backgroundColor: item.color }]} />
            <View>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      {/* Connected Calendars */}
      <Text style={styles.sectionTitle}>CONNECTED CALENDARS</Text>
      <View style={styles.calendarSync}>
        <Text style={styles.calendarText}>Google Calendar</Text>
        <Switch value={googleSync} onValueChange={setGoogleSync} />
      </View>
      <View style={styles.calendarSync}>
        <Text style={styles.calendarText}>Outlook</Text>
        <Switch value={outlookSync} onValueChange={setOutlookSync} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 15, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", margin: 15 },
  taskItem: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 8 },
  taskIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  taskTitle: { fontSize: 16, fontWeight: "bold" },
  taskTime: { fontSize: 14, color: "#555" },
  calendarSync: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 8 },
  calendarText: { fontSize: 16 },
});

export default CalendarScreen;
