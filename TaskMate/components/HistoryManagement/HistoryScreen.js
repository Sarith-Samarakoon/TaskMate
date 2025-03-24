import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { useTheme } from "../ThemeContext";
import { Picker } from "@react-native-picker/picker";
import TopBar from "../MenuBars/TopBar"; // Importing the new TopBar

// Navigation setup
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();  // Hook for navigation
  const [selectedTab, setSelectedTab] = useState("To Do");
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");

  const taskData = {
    "Completed": [
      { id: "1", title: "✅ Submit project report" },
      { id: "2", title: "✅ Finish reading book" },
      { id: "3", title: "✅ Pay electricity bill" },
      { id: "4", title: "✅ Pay Mobile bill" },
    ],
    "In Progress": [
      { id: "5", title: "⏳ Work on mobile app UI" },
      { id: "6", title: "⏳ Prepare for presentation" },
      { id: "7", title: "⏳ Prepare for VIVA" },
    ],
    "To Do": [
      { id: "8", title: "📝 Plan weekend trip" },
      { id: "9", title: "📝 Buy groceries" },
    ],
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
    </View>
  );

  const navigateToCompleted = () => {
    navigation.navigate("CompletedTask");  // Navigate to CompletedTask page
  };

  return (
    <View style={[styles.container, theme === "dark" ? styles.darkContainer : styles.lightContainer]}>
      <TopBar title="History" />
      <View style={styles.progressContainer}>
        <ProgressChart
          data={{ data: [0.78] }}
          width={200}
          height={150}
          strokeWidth={12}
          radius={40}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          }}
          hideLegend={true}
        />
        <Text style={styles.progressText}>78%</Text>
      </View>

      {/* Container for Picker in top-right corner */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPeriod}
          onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>
      </View>

      <View style={styles.tabs}>
        {["To Do", "In Progress", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{selectedPeriod} Tasks</Text>

      {/* "View All" Button for Completed Tasks */}
      {selectedTab === "Completed" && (
        <TouchableOpacity style={styles.viewAllButton} onPress={navigateToCompleted}>
          <Text style={styles.viewAllText}>View All Completed Tasks</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={taskData[selectedTab]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.taskList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: "#F8F9FA" },
  darkContainer: { backgroundColor: "#121212" },
  progressContainer: { alignItems: "center", marginVertical: 20 },
  progressText: { fontSize: 22, fontWeight: "bold", position: "absolute", top: 60 },
  pickerContainer: {
    position: "absolute", // Positioning absolute to place it at the top-right
    top: 20,
    right: 20,
    zIndex: 1, // Ensure it sits on top of other components
    backgroundColor: "#fff", // Optional: adds background to dropdown for clarity
    borderRadius: 5, // Optional: rounded corners for aesthetic
  },
  picker: {
    height: 40,
    width: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  tabs: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  tab: { padding: 10, marginHorizontal: 5, borderRadius: 15, backgroundColor: "#E0E0E0" },
  selectedTab: { backgroundColor: "#4C68FF" },
  tabText: { fontSize: 16, color: "#333" },
  selectedTabText: { color: "#fff" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginLeft: 20, marginVertical: 10 },
  taskList: { paddingHorizontal: 20 },
  taskItem: { padding: 15, backgroundColor: "#fff", borderRadius: 10, marginBottom: 10, elevation: 3 },
  taskTitle: { fontSize: 16, color: "#333" },
  viewAllButton: {
    alignItems: "center",
    marginVertical: 10,
  },
  viewAllText: {
    color: "#4C68FF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HistoryScreen;
