import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  getCurrentUser,
  logoutUser,
  updateProfilePicture,
} from "../../lib/appwriteConfig";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import TopBar from "../MenuBars/TopBar";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigation.replace("Auth");
  };

  const handleProfilePictureChange = async () => {
    try {
      const newProfilePicUrl = await updateProfilePicture();
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: newProfilePicUrl,
      }));
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
      contentContainerStyle={styles.scrollContainer}
    >
      <TopBar title="Profile" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={theme === "dark" ? "#FFF" : "#333"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          Profile
        </Text>
        <TouchableOpacity>
          <Ionicons
            name="settings-outline"
            size={28}
            color={theme === "dark" ? "#FFF" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri:
              user?.profilePicture ||
              "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg",
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.editIcon}
          onPress={handleProfilePictureChange}
        >
          <Ionicons name="camera" size={18} color="#FFF" />
        </TouchableOpacity>
        <Text
          style={[
            styles.name,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          {user?.name || "User Name"}
        </Text>
        <Text
          style={[
            styles.email,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          {user?.email || "user@example.com"}
        </Text>
      </View>

      {/* User Stats */}
      <View
        style={[
          styles.statsContainer,
          theme === "dark" ? styles.darkCard : styles.lightCard,
        ]}
      >
        <View style={styles.stat}>
          <Text
            style={[
              styles.statValue,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            248
          </Text>
          <Text
            style={[
              styles.statLabel,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            Tasks
          </Text>
        </View>
        <View style={styles.stat}>
          <Text
            style={[
              styles.statValue,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            86%
          </Text>
          <Text
            style={[
              styles.statLabel,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            Completed
          </Text>
        </View>
        <View style={styles.stat}>
          <Text
            style={[
              styles.statValue,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            12
          </Text>
          <Text
            style={[
              styles.statLabel,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            Reminders
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View
        style={[
          styles.menu,
          theme === "dark" ? styles.darkCard : styles.lightCard,
        ]}
      >
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (option.label === "Help & Support") {
                navigation.navigate("HelpSupport"); // Ensure this is the correct screen name
              } else if (option.label === "Privacy & Security") {
                navigation.navigate("PrivacyPolicy"); // Ensure this matches your navigation stack
              }
            }}
          >
            <Ionicons name={option.icon} size={20} color={theme === "dark" ? "#FFF" : "#333"} />
            <Text style={[styles.menuText, theme === "dark" ? styles.darkText : styles.lightText]}>
              {option.label}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme === "dark" ? "#BBB" : "#666"} />
          </TouchableOpacity>


        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          theme === "dark" ? styles.darkButton : styles.lightButton,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const menuOptions = [
  { icon: "person-outline", label: "Personal Information" },
  { icon: "mic-outline", label: "Voice Settings" },
  { icon: "lock-closed-outline", label: "Privacy & Security" },
  { icon: "help-circle-outline", label: "Help & Support" },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#121212" },
  lightContainer: { backgroundColor: "#F9F9F9" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  profileContainer: { alignItems: "center", marginBottom: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 10,
    backgroundColor: "#007AFF",
    padding: 6,
    borderRadius: 15,
  },

  name: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  email: { fontSize: 14, marginBottom: 10 },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 14 },

  menu: { borderRadius: 10 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: { flex: 1, marginLeft: 10, fontSize: 16 },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },

  darkCard: { backgroundColor: "#1E1E1E", elevation: 2 },
  lightCard: { backgroundColor: "#FFF", elevation: 2 },

  darkText: { color: "#FFF" },
  lightText: { color: "#333" },
  darkSubText: { color: "#BBB" },
  lightSubText: { color: "#777" },

  darkButton: { backgroundColor: "#FF5555" },
  lightButton: { backgroundColor: "#FF3B30" },
});

export default ProfileScreen;
