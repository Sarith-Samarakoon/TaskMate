import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getCurrentUser } from "../../lib/appwriteConfig";
import TopBar from "../MenuBars/TopBar"; // Importing the new TopBar
import { useTheme } from "../ThemeContext"; // Import ThemeContext

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // Get theme

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigation.replace("Auth");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#FFD700" : "#007AFF"}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5" },
      ]}
    >
      <TopBar title="Home" />
      <View style={styles.content}>
        {user ? (
          <>
            <Text
              style={[
                styles.title,
                { color: theme === "dark" ? "#FFD700" : "#333" },
              ]}
            >
              Welcome, {user.name}!
            </Text>
            <Text
              style={[
                styles.email,
                { color: theme === "dark" ? "#fff" : "#333" },
              ]}
            >
              Email: {user.email}
            </Text>
          </>
        ) : (
          <Text style={{ color: theme === "dark" ? "#FFD700" : "#333" }}>
            Redirecting...
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default HomeScreen;
