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
} from "react-native";
import { getCurrentUser, databases } from "../../lib/appwriteConfig"; // Ensure you have this imported
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Screen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [tasks, setTasks] = useState([]); // State to store tasks
  const { theme } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false); // State to manage modal visibility
  const [taskToEdit, setTaskToEdit] = useState(null); // Store task to edit

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigation.replace("Auth");
      } else {
        setUser(currentUser);
        fetchTasks(); // Fetch tasks when the user is fetched
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683", // Your database ID
        "67e15b720007d994f573" // Your collection ID
      );
      setTasks(response.documents); // Set the tasks data to the state
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
      (activeTab === "View All" || task.status === activeTab)
  );

  const deleteTask = async (taskId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683", // Your database ID
        "67e15b720007d994f573", // Your collection ID
        taskId // Task ID to delete
      );
      setTasks((prevTasks) => prevTasks.filter((task) => task.$id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const openEditModal = (task) => {
    setTaskToEdit(task); // Set the task to be edited
    setModalVisible(true); // Show modal
  };

  const closeEditModal = () => {
    setModalVisible(false); // Close modal
    setTaskToEdit(null); // Reset task to edit
  };

  const updateTask = async () => {
    if (!taskToEdit) return;
    try {
      // Update task in the database
      await databases.updateDocument(
        "67de6cb1003c63a59683", // Your database ID
        "67e15b720007d994f573", // Your collection ID
        taskToEdit.$id, // Task ID to update
        {
          title: taskToEdit.title,
          description: taskToEdit.description,
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          Deadline: taskToEdit.Deadline,
        }
      );
      fetchTasks(); // Refresh tasks
      closeEditModal(); // Close the modal
    } catch (error) {
      console.error("Error updating task:", error);
    }
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

      {/* Summary Cards */}
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
            {tasks.filter((task) => task.status === "Completed").length}
          </Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme === "dark" ? "#FFE0E0" : "#FFE0E0" },
          ]}
        >
          <Text style={styles.summaryTitle}>Overdue</Text>
          <Text style={styles.summaryValue}>3</Text>
        </View>
      </View>

      {/* Search Bar */}
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

      {/* Filter Tabs */}
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
        {["My Tasks", "In-progress", "Completed"].map((tab) => {
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
                      : "#666666", // softer than #333
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
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
                      onPress={() => openEditModal(task)} // Open modal to edit task
                    >
                      <MaterialIcons
                        name="edit"
                        size={20}
                        color={theme === "dark" ? "#fff" : "#333"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteTask(task.$id)} // Call delete function when button is pressed
                    >
                      <MaterialIcons
                        name="delete"
                        size={20}
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

      {/* Modal for updating task */}
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
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={closeEditModal} />
              <Button title="Save" onPress={updateTask} />
            </View>
          </View>
        </View>
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
  tabs: {
    flexDirection: "row",
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  viewAllText: {
    fontWeight: "bold",
    padding: 10,
    color: "#007AFF",
  },
  activeTab: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },

  inactiveTab: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
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
