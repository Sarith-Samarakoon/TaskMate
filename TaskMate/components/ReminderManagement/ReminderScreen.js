import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../MenuBars/TopBar";
import { databases } from "../../lib/appwriteConfig";

import { useTheme } from "../ThemeContext"; // Import the useTheme hook

const DATABASE_ID = "67de6cb1003c63a59683";
const COLLECTION_ID = "67e00a9c0006981492be";

const ReminderItem = ({
  title,
  note,
  date,
  time,
  color,
  id,
  handleDelete,
  handleUpdate,
  showUpdateButton,
  missed,
}) => {
  return (
    <View style={styles.reminderItem}>
      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{title}</Text>
        {date && <Text style={styles.reminderDate}>{date}</Text>}
        {time && <Text style={styles.reminderTime}>{time}</Text>}
        {note && <Text style={styles.reminderNote}>{note}</Text>}
      </View>
      <View style={styles.reminderActions}>
        {!missed && showUpdateButton && (
          <TouchableOpacity
            onPress={() => handleUpdate(id)}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleDelete(id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ReminderScreen = () => {
  const [reminders, setReminders] = useState({
    today: "FEB 15, 2025",
    tomorrow: [
      {
        id: "1",
        title: "Client Call",
        note: "Set your reminder",
        color: "#3B82F6",
      },
      {
        id: "2",
        title: "Grocery Shopping",
        note: "Set your reminder",
        color: "#8B5CF6",
      },
      {
        id: "3",
        title: "Watch AVATAR Movie",
        note: "Set your reminder",
        color: "#EC4899",
      },
    ],
    upcoming: [
      {
        id: "4",
        title: "Flowunet Project Meeting",
        date: "FEB 19, 2025",
        color: "#16A34A",
      },
      {
        id: "5",
        title: "Doctor's Appointment",
        date: "FEB 27, 2025",
        color: "#F59E0B",
      },
    ],
    missed: [
      {
        id: "6",
        title: "Call to CEO",
        time: "YESTERDAY 8:15 AM - 9:00 AM",
        color: "#EF4444",
      },
      {
        id: "7",
        title: "Grocery Shopping",
        time: "FEB 12, 2025 11:00 AM - 2:00 PM",
        color: "#8B5CF6",
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [updatedNote, setUpdatedNote] = useState("");
  const [updatedTime, setUpdatedTime] = useState(new Date());
  const [isPM, setIsPM] = useState(false);
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState("");

  // Get the current theme
  const { theme } = useTheme();

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toDateString()); // Example: "Wed, Mar 26, 2025"
  }, []);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID
      );
      const fetchedReminders = response.documents.map((doc) => ({
        id: doc.$id,
        title: doc.TaskTitle,
        note: doc.Note,
        date: doc.Date,
        time: new Date(doc.SetTime),
        color: "#3B82F6",
      }));

      setReminders((prev) => ({ ...prev, tomorrow: fetchedReminders }));
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setReminders((prev) => ({
        ...prev,
        tomorrow: prev.tomorrow.filter((item) => item.id !== id),
        upcoming: prev.upcoming.filter((item) => item.id !== id),
        missed: prev.missed.filter((item) => item.id !== id),
      }));
      console.log("Reminder deleted successfully!");
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleUpdate = (id) => {
    const reminder = [
      ...reminders.tomorrow,
      ...reminders.upcoming,
      ...reminders.missed,
    ].find((reminder) => reminder.id === id);

    setSelectedReminder(reminder);
    setUpdatedNote(reminder.note);
    setUpdatedTime(new Date(reminder.time));
    setIsPM(reminder.time.getHours() >= 12);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!updatedNote || !updatedTime) {
      alert("Both note and time must be filled");
      return;
    }

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        selectedReminder.id,
        {
          Note: updatedNote,
          SetTime: updatedTime.toISOString(),
        }
      );

      setReminders((prev) => {
        const updatedReminders = {
          ...prev,
          tomorrow: prev.tomorrow.map((item) =>
            item.id === selectedReminder.id
              ? { ...item, note: updatedNote, time: updatedTime }
              : item
          ),
          upcoming: prev.upcoming.map((item) =>
            item.id === selectedReminder.id
              ? { ...item, note: updatedNote, time: updatedTime }
              : item
          ),
          missed: prev.missed.map((item) =>
            item.id === selectedReminder.id
              ? { ...item, note: updatedNote, time: updatedTime }
              : item
          ),
        };

        return updatedReminders;
      });

      setModalVisible(false);
      console.log("Reminder updated successfully!");
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  const handleTimeChange = (value, part) => {
    const newTime = new Date(updatedTime);
    if (part === "hours") {
      newTime.setHours(value);
    } else if (part === "minutes") {
      newTime.setMinutes(value);
    }
    setUpdatedTime(newTime);
  };

  return (
    <View style={[styles.container1, theme === "dark" && styles.darkContainer]}>
      <TopBar title="Reminder" />
      <View
        style={[styles.container, theme === "dark" && styles.darkContainer]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>

        <Text
          style={[styles.headerText, theme === "dark" && styles.darkHeaderText]}
        >
          TODAY - {currentDate}
        </Text>

        <Text
          style={[styles.sectionTitle, theme === "dark" && styles.darkText]}
        >
          TOMORROW
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme === "dark" ? "#3B82F6" : "#3B82F6"}
          />
        ) : (
          <FlatList
            data={reminders.tomorrow}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReminderItem
                title={item.title}
                note={item.note}
                color={item.color}
                id={item.id}
                handleDelete={handleDelete}
                handleUpdate={handleUpdate}
                showUpdateButton
              />
            )}
          />
        )}

        <Text
          style={[styles.sectionTitle, theme === "dark" && styles.darkText]}
        >
          UPCOMING
        </Text>
        <FlatList
          data={reminders.upcoming}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderItem
              title={item.title}
              date={item.date}
              color={item.color}
              id={item.id}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              showUpdateButton
            />
          )}
        />

        <Text
          style={[styles.sectionTitle, theme === "dark" && styles.darkText]}
        >
          MISSED
        </Text>
        <FlatList
          data={reminders.missed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderItem
              title={item.title}
              time={item.time}
              color={item.color}
              missed
              id={item.id}
              handleDelete={handleDelete}
            />
          )}
        />

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                theme === "dark" && styles.darkModal,
              ]}
            >
              <Text
                style={[styles.modalTitle, theme === "dark" && styles.darkText]}
              >
                Update Reminder
              </Text>
              <TextInput
                style={[styles.input, theme === "dark" && styles.darkInput]}
                value={updatedNote}
                onChangeText={setUpdatedNote}
                placeholder="Note"
              />
              {/* Time Picker */}
              <View style={styles.timePicker}>
                <TextInput
                  style={[
                    styles.timeInput,
                    theme === "dark" && styles.darkInput,
                  ]}
                  value={updatedTime.getHours().toString().padStart(2, "0")}
                  keyboardType="numeric"
                  onChangeText={(val) =>
                    handleTimeChange(parseInt(val), "hours")
                  }
                />
                <Text style={styles.colon}>:</Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    theme === "dark" && styles.darkInput,
                  ]}
                  value={updatedTime.getMinutes().toString().padStart(2, "0")}
                  keyboardType="numeric"
                  onChangeText={(val) =>
                    handleTimeChange(parseInt(val), "minutes")
                  }
                />
                <TouchableOpacity
                  onPress={() => setIsPM(!isPM)}
                  style={[
                    styles.amPmButton,
                    theme === "dark" && styles.darkButton,
                  ]}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: isPM ? "blue" : "black",
                    }}
                  >
                    {isPM ? "PM" : "AM"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                <Button title="Save" onPress={handleSave} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: "#fff",
  },
  darkContainer: {
    backgroundColor: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  darkText: {
    color: "#fff",
  },
  darkHeaderText: {
    color: "#fff",
  },
  darkInput: {
    backgroundColor: "#444",
    color: "#fff",
  },
  darkModal: {
    backgroundColor: "#444",
  },
  darkButton: {
    backgroundColor: "#666",
  },
  backButton: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reminderDate: {
    fontSize: 14,
  },
  reminderTime: {
    fontSize: 14,
  },
  reminderNote: {
    fontSize: 12,
    color: "#6B7280",
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  timePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  timeInput: {
    width: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    textAlign: "center",
  },
  colon: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
  },
  amPmButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default ReminderScreen;
