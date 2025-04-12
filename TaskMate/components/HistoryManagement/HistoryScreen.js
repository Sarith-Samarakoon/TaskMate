import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { useTheme } from "../ThemeContext";
import { Picker } from "@react-native-picker/picker";
import TopBar from "../MenuBars/TopBar";
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
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
    <View style={[styles.taskItem, theme === "dark" && styles.darkTaskItem]}>
      <Text style={[styles.taskTitle, theme === "dark" && styles.darkText]}>
        {item.title}
      </Text>
    </View>
  );

  const navigateToCompleted = () => {
    navigation.navigate("CompletedTask");
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
            backgroundGradientFrom: theme === "dark" ? "#121212" : "#fff",
            backgroundGradientTo: theme === "dark" ? "#121212" : "#fff",
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          }}
          hideLegend={true}
        />
        <Text style={[styles.progressText, theme === "dark" && styles.darkText]}>78%</Text>
      </View>

      <View style={styles.tabs}>
        {["To Do", "In Progress", "Completed"].map((tab) => (
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

      {/* Section Title with Dropdown */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, theme === "dark" && styles.darkText]}>{selectedPeriod} Tasks</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPeriod}
            onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
            style={[styles.picker, theme === "dark" && styles.darkPicker]}
          >
            <Picker.Item label="Daily" value="Daily" />
            <Picker.Item label="Weekly" value="Weekly" />
            <Picker.Item label="Monthly" value="Monthly" />
          </Picker>
        </View>
      </View>

      {selectedTab === "Completed" && (
        <TouchableOpacity style={styles.viewAllButton} onPress={navigateToCompleted}>
          <Text style={[styles.viewAllText, theme === "dark" && styles.darkText]}>View All Completed Tasks</Text>
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
  tabs: { flexDirection: "row", justifyContent: "center", marginBottom: 15 },
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

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: { fontSize: 22, fontWeight: "bold" },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    width: 120,
    height: 40,
  },
  picker: {
    height: 40,
    width: "100%",
  },
  darkPicker: { backgroundColor: "#333", color: "#fff" },

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
  taskTitle: { fontSize: 16, color: "#333" },
  darkText: { color: "#fff" },
  viewAllButton: { alignItems: "center", marginVertical: 10 },
  viewAllText: { color: "#4C68FF", fontSize: 16, fontWeight: "bold" },
});

export default HistoryScreen;
