import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createStackNavigator } from "@react-navigation/stack";

// Import your screens
import HomeScreen from "../TaskManagement/HomeScreen";
import CalendarScreen from "../ReminderManagement/CalenderScreen";
import HistoryScreen from "../HistoryManagement/HistoryScreen";
import ProfileScreen from "../ProfileManagement/ProfileScreen";
import AddTask from "../TaskManagement/AddTask";
import Screen from "../TaskManagement/Screen";
import HelpSupport from "../ProfileManagement/Help&Support";
import PrivacyPolicy from "../ProfileManagement/Privacy&Security";
import CompletedTask from "../HistoryManagement/CompletedTask";
import Goals from "../HistoryManagement/Goals";
import SetGoals from "../HistoryManagement/SetGoals";
import About from "../ProfileManagement/About";
import UpdateTaskPage from "../TaskManagement/UpdateTaskModal";

// Import hidden screens
import ReminderScreen from "../ReminderManagement/ReminderScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for the History tab
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Screen" component={Screen} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="UpdateTaskPage" component={UpdateTaskPage} />
    </Stack.Navigator>
  );
};

const ReminderStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen name="Reminder" component={ReminderScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupport} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    </Stack.Navigator>
  );
};

const HistoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="CompletedTask" component={CompletedTask} />
      <Stack.Screen name="Goals" component={Goals} />
      <Stack.Screen name="SetGoals" component={SetGoals} />
    </Stack.Navigator>
  );
};

const CustomTabBarButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.plusButtonContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.plusButton}>
      <Ionicons name="add" size={32} color="#fff" />
    </View>
  </TouchableOpacity>
);

const TabNavigator = ({ navigation }) => {
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Calendar" component={ReminderStack} />
      <Tab.Screen
        name="Plus"
        component={AddTask} // Temporary, replace with the actual screen
        options={{
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 60,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  plusButtonContainer: {
    position: "absolute",
    top: -25,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginLeft: 5,
  },
  plusButton: {
    width: 60,
    height: 60,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TabNavigator;
