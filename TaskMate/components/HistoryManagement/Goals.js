import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Client, Databases } from 'appwrite';
import TopBar from "../MenuBars/TopBar";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");

const databases = new Databases(client);

const GoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // Fetch Goals
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

  // Delete Goal
  const deleteGoal = async (goalId) => {
    try {
      await databases.deleteDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        goalId
      );
      setGoals(goals.filter(goal => goal.$id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  // Open Edit Modal
  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setModalVisible(true);
  };

  // Update Goal
  const updateGoal = async () => {
    if (!selectedGoal.GoalName.trim()) {
      Alert.alert("Error", "Goal name cannot be empty");
      return;
    }
    try {
      await databases.updateDocument(
        "67de6cb1003c63a59683",
        "67e16137002384116add",
        selectedGoal.$id,
        {
          GoalName: selectedGoal.GoalName,
          TimeFrame: selectedGoal.TimeFrame,
          GoalNote: selectedGoal.GoalNote,
        }
      );
      fetchGoals(); // Refresh goals list
      setModalVisible(false);
      // Show toast notification
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your Goal is Updated!",
      });

    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <View style={styles.container}>
      <TopBar title="Goals" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Goals</Text>
        <TouchableOpacity style={styles.addGoalButton} onPress={() => navigation.navigate('SetGoals')}>
          <Text style={styles.addGoalText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals Overview */}
      <View style={styles.goalSummaryContainer}>
        <View style={styles.goalCard}>
          <Text style={styles.goalCardTitle}>Daily Goal</Text>
          <Text style={styles.goalProgress}>6/8</Text>
          <Text style={styles.goalSubtext}>Goals completed</Text>
        </View>
        <View style={styles.goalCard}>
          <Text style={styles.goalCardTitle}>Weekly Goal</Text>
          <Text style={styles.goalProgress}>24/30</Text>
          <Text style={styles.goalSubtext}>Goals completed</Text>
        </View>
      </View>

      {/* Goal List */}
      <ScrollView contentContainerStyle={styles.content}>
        <FlatList
          data={goals}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={styles.goalItem}>
              <Ionicons name="calendar" size={24} color="#6A5AE0" style={styles.goalIcon} />
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalTitle}>{item.GoalName}</Text>
                <Text style={styles.goalDetails}>Timeframe: {item.TimeFrame}</Text>
                <Text style={styles.goalDetails}>Note: {item.GoalNote}</Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <MaterialIcons name="edit" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteGoal(item.$id)}>
                <MaterialIcons name="delete" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>

      {/* Update Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Goal</Text>
            <TextInput
              style={styles.input}
              value={selectedGoal?.GoalName}
              onChangeText={(text) => setSelectedGoal({ ...selectedGoal, GoalName: text })}
              placeholder="Goal Name"
            />
            <TextInput
              style={styles.input}
              value={selectedGoal?.TimeFrame}
              onChangeText={(text) => setSelectedGoal({ ...selectedGoal, TimeFrame: text })}
              placeholder="Timeframe"
            />
            <TextInput
              style={styles.input}
              value={selectedGoal?.GoalNote}
              onChangeText={(text) => setSelectedGoal({ ...selectedGoal, GoalNote: text })}
              placeholder="Goal Note"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={updateGoal} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
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
    backgroundColor: '#F8FAFC',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#101010',
  },
  addGoalButton: {
    backgroundColor: '#FF8C42',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addGoalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3567D4',
  },
  goalProgress: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28A745',
  },
  goalSubtext: {
    fontSize: 14,
    color: '#555',
  },
  goalItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  goalTextContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  goalDetails: {
    fontSize: 14,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#2A4D9B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default GoalsScreen;
