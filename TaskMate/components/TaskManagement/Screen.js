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
  Alert,
  Button,
} from "react-native";
import { getCurrentUser, databases } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import UpdateTaskModal from "./UpdateTaskModal";

const GEMINI_API_KEY = "AIzaSyB4ES75inscnYNssR89EZafbSfm_6qOTxs";

const Screen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("View All");
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentTheme, setCurrentTheme] = useState("light"); // or get from context
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState("All");

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

  const isDateBeforeToday = (dateString) => {
    const taskDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  const updateSkipCount = async (task) => {
    if (
      task.schedule?.toLowerCase() === "daily" &&
      !task.completed &&
      task.Deadline &&
      isDateBeforeToday(task.Deadline)
    ) {
      try {
        const newSkipCount = (task.skipCount || 0) + 1;
        await databases.updateDocument(
          "67de6cb1003c63a59683",
          "67e15b720007d994f573",
          task.$id,
          { skipCount: newSkipCount }
        );
        return { ...task, skipCount: newSkipCount };
      } catch (error) {
        console.error("Error updating skip count:", error);
        return task;
      }
    }
    return task;
  };

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

  const fetchUpdatedTasks = async () => {
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

  const handlePredict = async (task) => {
    try {
      const response = await fetch("http://192.168.1.5:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority: task.priority,
          category: task.category || "Work",
          title: task.title,
          skipCount: parseInt(task.skipCount || 0),
          deadline: task.Deadline,
        }),
      });

      const json = await response.json();
      if (json.predicted_time) {
        return json.predicted_time;
      } else {
        return "Prediction failed.";
      }
    } catch (error) {
      return "Could not connect to the server.";
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

  const formatDeadline = (deadline, schedule) => {
    if (!deadline) return "No Deadline";
    const date = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) return "Invalid Date";

    if (schedule?.toLowerCase() === "daily") {
      return new Date(deadline).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${new Date(deadline).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date < today) {
      return `Overdue: ${formattedDate}`;
    } else {
      return formattedDate;
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
      const newCompletedStatus = !task.completed;
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

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const selectScheduleFilter = (schedule) => {
    setSelectedSchedule(schedule);
    setFilterModalVisible(false);
  };

  const checkAndShowPredictionAlert = async (task) => {
    if (task.skipCount > 3) {
      try {
        // Fetch predicted time from handlePredict
        const predictedTime = await handlePredict(task);

        // Fetch time ranges from Gemini API
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Suggest 3 specific time ranges within around "${task.Deadline}" to work on this task: "${task.title}". The task details are: ${task.description}. The deadline is: ${task.Deadline}. Consider the deadline and provide time ranges that are practical for completing the task effectively. Format the response as a concise list of time ranges (e.g., "9:00 AM - 10:00 AM").`,
                  },
                ],
              },
            ],
          },
          { headers: { "Content-Type": "application/json" } }
        );

        let timeRanges = "No time ranges suggested.";
        if (response?.data?.candidates?.length > 0) {
          timeRanges =
            response.data.candidates[0]?.content?.parts[0]?.text ||
            "No time ranges found.";
        }

        window.alert(
          `Task "${task.title}" has ${task.skipCount} skips.\nPredicted time: ${predictedTime}\nSuggested time ranges:\n${timeRanges}`
        );
      } catch (error) {
        console.error("Error in checkAndShowPredictionAlert:", error);
        window.alert(
          `Task "${task.title}" has ${task.skipCount} skips. Failed to generate predictions or time ranges.`
        );
      }
    }
  };

  useEffect(() => {
    tasks.forEach((task) => {
      checkAndShowPredictionAlert(task);
    });
  }, [tasks]);

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
            const formattedDeadline = formatDeadline(
              task.Deadline,
              task.schedule
            );
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
                      size={18}
                      color={theme === "dark" ? "#FFD700" : "#0047AB"}
                      style={styles.calendarIcon}
                    />
                    <View style={styles.deadlineBadge}>
                      <Text
                        style={[
                          styles.dateText,
                          {
                            color: theme === "dark" ? "#FFD700" : "#0047AB",
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {formattedDeadline}
                      </Text>
                    </View>
                    {task.schedule?.toLowerCase() === "daily" && (
                      <Text
                        style={[
                          styles.skipCountText,
                          { color: theme === "dark" ? "#FF4D4F" : "#FF4D4F" },
                        ]}
                      >
                        Skips: {task.skipCount || 0}
                      </Text>
                    )}
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
                      onPress={() => handleEditTask(task)}
                    >
                      <MaterialIcons
                        name="edit"
                        size={24}
                        color={theme === "dark" ? "#fff" : "#333"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteTask(task.id)}
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

      <UpdateTaskModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpdate={fetchUpdatedTasks}
        route={{ params: { task: selectedTask, theme: currentTheme } }}
        navigation={navigation}
      />

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
});

export default Screen;
