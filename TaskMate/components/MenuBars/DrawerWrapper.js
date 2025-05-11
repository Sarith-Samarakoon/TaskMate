// components/MenuBars/DrawerWrapper.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  MaterialIcons,
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";

import TabNavigator from "./TabNavigation";
import { account } from "../../lib/appwriteConfig"; // Adjust the import path if needed
import { useNavigation } from "@react-navigation/native";
import Notification from "../ReminderManagement/NotificationScreen";
import About from "../ProfileManagement/About";
import HelpSupport from "../ProfileManagement/Help&Support";
import PrivacyPolicy from "../ProfileManagement/Privacy&Security";

const logo = require("../../assets/TaskMateL.png");

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await account.deleteSession("current"); // Logs out the current session
            console.log("User logged out");
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" }], // Resets the navigation stack
            });
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // const handleRateApp = () => {
  //   // Replace with your app store link
  //   const appStoreLink = "https://apps.apple.com/us/app/your-app/id123456789";
  //   Linking.openURL(appStoreLink).catch((err) => {
  //     Alert.alert("Error", "Unable to open app store");
  //   });
  // };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>TaskMate</Text>
        <Text style={styles.headerSubtitle}>Organize. Focus. Achieve.</Text>
      </View>

      <View style={styles.drawerItems}>
        <DrawerItem
          icon={
            <Ionicons name="notifications-outline" size={24} color="#4a6fa5" />
          }
          label="Notifications"
          onPress={() => navigation.navigate("Notification")}
        />
        <DrawerItem
          icon={<Feather name="info" size={24} color="#4a6fa5" />}
          label="About"
          onPress={() => navigation.navigate("About")}
        />
        <DrawerItem
          icon={
            <Ionicons name="help-circle-outline" size={24} color="#4a6fa5" />
          }
          label="Help & Support"
          onPress={() => navigation.navigate("Help & Support")}
        />
        <DrawerItem
          icon={
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={24}
              color="#4a6fa5"
            />
          }
          label="Privacy Policy"
          onPress={() => navigation.navigate("Privacy & Policy")}
        />
        {/* <DrawerItem
          icon={<FontAwesome name="star" size={24} color="#4a6fa5" />}
          label="Rate Us"
          onPress={handleRateApp}
        /> */}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const DrawerItem = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.itemLabel}>{label}</Text>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color="#ccc"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const DrawerWrapper = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: styles.drawer,
        drawerActiveTintColor: "#4a6fa5",
        drawerInactiveTintColor: "#555",
        drawerLabelStyle: styles.drawerLabel,
        drawerActiveBackgroundColor: "#e8f0fe",
        overlayColor: "rgba(0,0,0,0.1)",
        drawerType: "slide",
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="HomeTabs"
    >
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notification"
        component={Notification}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="About"
        component={About}
        options={{
          drawerIcon: ({ color, size }) => (
            <Feather name="info" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Help & Support"
        component={HelpSupport}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Privacy & Policy"
        component={PrivacyPolicy}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerHeader: {
    height: 220,
    backgroundColor: "#4a6fa5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "sans-serif-medium",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 5,
    fontFamily: "sans-serif",
  },
  drawerItems: {
    flex: 1,
    paddingTop: 15,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 3,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
    flex: 1,
    fontFamily: "sans-serif",
  },
  chevron: {
    marginLeft: "auto",
  },
  drawer: {
    width: "78%",
    backgroundColor: "#fff",
  },
  drawerLabel: {
    fontSize: 16,
    marginLeft: -15,
    fontWeight: "500",
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9e6e6",
    marginBottom: 15,
  },
  logoutText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  footerText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  },
});

export default DrawerWrapper;
