import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";

// Import your tab screens
import HomeScreen from "../TaskManagement/HomeScreen";
import CalendarScreen from "../ReminderManagement/CalenderScreen";
import HistoryScreen from "../HistoryManagement/HistoryScreen";
import ProfileScreen from "../ProfileManagement/ProfileScreen";

// Import hidden screens
import ReminderScreen from "../ReminderManagement/ReminderScreen";
import NotificationScreen from "../ReminderManagement/NotificationScreen";
import SetReminder from "../ReminderManagement/SetReminder";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for hidden screens (Reminder, Notification, SetReminder)
const ReminderStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen name="Reminder" component={ReminderScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="SetReminder" component={SetReminder} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Calendar") iconName = "calendar-outline";
          else if (route.name === "History") iconName = "time-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderRadius: 10,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={ReminderStack} options={{ headerShown: false }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
