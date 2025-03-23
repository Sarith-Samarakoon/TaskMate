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
} from "react-native";
import { getCurrentUser } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import axios from "axios";

const GEMINI_API_KEY = "AIzaSyB4ES75inscnYNssR89EZafbSfm_6qOTxs";

const tasks = [
  { id: "1", title: "Plan a Weekly Schedule" },
  { id: "2", title: "Prepare a Shopping List" },
  { id: "3", title: "Book a Flight" },
  { id: "4", title: "Write a Report" },
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
                  text: `Provide a structured guide for: ${selectedTask.title}. It should be in 3 steps`,
                },
              ],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response?.data?.candidates && response.data.candidates.length > 0) {
        const aiContent = response.data.candidates[0]?.content?.parts[0]?.text;
        setAiResponse(
          aiContent.split(". ").slice(0, 3).join(". ") + "." ||
            "No guidance found in the response."
        );
      } else {
        setAiResponse("Unexpected response format from Gemini API.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiResponse("Failed to generate AI assistance.");
    } finally {
      setAiLoading(false);
      setModalVisible(true);
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
        { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" },
      ]}
    >
      <TopBar title="Home" />
      <View style={styles.content}>
        {user && (
          <>
            <Text
              style={[
                styles.title,
                { color: theme === "dark" ? "#FFD700" : "#333" },
              ]}
            >
              Welcome, {user.name}!
            </Text>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.taskItem,
                    selectedTask?.id === item.id && styles.selectedTask,
                  ]}
                  onPress={() => setSelectedTask(item)}
                >
                  <Text style={styles.taskTitle}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.assistButton}
              onPress={handleAssistMe}
            >
              <Text style={styles.assistButtonText}>🧠 Assist Me</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.aiResponseTitle}>AI Assistance</Text>
              {aiLoading ? (
                <ActivityIndicator size="large" color="#007AFF" />
              ) : (
                <Text style={styles.aiResponseText}>
                  {aiResponse.split(". ").map((step, index) => (
                    <Text key={index}>
                      ✅ {step}
                      {"\n"}
                    </Text>
                  ))}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
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
  container: { flex: 1 },
  content: { alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  taskItem: {
    padding: 15,
    backgroundColor: "#007AFF",
    marginVertical: 5,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  selectedTask: { backgroundColor: "#FFD700" },
  taskTitle: { color: "#fff", fontSize: 16 },
  assistButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  assistButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  aiResponseTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  aiResponseText: { fontSize: 16, color: "#333" },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontSize: 16 },
});

export default HomeScreen;
