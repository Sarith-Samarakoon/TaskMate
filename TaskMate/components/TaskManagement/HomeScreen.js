import React, { useEffect, useState } from "react";
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
} from "react-native";
import { getCurrentUser } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

// Replace this with your actual image import
const placeholderImage = require("../../assets/progress-image.png"); // Update this path

const GEMINI_API_KEY = "AIzaSyB4ES75inscnYNssR89EZafbSfm_6qOTxs";

const tasks = [
  {
    id: "1",
    title: "Flowunet Project Meeting",
    time: "8:15 AM - 9:00 AM",
    description: "Complete UI design review before 3 PM today",
  },
  {
    id: "2",
    title: "Team Meeting Reminder",
    time: "8:15 AM - 9:00 AM",
    description: "Complete UI design review before 3 PM today",
  },
  {
    id: "3",
    title: "Project Review",
    time: "8:15 AM - 9:00 AM",
    description: "Complete UI design review before 3 PM today",
  },
];

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

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

          <Text
            style={[
              styles.sectionTitle,
              { color: theme === "dark" ? "#FFFFFF" : "#000000" },
            ]}
          >
            TASKS
          </Text>
          <TouchableOpacity>
            <Text
              style={[
                styles.seeAllText,
                { color: theme === "dark" ? "#FFD700" : "#007AFF" },
              ]}
            >
              See All
            </Text>
          </TouchableOpacity>

          <FlatList
            data={tasks}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedTask(item)}
                style={[
                  styles.taskItem,
                  {
                    backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
                    borderColor:
                      selectedTask?.id === item.id
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
                  {item.time}
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
    width: 250,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
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
    textAlign: "right",
    fontSize: 16,
    fontWeight: "medium",
    marginBottom: 20,
    marginTop: -34,
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
});

export default HomeScreen;
