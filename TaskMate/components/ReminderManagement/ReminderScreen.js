import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import TopBar from "../MenuBars/TopBar"; // Importing the new TopBar

const remindersData = {
  today: "Feb 15, 2025",
  tomorrow: [
    { id: "1", title: "Client Call", note: "Set your reminder", color: "#3B82F6" },
    { id: "2", title: "Grocery Shopping", note: "Set your reminder", color: "#8B5CF6" },
    { id: "3", title: "Watch AVATAR Movie", note: "Set your reminder", color: "#9CA3AF" },
  ],
  upcoming: [
    { id: "4", title: "Flownuet Project Meeting", date: "Feb 19, 2025", color: "#16A34A" },
    { id: "5", title: "Doctor’s Appointment", date: "Feb 27, 2025", color: "#F59E0B" },
  ],
  missed: [
    { id: "6", title: "Call to CEO", time: "Yesterday 8:15 AM - 9:00 AM", color: "#3B82F6" },
    { id: "7", title: "Grocery Shopping", time: "Feb 12, 2025 11:00 AM - 2:00 PM", color: "#8B5CF6" },
  ],
};

const ReminderScreen = () => {
  const [reminders, setReminders] = useState(remindersData);
  const navigation = useNavigation(); // Get navigation object

  return (
    <View style={styles.container}>
        <TopBar title="Reminder" />
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}> {/* Back button */}
          <Ionicons name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>TODAY - {reminders.today}</Text>
        <TouchableOpacity>
          <Text style={styles.viewCalendar}>View Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Tomorrow Section */}
      <Text style={styles.sectionTitle}>TOMORROW</Text>
      <FlatList
        data={reminders.tomorrow}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderItem title={item.title} note={item.note} color={item.color} />
        )}
      />

      {/* Upcoming Section */}
      <View style={styles.upcomingHeader}>
        <Text style={styles.sectionTitle}>UPCOMING</Text>
        <TouchableOpacity>
          <Text style={styles.allReminders}>All Reminders ▼</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={reminders.upcoming}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderItem title={item.title} date={item.date} color={item.color} />
        )}
      />

      {/* Missed Section */}
      <Text style={styles.missedTitle}>MISSED</Text>
      <FlatList
        data={reminders.missed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderItem title={item.title} time={item.time} color={item.color} missed />
        )}
      />
    </View>
  );
};

const ReminderItem = ({ title, note, date, time, color, missed }) => (
  <View style={[styles.reminderItem, missed && styles.missedItem]}>
    <View style={styles.reminderInfo}>
      <View style={[styles.colorDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.reminderTitle}>{title}</Text>
        {note && <Text style={styles.reminderNote}>{note}</Text>}
        {date && <Text style={styles.reminderDate}>{date}</Text>}
        {time && <Text style={styles.reminderTime}>{time}</Text>}
      </View>
    </View>

    <View style={styles.icons}>
      {!missed && (
        <>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </>
      )}
      {missed && (
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",

  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B7280",
  },
  viewCalendar: {
    color: "#2563EB",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  allReminders: {
    color: "#2563EB",
  },
  missedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    marginTop: 20,
    marginBottom: 10,
  },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  missedItem: {
    backgroundColor: "#FEE2E2",
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  reminderNote: {
    fontSize: 14,
    color: "#6B7280",
  },
  reminderDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  reminderTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  icons: {
    flexDirection: "row",
    gap: 10,
  },
});

export default ReminderScreen;
