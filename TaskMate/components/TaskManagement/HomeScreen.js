import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { getCurrentUser, databases } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

const placeholderImage = require("../../assets/progress-image.png");

const GEMINI_API_KEY = "AIzaSyB4ES75inscnYNssR89EZafbSfm_6qOTxs";

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]); // State for filtered tasks
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false); // Filter modal state
  const [filterType, setFilterType] = useState("All"); // Filter type state
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for filter modal

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigation.replace("Auth");
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e15b720007d994f573"
      );
      setTasks(response.documents);
      setFilteredTasks(response.documents); // Initialize filtered tasks
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks based on schedule
  useEffect(() => {
    if (filterType === "All") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.schedule === filterType));
    }
  }, [filterType, tasks]);

  // Animate filter modal
  useEffect(() => {
    if (filterModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [filterModalVisible]);

  // Format deadline to display as a time range
  const formatDeadline = (deadline) => {
    if (!deadline) return "No time set";
    const date = new Date(deadline);
    const startTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const endTime = new Date(
      date.getTime() + 45 * 60 * 1000
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  const handleAssistMe = async () => {
    if (!selectedTask) {
      alert("Please select a task first!");
      return;
    }

    setAiLoading(true);
    setAiResponse("");
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Provide guidance and tips for completing this task: "${selectedTask.title}". The task details are: ${selectedTask.description}. Give me 3 key steps to complete it effectively, along with some productivity tips. Keep it concise.`,
                },
              ],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response?.data?.candidates?.length > 0) {
        const aiContent = response.data.candidates[0]?.content?.parts[0]?.text;
        setAiResponse(aiContent || "No guidance found for this task.");
      } else {
        setAiResponse("Unexpected response format from Gemini API.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiResponse("Failed to generate AI assistance for this task.");
    } finally {
      setAiLoading(false);
      setModalVisible(true);
    }
  };

  const getCurrentDate = () => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date().toLocaleDateString("en-US", options).toUpperCase();
  };

  // Handle filter selection
  const handleFilterSelect = (type) => {
    setFilterType(type);
    setFilterModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" },
      ]}
    >
      <TopBar title="Home" />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[
                styles.greeting,
                { color: theme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
            >
              Hello {user?.name},
            </Text>
            <Text
              style={[
                styles.date,
                { color: theme === "dark" ? "#AAAAAA" : "#666666" },
              ]}
            >
              {getCurrentDate()}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <Text
              style={[
                styles.progressTitle,
                { color: theme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
            >
              Weekly Progress
            </Text>
            <Text
              style={[
                styles.progressSubtitle,
                { color: theme === "dark" ? "#AAAAAA" : "#666666" },
              ]}
            >
              You're doing great!
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "85%" }]} />
              </View>
              <Text
                style={[
                  styles.progressText,
                  { color: theme === "dark" ? "#FFD700" : "#007AFF" },
                ]}
              >
                85%
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressImageContainer}>
              <Image
                source={placeholderImage}
                style={styles.progressImage}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.assistButton,
                {
                  backgroundColor: theme === "dark" ? "#333333" : "#007AFF",
                  opacity: selectedTask ? 1 : 0.6,
                },
              ]}
              onPress={handleAssistMe}
              disabled={!selectedTask}
            >
              <MaterialIcons
                name="assistant"
                size={24}
                color={theme === "dark" ? "#FFD700" : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.assistButtonText,
                  { color: theme === "dark" ? "#FFD700" : "#FFFFFF" },
                ]}
              >
                Assist Me
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
            >
              TASKS
            </Text>
            <View style={styles.tasksHeaderRight}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
              >
                <MaterialIcons
                  name="filter-list"
                  size={20}
                  color={theme === "dark" ? "#FFD700" : "#007AFF"}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: theme === "dark" ? "#FFD700" : "#007AFF" },
                  ]}
                >
                  Filter: {filterType}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Screen")}>
                <Text
                  style={[
                    styles.seeAllText,
                    { color: theme === "dark" ? "#FFD700" : "#007AFF" },
                  ]}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {tasksLoading ? (
            <ActivityIndicator size="large" color="#FFD700" />
          ) : filteredTasks.length === 0 ? (
            <Text
              style={[
                styles.noTasksText,
                { color: theme === "dark" ? "#AAAAAA" : "#666666" },
              ]}
            >
              No tasks available
            </Text>
          ) : (
            <FlatList
              data={filteredTasks}
              scrollEnabled={false}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedTask(item)}
                  style={[
                    styles.taskItem,
                    {
                      backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
                      borderColor:
                        selectedTask?.$id === item.$id
                          ? theme === "dark"
                            ? "#FFD700"
                            : "#007AFF"
                          : "transparent",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: theme === "dark" ? "#FFD700" : "#007AFF" },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.taskTime,
                      { color: theme === "dark" ? "#AAAAAA" : "#666666" },
                    ]}
                  >
                    {formatDeadline(item.Deadline)}
                  </Text>
                  <Text
                    style={[
                      styles.taskDescription,
                      { color: theme === "dark" ? "#CCCCCC" : "#444444" },
                    ]}
                  >
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Filter Modal */}
          <Modal
            visible={filterModalVisible}
            transparent
            animationType="none"
            onRequestClose={() => setFilterModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.filterModalOverlay}
              activeOpacity={1}
              onPress={() => setFilterModalVisible(false)}
            >
              <Animated.View
                style={[
                  styles.filterModal,
                  {
                    backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
                    opacity: fadeAnim,
                  },
                ]}
              >
                {["All", "Daily", "Weekly", "Monthly"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filterType === type && {
                        backgroundColor:
                          theme === "dark" ? "#333333" : "#E6F0FF",
                      },
                    ]}
                    onPress={() => handleFilterSelect(type)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        {
                          color:
                            filterType === type
                              ? theme === "dark"
                                ? "#FFD700"
                                : "#007AFF"
                              : theme === "dark"
                              ? "#CCCCCC"
                              : "#333333",
                        },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <ScrollView>
              <Text
                style={[
                  styles.aiResponseTitle,
                  { color: theme === "dark" ? "#FFD700" : "#007AFF" },
                ]}
              >
                ✨ Task Assistance ✨
              </Text>
              <Text
                style={[
                  styles.taskPrompt,
                  { color: theme === "dark" ? "#AAAAAA" : "#666666" },
                ]}
              >
                Assistance for: {selectedTask?.title}
              </Text>
              {aiLoading ? (
                <ActivityIndicator size="large" color="#007AFF" />
              ) : (
                <Text
                  style={[
                    styles.aiResponseText,
                    { color: theme === "dark" ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  {aiResponse}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: theme === "dark" ? "#333333" : "#007AFF" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  date: {
    fontSize: 16,
    marginTop: 5,
  },
  progressContainer: {
    marginBottom: 25,
    alignItems: "center",
  },
  progressImageContainer: {
    width: 150,
    height: 100,
    marginBottom: 15,
  },
  progressImage: {
    width: "100%",
    height: "100%",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  progressSubtitle: {
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  assistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  assistButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  tasksHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "medium",
    marginLeft: 5,
  },
  filterModalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingTop: 120, // Adjust based on your layout
  },
  filterModal: {
    width: 150,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginRight: 30,
    marginTop: 100,
  },
  filterOption: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 2,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: "medium",
  },
  taskItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  taskTime: {
    fontSize: 14,
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "medium",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  aiResponseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  taskPrompt: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  aiResponseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noTasksText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
