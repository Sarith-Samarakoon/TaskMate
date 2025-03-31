import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getCurrentUser } from "../../lib/appwriteConfig";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext"; // Import ThemeContext

const TopBar = ({ title }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme(); // Get theme & toggle function

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <Text
        style={[
          styles.title,
          theme === "dark" ? styles.darkText : styles.lightText,
        ]}
      >
        {title}
      </Text>

      <View style={styles.rightSection}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme === "dark" ? "#FFD700" : "#fff"}
          />
        ) : user ? (
          <View style={styles.profileContainer}>
            <Text
              style={[
                styles.userName,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              {user.name}
            </Text>
            <Image
              source={{
                uri:
                  user.profileImage ||
                  "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
        ) : null}

        {/* Theme Toggle Button */}
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons
            name={theme === "dark" ? "sunny-outline" : "moon-outline"}
            size={24}
            color={theme === "dark" ? "#FFD700" : "#fff"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  lightContainer: {
    backgroundColor: "#007AFF",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  lightText: {
    color: "#fff",
  },
  darkText: {
    color: "#FFD700",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: "500",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  themeToggle: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
});

export default TopBar;
