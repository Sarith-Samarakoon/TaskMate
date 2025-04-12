import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from "../MenuBars/TopBar";

const CompletedTask = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Completed');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample task data
  const tasks = [
    { id: 1, title: 'Code Review', completed: 10, total: 10, isCompleted: true },
    { id: 2, title: 'UI Design Updates', completed: 4, total: 5, isCompleted: false },
    { id: 3, title: 'Backend Optimization', completed: 7, total: 7, isCompleted: true },
    { id: 4, title: 'Team Meeting', completed: 1, total: 1, isCompleted: true },
    { id: 5, title: 'Write Documentation', completed: 3, total: 6, isCompleted: false },
    { id: 6, title: 'Fix Login Issue', completed: 2, total: 2, isCompleted: true },
    { id: 7, title: 'Add New Feature', completed: 5, total: 8, isCompleted: false },
    { id: 8, title: 'Client Presentation', completed: 1, total: 1, isCompleted: true },
    { id: 9, title: 'Database Migration', completed: 6, total: 6, isCompleted: true },
    { id: 10, title: 'Bug Fix Sprint', completed: 9, total: 10, isCompleted: false },
  ];


  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats data
  const stats = {
    total: 24,
    completed: 18,
    overdue: 3,
  };

  return (
    <View style={styles.container}>
      <TopBar title="CompletedTasks" />

      {/* Stats section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, styles.overdue]}>{stats.overdue}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Task"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Completed' && styles.activeTab]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={[styles.tabText, activeTab === 'Completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Goals' && styles.activeTab]}
          onPress={() => {
            setActiveTab('Goals');
            navigation.navigate('Goals');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'Goals' && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      <ScrollView style={styles.taskList}>
        {filteredTasks.map(task => (
          <TouchableOpacity key={task.id} style={styles.taskItem}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskCompletion}>
                {task.completed}/{task.total} Completed
              </Text>
            </View>
            <View style={styles.taskCheckbox}>
              <Ionicons name="checkmark-circle" size={24} color="#4685FF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  overdue: {
    color: '#FF5722',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 20,
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4685FF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4685FF',
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskCompletion: {
    fontSize: 14,
    color: '#666',
  },
  taskCheckbox: {
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default CompletedTask;