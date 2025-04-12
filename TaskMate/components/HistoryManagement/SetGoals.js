import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native"; 
import { Client, Databases, ID } from "appwrite";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import delete icon

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") 
  .setProject("67d2d4400029f32f7259"); 

const databases = new Databases(client);

const SetGoalsScreen = () => {
  const [goalName, setGoalName] = useState("");
  const [goalNote, setGoalNote] = useState("");
  const [open, setOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState(null);
  const [items, setItems] = useState([
    { label: "1 Day", value: "1_day" },
    { label: "1 Week", value: "1_week" },
    { label: "1 Month", value: "1_month" },
    { label: "3 Months", value: "3_months" },
    
  ]);
  const [goals, setGoals] = useState([]);

  const navigation = useNavigation();

  // Fetch Goals from Database
  const fetchGoals = async () => {
    try {
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683",
        "67e16137002384116add"
      );
      setGoals(response.documents);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  // Save Goal to Database
  const saveGoalToDatabase = async () => {
    if (!goalName || !timeFrame) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      await databases.createDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        ID.unique(),
        {
          GoalName: goalName,
          TimeFrame: timeFrame,
          GoalNote: goalNote || "",
        }
      );

      Alert.alert("Success", "Goal saved successfully!");
      setGoalName("");
      setGoalNote("");
      setTimeFrame(null);
      fetchGoals();

      navigation.navigate("Goals");
    } catch (error) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", "Failed to save goal. Please try again.");
    }
  };

  // Delete Goal
  const deleteGoal = async (goalId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId
      );

      Alert.alert("Deleted", "Goal has been deleted.");
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete goal.");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Set Your Goals</Text>

      {/* Goal Name Input */}
      <Text style={styles.label}>Goal Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter goal name"
        value={goalName}
        onChangeText={setGoalName}
      />

      {/* Timeframe Dropdown */}
      <Text style={styles.label}>Timeframe</Text>
      <DropDownPicker
        open={open}
        value={timeFrame}
        items={items}
        setOpen={setOpen}
        setValue={setTimeFrame}
        setItems={setItems}
        placeholder="Select your timeframe"
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        dropDownStyle={styles.dropdownBox}
      />

      {/* Motivation Input */}
      <Text style={styles.label}>Why this goal? (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write down your motivation"
        multiline
        numberOfLines={4}
        value={goalNote}
        onChangeText={setGoalNote}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={saveGoalToDatabase}>
        <Text style={styles.buttonText}>Save Goal</Text>
      </TouchableOpacity>

      {/* Display Saved Goals */}
      
      
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F8FC",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2A4D9B",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdown: {
    backgroundColor: "white",
    borderColor: "#ccc",
  },
  dropdownBox: {
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#2A4D9B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#2A4D9B",
  },
  goalItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  goalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  goalDetails: {
    fontSize: 14,
    color: "#555",
  },
});

export default SetGoalsScreen;
