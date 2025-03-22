import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  getCurrentUser,
  logoutUser,
  updateProfilePicture,
} from "../../lib/appwriteConfig";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";

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
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="Profile" />
      <View
        style={[
          styles.header,
          theme === "dark" ? styles.darkHeader : styles.lightHeader,
        ]}
      >
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
            theme === "dark" ? styles.darkHeaderTitle : styles.lightHeaderTitle,
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
          <Ionicons name="camera-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.name,
          theme === "dark" ? styles.darkName : styles.lightName,
        ]}
      >
        {user?.name || "User Name"}
      </Text>
      <Text
        style={[
          styles.email,
          theme === "dark" ? styles.darkEmail : styles.lightEmail,
        ]}
      >
        {user?.email || "user@example.com"}
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#121212" },
  lightContainer: { backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  darkHeaderTitle: { color: "#FFF" },
  lightHeaderTitle: { color: "#333" },
  profileContainer: { alignItems: "center", marginBottom: 15 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#007AFF",
    padding: 6,
    borderRadius: 15,
  },
  name: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  darkName: { color: "#FFF" },
  lightName: { color: "#333" },
  email: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  darkEmail: { color: "#BBB" },
  lightEmail: { color: "#666" },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButton: { backgroundColor: "#FF3B30" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default ProfileScreen;
