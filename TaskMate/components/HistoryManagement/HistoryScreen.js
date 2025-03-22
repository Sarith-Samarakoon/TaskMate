import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import TopBar from "../MenuBars/TopBar"; // Importing the new TopBar
import { useTheme } from "../ThemeContext"; // Import ThemeContext

const historyData = [
  { id: "1", task: "📝 Completed project report", date: "March 10, 2025" },
  { id: "2", task: "📅 Attended team meeting", date: "March 9, 2025" },
  { id: "3", task: "✅ Marked assignment as done", date: "March 8, 2025" },
];

const HistoryScreen = () => {
  const { theme } = useTheme(); // Get theme from context

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.historyItem,
        theme === "dark" ? styles.darkHistoryItem : styles.lightHistoryItem,
      ]}
    >
      <Ionicons
        name="checkmark-done-circle-outline"
        size={24}
        color={theme === "dark" ? "#76FF03" : "#4CAF50"}
      />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.task,
            theme === "dark" ? styles.darkTask : styles.lightTask,
          ]}
        >
          {item.task}
        </Text>
        <Text
          style={[
            styles.date,
            theme === "dark" ? styles.darkDate : styles.lightDate,
          ]}
        >
          {item.date}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="History" />
      <Text
        style={[
          styles.header,
          theme === "dark" ? styles.darkHeader : styles.lightHeader,
        ]}
      >
        📜 Task History
      </Text>
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#F8F9FA",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  lightHeader: {
    color: "#007AFF",
  },
  darkHeader: {
    color: "#FFD700",
  },
  list: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  lightHistoryItem: {
    backgroundColor: "#FFFFFF",
  },
  darkHistoryItem: {
    backgroundColor: "#333333",
  },
  textContainer: {
    marginLeft: 10,
  },
  task: {
    fontSize: 18,
    fontWeight: "bold",
  },
  lightTask: {
    color: "#333",
  },
  darkTask: {
    color: "#FFD700",
  },
  date: {
    fontSize: 14,
  },
  lightDate: {
    color: "#666",
  },
  darkDate: {
    color: "#BBBBBB",
  },
});

export default HistoryScreen;
