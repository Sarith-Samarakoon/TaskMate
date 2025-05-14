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
import moment from "moment";

const HistoryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("View all");
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
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Format date to be more user-friendly
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    
    const date = moment(dateString);
    if (!date.isValid()) return "Invalid date";
    
    const now = moment();
    const diffDays = date.diff(now, 'days');
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.format("MMM D, YYYY");
  };

  // Calculate pie chart data with whole number percentages
  const totalTasks = completedTasks.length + inProgressTasks.length;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0;

  const pieChartData = [
    {
      name: "Completed",
      population: completedPercentage,
      color: "#74BBFB",
      legendFontColor: theme === "dark" ? "#fff" : "#333",
      legendFontSize: 14,
      formattedValue: `${completedPercentage}%`,
    },
    {
      name: "In Progress",
      population: inProgressPercentage,
      color: "#1F75FE",
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return theme === "dark" ? "#fff" : "#333";
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.taskItem, theme === "dark" && styles.darkTaskItem]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <MaterialIcons
            name={item.completed ? "check-circle" : "radio-button-unchecked"}
            size={20}
            color={item.completed ? "#52C41A" : theme === "dark" ? "#fff" : "#333"}
            style={styles.statusIcon}
          />
          <Text style={[styles.taskTitle, theme === "dark" && styles.darkText]}>
            {item.title}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openEditModal(item)}
          >
            <MaterialIcons
              name="edit"
              size={20}
              color={theme === "dark" ? "#fff" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => deleteTask(item.$id)}
          >
            <MaterialIcons
              name="delete"
              size={20}
              color={theme === "dark" ? "#fff" : "#333"}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.description && (
        <Text style={[styles.taskDescription, theme === "dark" && styles.darkText]}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <MaterialIcons
            name="access-time"
            size={16}
            color={theme === "dark" ? "#aaa" : "#666"}
          />
          <Text style={[styles.taskDate, theme === "dark" && styles.darkText]}>
            {formatDate(item.Deadline)}
          </Text>
        </View>
        
        <View style={styles.taskMeta}>
          <MaterialIcons
            name="priority-high"
            size={16}
            color={getPriorityColor(item.priority)}
          />
          <Text style={[
            styles.taskPriority, 
            { color: getPriorityColor(item.priority) }
          ]}>
            {item.priority || 'No priority'}
          </Text>
        </View>
      </View>
    </View>
  );

  const navigateToGoals = () => {
    navigation.navigate("Goals");
  };

  return (
    <View style={[styles.container, theme === "dark" ? styles.darkContainer : styles.lightContainer]}>
      <TopBar title="Task History" />
      
      <View style={styles.progressContainer}>
        <Text style={[styles.sectionTitle, theme === "dark" && styles.darkText]}>
          Your Task Overview
        </Text>
        
        {totalTasks === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="assignment"
              size={40}
              color={theme === "dark" ? "#555" : "#ccc"}
            />
            <Text style={[styles.emptyStateText, theme === "dark" && styles.darkText]}>
              No tasks to display
            </Text>
          </View>
        ) : (
          <>
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
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, theme === "dark" && styles.darkText]}>
                  {totalTasks}
                </Text>
                <Text style={[styles.statLabel, theme === "dark" && styles.darkText]}>
                  Total Tasks
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: '#52C41A'}]}>
                  {completedTasks.length}
                </Text>
                <Text style={[styles.statLabel, theme === "dark" && styles.darkText]}>
                  Completed
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: '#1E88E5'}]}>
                  {inProgressTasks.length}
                </Text>
                <Text style={[styles.statLabel, theme === "dark" && styles.darkText]}>
                  In Progress
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.tabs}>
        {["View all", "In Progress", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab, 
              selectedTab === tab && styles.selectedTab, 
              theme === "dark" && styles.darkTab
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText, 
              selectedTab === tab && styles.selectedTabText, 
              theme === "dark" && styles.darkText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, theme === "dark" && styles.darkText]}>
          {selectedTab === "Completed" ? "Completed Tasks" : 
           selectedTab === "In Progress" ? "Tasks In Progress" : "All Tasks"}
        </Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={navigateToGoals}
        >
          <Text style={[styles.viewAllText, theme === "dark" && styles.darkText]}>
            View Goals
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={18}
            color={theme === "dark" ? "#fff" : "#4C68FF"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          selectedTab === "Completed"
            ? completedTasks
            : selectedTab === "In Progress"
            ? inProgressTasks
            : [...inProgressTasks, ...completedTasks]
        }
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        contentContainerStyle={styles.taskList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons
              name="assignment"
              size={40}
              color={theme === "dark" ? "#555" : "#ccc"}
            />
            <Text style={[styles.emptyStateText, theme === "dark" && styles.darkText]}>
              No {selectedTab.toLowerCase()} tasks found
            </Text>
          </View>
        }
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme === "dark" && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, theme === "dark" && styles.darkText]}>
              Update Task
            </Text>
            
            <Text style={[styles.inputLabel, theme === "dark" && styles.darkText]}>
              Title
            </Text>
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="Enter task title"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.title}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, title: text })}
            />
            
            <Text style={[styles.inputLabel, theme === "dark" && styles.darkText]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input, 
                styles.multilineInput,
                theme === "dark" && styles.darkInput
              ]}
              placeholder="Enter description (optional)"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.description}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, description: text })}
              multiline
            />
            
            <Text style={[styles.inputLabel, theme === "dark" && styles.darkText]}>
              Priority
            </Text>
            <Picker
              selectedValue={taskToEdit?.priority}
              onValueChange={(value) => setTaskToEdit({ ...taskToEdit, priority: value })}
              style={[styles.picker, theme === "dark" && styles.darkPicker]}
              dropdownIconColor={theme === "dark" ? "#fff" : "#333"}
            >
              <Picker.Item label="Select priority" value="" />
              <Picker.Item label="High" value="High" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="Low" value="Low" />
            </Picker>
            
            <Text style={[styles.inputLabel, theme === "dark" && styles.darkText]}>
              Deadline
            </Text>
            <TextInput
              style={[styles.input, theme === "dark" && styles.darkInput]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme === "dark" ? "#ccc" : "#999"}
              value={taskToEdit?.Deadline}
              onChangeText={(text) => setTaskToEdit({ ...taskToEdit, Deadline: text })}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateTask}
              >
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
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
    paddingBottom: 20,
  },
  lightContainer: { backgroundColor: "#F8F9FA" },
  darkContainer: { backgroundColor: "#121212" },
  progressContainer: {
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 6,
  },
  selectedTab: { 
    backgroundColor: "#4C68FF" 
  },
  darkTab: { 
    backgroundColor: "#333" 
  },
  tabText: { 
    fontSize: 14, 
    color: "#333",
    fontWeight: '500',
  },
  selectedTabText: { 
    color: "#fff", 
    fontWeight: "600" 
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: "#4C68FF",
    fontWeight: "500",
  },
  taskList: { 
    paddingHorizontal: 16,
  },
  taskItem: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  darkTaskItem: { 
    backgroundColor: "#1e1e1e",
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 8,
  },
  taskTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#333",
    flex: 1,
  },
  taskDescription: { 
    fontSize: 14, 
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: { 
    fontSize: 13, 
    color: "#666",
    marginLeft: 4,
  },
  taskPriority: { 
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 12,
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
    padding: 24,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
  },
  darkModalContent: {
    backgroundColor: "#2E2E2E",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#333",
    backgroundColor: "#fff",
    fontSize: 15,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  darkInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderColor: "#555",
  },
  picker: {
    height: 48,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  darkPicker: {
    backgroundColor: "#333",
    color: "#fff",
    borderColor: "#555",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4C68FF',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HistoryScreen;