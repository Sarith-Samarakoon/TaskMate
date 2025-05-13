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

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

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
      <TouchableOpacity
        onPress={navigation.openDrawer}
        style={{ marginRight: 10, marginTop: 30 }}
      >
        <Ionicons
          name="menu-outline"
          size={iconSize}
          color={theme === "dark" ? "#FFD700" : "#000080"}
        />
      </TouchableOpacity>
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
                  "https://i.pinimg.com/736x/0b/97/6f/0b976f0a7aa1aa43870e1812eee5a55d.jpg",
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginTop: 3,
  },
  lightContainer: {
    backgroundColor: "#ffff",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontWeight: "bold",
    marginTop:30
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
    marginTop:30
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    marginRight: 5,
    fontWeight: "500",
  },
  profileImage: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "green",
  },
  themeToggle: {
    padding: 0,
    borderRadius: 8,
  },
  addButton: {
    marginLeft: 10,
  },
});

export default TopBar;
