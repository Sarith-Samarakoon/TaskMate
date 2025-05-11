import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // Use native picker
import DateTimePicker from "@react-native-community/datetimepicker";
import { databases } from "../../lib/appwriteConfig";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const UpdateTaskModal = ({
  route,
  navigation,
  isVisible,
  onClose,
  onUpdate,
}) => {
  const { task, theme } = route.params;
  const isDark = theme === "dark";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("High");
  const [category, setCategory] = useState("Work"); // Fixed capitalization
  const [deadline, setDeadline] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [schedule, setSchedule] = useState("Daily");
  const [completed, setCompleted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isVisible && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "High");
      setCategory(task.Category || "Work");
      setSchedule(task.schedule || "Daily");
      setCompleted(task.completed || false);
      const deadlineDate = task.Deadline ? new Date(task.Deadline) : new Date();
      setDeadline(deadlineDate);
      setTime(
        task.Deadline && task.schedule?.toLowerCase() === "daily"
          ? new Date(task.Deadline)
          : new Date()
      );
    }
  }, [isVisible, task]);

  const updateTask = async () => {
    if (!task?.$id) {
      Alert.alert("Error", "Invalid task data.");
      return;
    }

    const finalDeadline = schedule === "Daily" ? time : deadline;

    try {
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573",
        task.$id,
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          Category: category, // Fixed capitalization
          Deadline: finalDeadline.toISOString(),
          completed,
          schedule,
          skipCount: task.skipCount || 0,
        }
      );

      Alert.alert("Success", "Task updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task.");
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.modalBackdrop, isDark && styles.darkBackdrop]}>
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, isDark && styles.darkModalContent]}
          >
            {/* Header */}
            <View
              style={[styles.modalHeader, isDark && styles.darkModalHeader]}
            >
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Update Task
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#aaa" : "#666"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {/* Title Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.darkLabel]}>
                  Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  placeholder="Enter task title"
                  placeholderTextColor={isDark ? "#777" : "#aaa"}
                  style={[
                    styles.input,
                    isDark && styles.darkInput,
                    !title.trim() && styles.inputError,
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus={true}
                />
                {!title.trim() && (
                  <Text style={styles.errorText}>Title is required</Text>
                )}
              </View>

              {/* Description Field */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.darkLabel]}>
                  Description
                </Text>
                <TextInput
                  placeholder="Enter task description (optional)"
                  placeholderTextColor={isDark ? "#777" : "#aaa"}
                  style={[styles.textArea, isDark && styles.darkInput]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Priority and Category Row */}
              <View style={styles.row}>
                {/* Priority Picker */}
                <View style={styles.pickerContainer}>
                  <Text style={[styles.label, isDark && styles.darkLabel]}>
                    Priority
                  </Text>
                  <Picker
                    selectedValue={priority}
                    style={[styles.picker, isDark && styles.darkPicker]}
                    onValueChange={(itemValue) => setPriority(itemValue)}
                  >
                    <Picker.Item label="High" value="High" />
                    <Picker.Item label="Medium" value="Medium" />
                    <Picker.Item label="Low" value="Low" />
                  </Picker>
                </View>
                {/* Category Picker */}
                <View style={styles.pickerContainer}>
                  <Text style={[styles.label, isDark && styles.darkLabel]}>
                    Category
                  </Text>
                  <Picker
                    selectedValue={category}
                    style={[styles.picker, isDark && styles.darkPicker]}
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
                <Text style={[styles.label, isDark && styles.darkLabel]}>
                  Schedule
                </Text>
                <Picker
                  selectedValue={schedule}
                  style={[styles.picker, isDark && styles.darkPicker]}
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

              {/* Time/Date Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.darkLabel]}>
                  {schedule === "Daily" ? "Time" : "Deadline"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    isDark && styles.darkDateTimeButton,
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      schedule === "Daily" ? "time-outline" : "calendar-outline"
                    }
                    size={20}
                    color={isDark ? "#aaa" : "#666"}
                    style={styles.dateTimeIcon}
                  />
                  <Text
                    style={[styles.dateTimeText, isDark && styles.darkText]}
                  >
                    {schedule === "Daily"
                      ? time.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : deadline.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? "#aaa" : "#666"}
                  />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={schedule === "Daily" ? time : deadline}
                    mode={schedule === "Daily" ? "time" : "date"}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        schedule === "Daily"
                          ? setTime(selectedDate)
                          : setDeadline(selectedDate);
                      }
                    }}
                    themeVariant={isDark ? "dark" : "light"}
                  />
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View
              style={[styles.modalButtons, isDark && styles.darkModalButtons]}
            >
              <TouchableOpacity
                style={[styles.cancelButton, isDark && styles.darkCancelButton]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    isDark && styles.darkCancelButtonText,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !title.trim() && styles.saveButtonDisabled,
                ]}
                onPress={updateTask}
                disabled={!title.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  darkBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: 500,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  darkModalContent: {
    backgroundColor: "#1e1e1e",
    shadowColor: "#000",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  darkModalHeader: {
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
  scrollContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 5,
    color: "#555",
  },
  darkLabel: {
    color: "#ddd",
  },
  required: {
    color: "#ff4444",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  darkInput: {
    backgroundColor: "#2a2a2a",
    borderColor: "#333",
    color: "#fff",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    height: 100,
    textAlignVertical: "top",
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
    backgroundColor: "#424242",
    borderRadius: 10,
  },
  darkPicker: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  darkDateTimeButton: {
    backgroundColor: "#2a2a2a",
    borderColor: "#333",
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    flex: 1,
    color: "#000",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  darkModalButtons: {
    borderTopColor: "#333",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  darkCancelButton: {
    backgroundColor: "#333",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  darkCancelButtonText: {
    color: "#ddd",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
});

export default UpdateTaskModal;
