import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Import your screens
import HomeScreen from "../TaskManagement/HomeScreen";
import CalendarScreen from "../ReminderManagement/CalenderScreen";
import HistoryScreen from "../HistoryManagement/HistoryScreen";
import ProfileScreen from "../ProfileManagement/ProfileScreen";
import ReminderScreen from "../ReminderManagement/ReminderScreen";  // Import the ReminderScreen
import NotificationScreen from "../ReminderManagement/NotificationScreen";  // Import the ReminderScreen
import setReminder from "../ReminderManagement/SetReminder";  // Import the ReminderScreen

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Calendar") {
            iconName = "calendar-outline";
          } else if (route.name === "History") {
            iconName = "time-outline";
          } else if (route.name === "Profile") {
            iconName = "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      {/* Add Reminder Screen to Tab Navigator */}
      <Tab.Screen
        name="Reminder"
        component={ReminderScreen}
        options={{ headerShown: false }}
      />
            <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
                  <Tab.Screen
        name="SetReminder"
        component={setReminder}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 60,
    borderTopWidth: 0,
    elevation: 10, // Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 10, // Slight curve for a modern look
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
});

export default TabNavigator;
