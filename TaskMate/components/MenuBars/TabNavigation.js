import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Import your screens
import HomeScreen from "../TaskManagement/HomeScreen";
import CalendarScreen from "../ReminderManagement/CalenderScreen";
import HistoryScreen from "../HistoryManagement/HistoryScreen";
import ProfileScreen from "../ProfileManagement/ProfileScreen";

const Tab = createBottomTabNavigator();

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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen
        name="Plus"
        component={HomeScreen} // Temporary, replace with the actual screen
        options={{
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
