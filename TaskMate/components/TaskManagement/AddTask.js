import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Alert,
  Switch,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../ThemeContext";
import TopBar from "../MenuBars/TopBar";
import { useNavigation } from "@react-navigation/native";
import { handleCreateTask } from "../../lib/appwriteConfig"; // Import Appwrite function

const CreateTaskScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("High");
  const [category, setCategory] = useState("Work");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState(null);
  // Add these states
  const [completed, setCompleted] = useState(false);
  const [schedule, setSchedule] = useState("Daily");
  const navigation = useNavigation();

  // Image Picker function
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Please allow access to media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to create a task

  const handleTaskCreation = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required.");
      return;
    }

    try {
      await handleCreateTask(
        title,
        description,
        priority,
        category,
        deadline,
        image,
        completed,
        schedule
      );
      Alert.alert("Success", "Task created successfully!");

      // Navigate to the desired screen (e.g., Screen.js) after task creation
      navigation.navigate("Home"); // Replace "Screen" with your target screen name
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

      {/* Image Picker */}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>
          {image ? "Change Image" : "Add Image"}
        </Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

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
          onValueChange={(itemValue) => setSchedule(itemValue)}
        >
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>
      </View>

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
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDeadline(selectedDate);
          }}
        />
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
  imageButton: {
    marginTop: 12,
    backgroundColor: "#E5E5E5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  imageButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  imagePreview: {
    marginTop: 10,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
});

export default CreateTaskScreen;
