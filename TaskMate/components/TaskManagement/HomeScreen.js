import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getCurrentUser } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const allTasks = [
  { title: "Website Redesign", description: "Update the company website with new brand", date: "Mar 25, 2025", priority: "High", status: "My Tasks" },
  { title: "Write Blog Article", description: "Draft article on product update", date: "Mar 27, 2025", priority: "Medium", status: "In-progress" },
  { title: "Fix Bugs", description: "Resolve login screen errors", date: "Mar 29, 2025", priority: "Low", status: "Completed" },
  { title: "Prepare Pitch Deck", description: "For investor meeting", date: "Mar 30, 2025", priority: "High", status: "My Tasks" },
];

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("My Tasks");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigation.replace("Auth");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

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

  const filteredTasks = allTasks.filter((task) =>
    task.title.toLowerCase().includes(searchText.toLowerCase()) &&
    (activeTab === "View All" || task.status === activeTab)
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#FFD700" : "#007AFF"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#F8FAFF" }]}>
      <TopBar title="Home" />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#E5EDFF" }]}>
          <Text style={styles.summaryTitle}>Total</Text>
          <Text style={styles.summaryValue}>{allTasks.length}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#DFFFE0" }]}>
          <Text style={styles.summaryTitle}>Completed</Text>
          <Text style={styles.summaryValue}>
            {allTasks.filter((task) => task.status === "Completed").length}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FFE0E0" }]}>
          <Text style={styles.summaryTitle}>Overdue</Text>
          <Text style={styles.summaryValue}>3</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search Task"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <Ionicons name="search" size={20} color="#999" />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {["My Tasks", "In-progress", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={activeTab === tab ? styles.activeTab : styles.inactiveTab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setActiveTab("View All")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>No tasks found</Text>
        ) : (
          filteredTasks.map((task, index) => {
            const priorityStyle = getPriorityStyle(task.priority);
            return (
              <View key={index} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>○ {task.title}</Text>
                  <Text style={[
                    styles.priorityBadge,
                    {
                      backgroundColor: priorityStyle.backgroundColor,
                      color: priorityStyle.color,
                    },
                  ]}>
                    {task.priority}
                  </Text>
                </View>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskFooter}>
                  <View style={styles.taskDate}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>{task.date}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity style={styles.iconButton}>
                      <MaterialIcons name="edit" size={20} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <MaterialIcons name="delete" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  summaryCard: { borderRadius: 12, padding: 12, width: "30%", alignItems: "center" },
  summaryTitle: { fontSize: 14, color: "#444" },
  summaryValue: { fontSize: 20, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    alignItems: "center",
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  activeTab: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: "#E9ECF2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  tabText: { fontSize: 14, color: "#333" },
  viewAllText: { fontSize: 13, color: "#007AFF", marginLeft: 10 },
  taskList: { paddingHorizontal: 15, paddingBottom: 100 },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
  },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  taskTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  priorityBadge: {
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "bold",
  },
  taskDescription: { fontSize: 14, color: "#555", marginBottom: 10 },
  taskFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskDate: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { fontSize: 13, marginLeft: 5, color: "#666" },
  taskActions: { flexDirection: "row", gap: 15 },
  iconButton: { padding: 4 },
});

export default HomeScreen;