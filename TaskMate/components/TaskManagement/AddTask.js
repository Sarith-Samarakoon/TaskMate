import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { handleCreateTask } from "../../lib/appwriteConfig";

const CreateTaskScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("High");
  const [category, setCategory] = useState("Work");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [schedule, setSchedule] = useState("Daily");
  const [time, setTime] = useState(new Date());
  const navigation = useNavigation();

  // Helper to get current date without time for comparison
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Function to create a task
  const handleTaskCreation = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required.");
      return;
    }

    // Validate time for Daily schedule
    if (schedule === "Daily" && time < new Date()) {
      Alert.alert("Validation Error", "Please select a future time for today.");
      return;
    }

    const finalDeadline = schedule === "Daily" ? time : deadline;

    try {
      await handleCreateTask(
        title,
        description,
        priority,
        category,
        finalDeadline,
        completed,
        schedule
      );
      Alert.alert("Success", "Task created successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Task Creation Error:", error);
      Alert.alert("Error", "Failed to create task.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#ffffff" },
      ]}
    >
      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Title
      </Text>
      <TextInput
        placeholder="Enter task title"
        placeholderTextColor="#aaa"
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Description
      </Text>
      <TextInput
        placeholder="Enter task description"
        placeholderTextColor="#aaa"
        style={[
          styles.textArea,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <View style={styles.row}>
        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
            Priority
          </Text>
          <Picker
            selectedValue={priority}
            style={styles.picker}
            onValueChange={(itemValue) => setPriority(itemValue)}
          >
            <Picker.Item label="High" value="High" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Low" value="Low" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
            Category
          </Text>
          <Picker
            selectedValue={category}
            style={styles.picker}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            <Picker.Item label="Work" value="Work" />
            <Picker.Item label="Personal" value="Personal" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
      </View>

      {/* Schedule Picker */}
      <View style={styles.pickerContainer}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Schedule
        </Text>
        <Picker
          selectedValue={schedule}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setSchedule(itemValue);
            if (itemValue !== "Daily") setTime(new Date());
          }}
        >
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>
      </View>

      {/* Time or Deadline Picker */}
      {schedule === "Daily" ? (
        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
            Time
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2",
                justifyContent: "center",
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              {time.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={new Date()}
              onChange={(event, selectedTime) => {
                setShowDatePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}
        </View>
      ) : (
        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
            Deadline
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2",
                justifyContent: "center",
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              {deadline.toDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={getTodayDate()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDeadline(selectedDate);
              }}
            />
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleTaskCreation}
      >
        <Text style={styles.createButtonText}>Create Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
    marginTop: 10,
  },
  picker: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
  },
  createButton: {
    marginTop: 30,
    backgroundColor: "#2F66F8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default CreateTaskScreen;
