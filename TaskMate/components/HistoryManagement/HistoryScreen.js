import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Button,
  Dimensions,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTheme } from "../ThemeContext";
import { Picker } from "@react-native-picker/picker";
import TopBar from "../MenuBars/TopBar";
import { useNavigation } from '@react-navigation/native';
import { databases } from "../../lib/appwriteConfig";
import { MaterialIcons } from "@expo/vector-icons";

const HistoryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("Completed");
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await databases.listDocuments(
          "67de6cb1003c63a59683",
          "67e15b720007d994f573"
        );
        const allTasks = response.documents;
        setTasks(allTasks);
        setCompletedTasks(allTasks.filter(task => task.completed === true));
        setInProgressTasks(allTasks.filter(task => task.completed === false));
        checkDailyCompletions(allTasks.filter(task => task.completed === true)); // Check on load
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Calculate pie chart data with whole number percentages and append % symbol
  const totalTasks = completedTasks.length + inProgressTasks.length;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0;

  const pieChartData = [
    {
      name: "Completed",
      population: completedPercentage,
      color: "#52C41A",
      legendFontColor: theme === "dark" ? "#fff" : "#333",
      legendFontSize: 14,
      formattedValue: `${completedPercentage}%`,
    },
    {
      name: "In Progress",
      population: inProgressPercentage,
      color: "#1E88E5",
      legendFontColor: theme === "dark" ? "#fff" : "#333",
      legendFontSize: 14,
      formattedValue: `${inProgressPercentage}%`,
    },
  ];

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
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573"
      );
      const allTasks = response.documents;
      setTasks(allTasks);
      setCompletedTasks(allTasks.filter(task => task.completed === true));
      setInProgressTasks(allTasks.filter(task => task.completed === false));
      if (newCompletedStatus) {
        checkDailyCompletions(allTasks.filter(task => task.completed === true));
      }
    } catch (error) {
      console.error("Error updating task completion status:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573",
        taskId
      );
      setTasks((prevTasks) => prevTasks.filter((task) => task.$id !== taskId));
      setCompletedTasks((prev) => prev.filter((task) => task.$id !== taskId));
      setInProgressTasks((prev) => prev.filter((task) => task.$id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
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
          completed: taskToEdit.completed,
          schedule: taskToEdit.schedule,
        }
      );
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573"
      );
      const allTasks = response.documents;
      setTasks(allTasks);
      setCompletedTasks(allTasks.filter(task => task.completed === true));
      setInProgressTasks(allTasks.filter(task => task.completed === false));
      closeEditModal();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.taskItem, theme === "dark" && styles.darkTaskItem]}>
      <View style={styles.taskHeader}>
        <Text style={[styles.taskTitle, theme === "dark" && styles.darkText]}>
          {item.title}
        </Text>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => markTaskAsCompleted(item.$id)}
          >
            <MaterialIcons
              name={item.completed ? "check-circle" : "check-circle-outline"}
              size={24}
              color={item.completed ? "#52C41A" : theme === "dark" ? "#fff" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openEditModal(item)}
          >
            <MaterialIcons
              name="edit"
              size={24}
              color={theme === "dark" ? "#fff" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => deleteTask(item.$id)}
          >
            <MaterialIcons
              name="delete"
              size={24}
              color={theme === "dark" ? "#fff" : "#333"}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.taskDescription, theme === "dark" && styles.darkText]}>
        {item.description || "No description"}
      </Text>
      <View style={styles.taskFooter}>
        <Text style={[styles.taskDate, theme === "dark" && styles.darkText]}>
          Deadline: {item.Deadline}
        </Text>
        <Text style={[styles.taskPriority, theme === "dark" && styles.darkText]}>
          Priority: {item.priority}
        </Text>
      </View>
    </View>
  );

  const navigateToGoals = () => {
    navigation.navigate("Goals");
  };

  return (
    <View style={[styles.container, theme === "dark" ? styles.darkContainer : styles.lightContainer]}>
      <TopBar title="History" />
      <View style={styles.progressContainer}>
        <Text style={[styles.chartTitle, theme === "dark" && styles.darkText]}>Task Distribution</Text>
        {totalTasks === 0 ? (
          <Text style={[styles.noTasksText, theme === "dark" && styles.darkText]}>
            No tasks available
          </Text>
        ) : (
          <PieChart
            data={pieChartData}
            width={Dimensions.get("window").width * 0.9}
            height={220}
            chartConfig={{
              backgroundGradientFrom: theme === "dark" ? "#121212" : "#fff",
              backgroundGradientTo: theme === "dark" ? "#121212" : "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => theme === "dark" ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
            center={[10, 0]}
            style={styles.pieChart}
          />
        )}
      </View>

      <View style={styles.tabs}>
        {["View all", "In Progress", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab, theme === "dark" && styles.darkTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText, theme === "dark" && styles.darkText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tasksHeader}>
        <Text style={[styles.tasksTitle, theme === "dark" && styles.darkText]}>Tasks</Text>
        <TouchableOpacity onPress={navigateToGoals}>
          <Text style={[styles.viewAllText, theme === "dark" && styles.darkText]}>View All Goals</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          selectedTab === "Completed"
            ? completedTasks
            : selectedTab === "In Progress"
            ? inProgressTasks
            : inProgressTasks.concat(completedTasks)
        }
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        contentContainerStyle={styles.taskList}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme === "dark" && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, theme === "dark" && styles.darkText]}>Update Task</Text>
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="Title"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.title}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, title: text })}
            />
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="Description"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.description}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, description: text })}
            />
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="Priority"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.priority}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, priority: text })}
            />
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="Deadline"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.Deadline}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, Deadline: text })}
            />
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="Schedule"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.schedule}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, schedule: text })}
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
  container: { flex: 1 },
  lightContainer: { backgroundColor: "#F8F9FA" },
  darkContainer: { backgroundColor: "#121212" },
  progressContainer: {
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  noTasksText: {
    fontSize: 16,
    color: "#333",
  },
  pieChart: {
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginVertical: 10,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  tab: {
    padding: 10,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    minWidth: 100,
    alignItems: "center",
  },
  selectedTab: { backgroundColor: "#4C68FF" },
  darkTab: { backgroundColor: "#444" },
  tabText: { fontSize: 16, color: "#333" },
  selectedTabText: { color: "#fff", fontWeight: "bold" },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  tasksTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 16,
    color: "#4C68FF",
    fontWeight: "500",
  },
  taskList: { paddingHorizontal: 20 },
  taskItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  darkTaskItem: { backgroundColor: "#1e1e1e" },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  taskDescription: { fontSize: 14, marginVertical: 5, color: "#555" },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskDate: { fontSize: 14, color: "#666" },
  taskPriority: { fontSize: 14, color: "#666" },
  taskActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
  darkText: { color: "#fff" },
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
  darkModalContent: {
    backgroundColor: "#2E2E2E",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    paddingLeft: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  darkInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderColor: "#555",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default HistoryScreen;