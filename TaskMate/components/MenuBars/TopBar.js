import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions, // Import useWindowDimensions
} from "react-native";
import { getCurrentUser } from "../../lib/appwriteConfig";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext"; // Import ThemeContext
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const TopBar = ({ title }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme(); // Get theme & toggle function
  const navigation = useNavigation(); // Get the navigation object
  const { width } = useWindowDimensions(); // Get screen width for responsive design

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Define dynamic padding and font sizes based on screen width
  const isSmallScreen = width < 375; // Consider screens smaller than 375px as small screens
  const titleFontSize = isSmallScreen ? 18 : 22; // Smaller font size for small screens
  const iconSize = isSmallScreen ? 20 : 24; // Smaller icons for small screens

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
        { paddingHorizontal: isSmallScreen ? 10 : 20 }, // Adjust padding for small screens
      ]}
    >
      <Text
        style={[
          styles.title,
          theme === "dark" ? styles.darkText : styles.lightText,
          { fontSize: titleFontSize }, // Adjust title font size based on screen size
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
              style={[
                styles.profileImage,
                {
                  width: isSmallScreen ? 35 : 40,
                  height: isSmallScreen ? 35 : 40,
                }, // Adjust profile image size
              ]}
            />
          </View>
        ) : null}

        {/* Theme Toggle Button */}
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons
            name={theme === "dark" ? "sunny-outline" : "moon-outline"}
            size={iconSize}
            color={theme === "dark" ? "#FFD700" : "#000080"}
          />
        </TouchableOpacity>

        {/* Bell Icon Button for Notifications */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("Notification")}
        >
          <Ionicons
            name="notifications-outline"
            size={iconSize}
            color={theme === "dark" ? "#FFD700" : "#000080"} // Dark mode icon color is gold (#FFD700)
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginTop: 5,
  },
  lightContainer: {
    backgroundColor: "#ffff",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontWeight: "bold",
  },
  lightText: {
    color: "#0047AB",
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
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#0047AB",
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
  },
  addButton: {
    marginLeft: 10,
  },
});

export default TopBar;
