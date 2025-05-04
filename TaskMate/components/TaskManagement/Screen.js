import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
} from "react-native";
import { getCurrentUser, databases } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Voice from "@react-native-voice/voice";

const Screen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("View All");
  const [tasks, setTasks] = useState([]);
  const { theme } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState("All");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceResult, setVoiceResult] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigation.replace("Auth");
      } else {
        setUser(currentUser);
        fetchTasks();
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573"
      );
      setTasks(response.documents);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const startVoiceRecognition = async () => {
    try {
      await Voice.start("en-US");
      setIsVoiceActive(true);
    } catch (e) {
      console.error("Error starting voice recognition:", e);
      Alert.alert("Error", "Could not start voice recognition.");
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsVoiceActive(false);
    } catch (e) {
      console.error("Error stopping voice recognition:", e);
    }
  };

  const handleVoiceCommand = async (command) => {
    if (!command) return;

    if (command.includes("mark all tasks as completed")) {
      try {
        const updatePromises = tasks.map((task) =>
          databases.updateDocument(
            "67de6cb1003c63a59683",
            "67e15b720007d994f573",
            task.$id,
            { completed: true }
          )
        );
        await Promise.all(updatePromises);
        fetchTasks();
        Alert.alert("Success", "All tasks marked as completed.");
      } catch (error) {
        console.error("Error marking all tasks as completed:", error);
        Alert.alert("Error", "Failed to mark all tasks as completed.");
      }
    } else if (command.includes("mark task")) {
      const taskTitle = command
        .replace("mark task", "")
        .replace("as completed", "")
        .trim();
      const task = tasks.find((t) => t.title.toLowerCase().includes(taskTitle));
      if (task) {
        await markTaskAsCompleted(task.$id);
        Alert.alert("Success", `Task "${task.title}" marked as completed.`);
      } else {
        Alert.alert("Error", `Task "${taskTitle}" not found.`);
      }
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return { backgroundColor: "#FFE0E0", color: "#FF4D4F" };
      case "Medium":
        return { backgroundColor: "#FFF7D6", color: "#FFA500" };
      case "Low":
        return { backgroundColor: "#DFFFE0", color: "#52C41A" };
      default:
        return { backgroundColor: "#eee", color: "#333" };
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (activeTab === "View All" ||
        (activeTab === "Completed" && task.completed === true) ||
        (activeTab === "In-progress" && task.completed === false)) &&
      (selectedSchedule === "All" ||
        (task.schedule &&
          task.schedule.toLowerCase() === selectedSchedule.toLowerCase()))
  );

  const deleteTask = async (taskId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573",
        taskId
      );
      setTasks((prevTasks) => prevTasks.filter((task) => task.$id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const markTaskAsCompleted = async (taskId) => {
    try {
      const task = tasks.find((t) => t.$id === taskId);
      const newCompletedStatus = !task.completed; // Toggle the completed status
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573",
        taskId,
        { completed: newCompletedStatus }
      );
      fetchTasks();
    } catch (error) {
      console.error("Error updating task completion status:", error);
    }
  };

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setTaskToEdit(null);
  };

  const updateTask = async () => {
    if (!taskToEdit) return;
    try {
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573",
        taskToEdit.$id,
        {
          title: taskToEdit.title,
          description: taskToEdit.description,
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          Deadline: taskToEdit.Deadline,
          completed: taskToEdit.completed, // Ensure completed status is included
          schedule: taskToEdit.schedule,
        }
      );
      fetchTasks();
      closeEditModal();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const selectScheduleFilter = (schedule) => {
    setSelectedSchedule(schedule);
    setFilterModalVisible(false);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#FFD700" : "#007AFF"}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#121212" : "#F8FAFF" },
      ]}
    >
      <TopBar title="Tasks" />

      <View style={styles.summaryRow}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme === "dark" ? "#E5EDFF" : "#E5EDFF" },
          ]}
        >
          <Text style={styles.summaryTitle}>Total</Text>
          <Text style={styles.summaryValue}>{tasks.length}</Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme === "dark" ? "#DFFFE0" : "#DFFFE0" },
          ]}
        >
          <Text style={styles.summaryTitle}>Completed</Text>
          <Text style={styles.summaryValue}>
            {tasks.filter((task) => task.completed === true).length}
          </Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme === "dark" ? "#FFE0E0" : "#FFE0E0" },
          ]}
        >
          <Text style={styles.summaryTitle}>In-progress</Text>
          <Text style={styles.summaryValue}>
            {tasks.filter((task) => task.completed === false).length}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme === "dark" ? "#333" : "#fff" },
        ]}
      >
        <TextInput
          placeholder="Search Task"
          placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
          style={[
            styles.searchInput,
            { color: theme === "dark" ? "#fff" : "#333" },
          ]}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <Ionicons
          name="search"
          size={20}
          color={theme === "dark" ? "#fff" : "#999"}
        />
      </View>

      <View style={styles.voiceControlContainer}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            { backgroundColor: isVoiceActive ? "#FF4D4F" : "#1E88E5" },
          ]}
          onPress={isVoiceActive ? stopVoiceRecognition : startVoiceRecognition}
        >
          <Ionicons
            name={isVoiceActive ? "mic-off" : "mic"}
            size={24}
            color="#fff"
          />
          <Text style={styles.voiceButtonText}>
            {isVoiceActive ? "Stop Voice" : "Start Voice"}
          </Text>
        </TouchableOpacity>
        {voiceResult ? (
          <Text
            style={[
              styles.voiceResult,
              { color: theme === "dark" ? "#ccc" : "#555" },
            ]}
          >
            Recognized: {voiceResult}
          </Text>
        ) : null}
      </View>

      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("View All")}>
            <Text
              style={[
                styles.viewAllText,
                { color: theme === "dark" ? "#007AFF" : "#007AFF" },
              ]}
            >
              View All
            </Text>
          </TouchableOpacity>
          {["In-progress", "Completed"].map((tab) => {
            const isActive = activeTab === tab;
            const isDark = theme === "dark";

            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabBase,
                  isActive
                    ? { backgroundColor: "#1E88E5" }
                    : isDark
                    ? { backgroundColor: "#2C2C2C" }
                    : { backgroundColor: "#F0F0F0" },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive
                        ? "#FFFFFF"
                        : isDark
                        ? "#CCCCCC"
                        : "#666666",
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterModal}
        >
          <Ionicons
            name="filter"
            size={20}
            color={theme === "dark" ? "#fff" : "#333"}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: theme === "dark" ? "#fff" : "#333" },
            ]}
          >
            {selectedSchedule}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>
            No tasks found
          </Text>
        ) : (
          filteredTasks.map((task, index) => {
            const priorityStyle = getPriorityStyle(task.priority);
            return (
              <View
                key={index}
                style={[
                  styles.taskCard,
                  { backgroundColor: theme === "dark" ? "#2E2E2E" : "#fff" },
                ]}
              >
                <View style={styles.taskHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: theme === "dark" ? "#fff" : "#333" },
                    ]}
                  >
                    ○ {task.title}
                  </Text>
                  <Text
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: priorityStyle.backgroundColor,
                        color: priorityStyle.color,
                      },
                    ]}
                  >
                    {task.priority}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.taskDescription,
                    { color: theme === "dark" ? "#ccc" : "#555" },
                  ]}
                >
                  {task.description}
                </Text>
                <View style={styles.taskFooter}>
                  <View style={styles.taskDate}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={theme === "dark" ? "#fff" : "#666"}
                    />
                    <Text
                      style={[
                        styles.dateText,
                        { color: theme === "dark" ? "#ccc" : "#666" },
                      ]}
                    >
                      {task.Deadline}
                    </Text>
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => markTaskAsCompleted(task.$id)}
                    >
                      <MaterialIcons
                        name={
                          task.completed
                            ? "check-circle"
                            : "check-circle-outline"
                        }
                        size={24}
                        color={
                          task.completed
                            ? "#52C41A"
                            : theme === "dark"
                            ? "#fff"
                            : "#333"
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => openEditModal(task)}
                    >
                      <MaterialIcons
                        name="edit"
                        size={24}
                        color={theme === "dark" ? "#fff" : "#333"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteTask(task.$id)}
                    >
                      <MaterialIcons
                        name="delete"
                        size={24}
                        color={theme === "dark" ? "#fff" : "#333"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Task</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                },
              ]}
              placeholder="Title"
              value={taskToEdit?.title}
              onChangeText={(text) =>
                setTaskToEdit({ ...taskToEdit, title: text })
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                },
              ]}
              placeholder="Description"
              value={taskToEdit?.description}
              onChangeText={(text) =>
                setTaskToEdit({ ...taskToEdit, description: text })
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                },
              ]}
              placeholder="Priority"
              value={taskToEdit?.priority}
              onChangeText={(text) =>
                setTaskToEdit({ ...taskToEdit, priority: text })
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                },
              ]}
              placeholder="Deadline"
              value={taskToEdit?.Deadline}
              onChangeText={(text) =>
                setTaskToEdit({ ...taskToEdit, Deadline: text })
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme === "dark" ? "#333" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                },
              ]}
              placeholder="Schedule"
              value={taskToEdit?.schedule}
              onChangeText={(text) =>
                setTaskToEdit({ ...taskToEdit, schedule: text })
              }
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={closeEditModal} />
              <Button title="Save" onPress={updateTask} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFilterModalVisible}
        animationType="fade"
        transparent={true}
      >
        <TouchableOpacity
          style={styles.filterModalOverlay}
          onPress={toggleFilterModal}
        >
          <View
            style={[
              styles.filterModalContent,
              {
                backgroundColor: theme === "dark" ? "#2E2E2E" : "#fff",
              },
            ]}
          >
            {["All", "Daily", "Weekly", "Monthly"].map((schedule) => (
              <TouchableOpacity
                key={schedule}
                style={styles.filterOption}
                onPress={() => selectScheduleFilter(schedule)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    {
                      color: theme === "dark" ? "#fff" : "#333",
                      fontWeight:
                        selectedSchedule === schedule ? "bold" : "normal",
                    },
                  ]}
                >
                  {schedule}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  voiceControlContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  voiceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  voiceResult: {
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  tabs: {
    flexDirection: "row",
    flex: 1,
  },
  viewAllText: {
    fontWeight: "bold",
    padding: 10,
    color: "#007AFF",
  },
  tabBase: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  filterButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  filterModalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingTop: 150,
    paddingRight: 10,
  },
  filterModalContent: {
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 120,
  },
  filterOption: {
    paddingVertical: 10,
  },
  filterOptionText: {
    fontSize: 14,
  },
  taskList: {
    paddingHorizontal: 10,
  },
  taskCard: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  priorityBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
  taskDescription: {
    fontSize: 14,
    marginVertical: 5,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    marginLeft: 5,
  },
  taskActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    paddingLeft: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default Screen;
