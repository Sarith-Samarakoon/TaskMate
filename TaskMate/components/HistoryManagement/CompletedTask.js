import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const CompletedTask = () => {
  const [activeTab, setActiveTab] = useState('Completed');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample task data
  const tasks = [
    { id: 1, title: 'Design Changes', completed: 5, total: 5, isCompleted: true },
    { id: 2, title: 'Design Changes', completed: 5, total: 5, isCompleted: true },
    { id: 3, title: 'Design Changes', completed: 8, total: 8, isCompleted: true },
    { id: 4, title: 'Design Changes', completed: 20, total: 20, isCompleted: true },
    { id: 5, title: 'Design Changes', completed: 8, total: 8, isCompleted: true },
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
      {/* Header with time */}
      <View style={styles.header}>
        <Text style={styles.time}>9:41</Text>
      </View>

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
          onPress={() => setActiveTab('Goals')}
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
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color="#666" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={24} color="#666" />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
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