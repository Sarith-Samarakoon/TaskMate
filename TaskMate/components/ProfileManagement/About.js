import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigation = useNavigation();

  const features = [
    {
      icon: "checkmark-done-circle",
      title: "Smart Task Management",
      description: "Organize and prioritize tasks with intelligent sorting",
    },
    {
      icon: "alarm",
      title: "Reminders & Deadlines",
      description: "Never miss important deadlines with proactive alerts",
    },
    {
      icon: "mic",
      title: "Voice Integration",
      description: "Add tasks quickly using voice commands",
    },
    {
      icon: "analytics",
      title: "Productivity Insights",
      description: "Get reports on your task completion patterns",
    },
  ];

  return (
    <>
      <TopBar title="About" />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? "#121212" : "#F8FAFF" },
        ]}
      >
        <LinearGradient
          colors={isDark ? ["#1E88E5", "#0D47A1"] : ["#4FC3F7", "#1976D2"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Image
            source={require("../../assets/TaskMateL.png")} // Replace with your logo
            style={styles.logo}
          />
          <Text style={styles.appName}>TaskMate</Text>
          <Text style={styles.tagline}>Your Smart Productivity Assistant</Text>
        </LinearGradient>

        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#2E2E2E" : "#FFF" },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFF" : "#333" }]}
          >
            About TaskMate
          </Text>
          <Text
            style={[styles.description, { color: isDark ? "#CCC" : "#555" }]}
          >
            TaskMate is a smart assistant designed for task and reminder
            management. It helps track, organize, and prioritize tasks using
            voice and text input. This system enhances productivity, prevents
            missed deadlines, and optimizes scheduling through intelligent
            recommendations.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#2E2E2E" : "#FFF" },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFF" : "#333" }]}
          >
            Key Features
          </Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name={feature.icon}
                size={24}
                color={isDark ? "#4DA6FF" : "#1E88E5"}
                style={styles.featureIcon}
              />
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: isDark ? "#FFF" : "#333" },
                  ]}
                >
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    { color: isDark ? "#AAA" : "#666" },
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#2E2E2E" : "#FFF" },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#FFF" : "#333" }]}
          >
            Version & Credits
          </Text>
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle"
              size={20}
              color={isDark ? "#4DA6FF" : "#1E88E5"}
            />
            <Text
              style={[styles.infoText, { color: isDark ? "#CCC" : "#555" }]}
            >
              Version 1.0.0
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="code"
              size={20}
              color={isDark ? "#4DA6FF" : "#1E88E5"}
            />
            <Text
              style={[styles.infoText, { color: isDark ? "#CCC" : "#555" }]}
            >
              Developed with React Native
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="heart"
              size={20}
              color={isDark ? "#4DA6FF" : "#1E88E5"}
            />
            <Text
              style={[styles.infoText, { color: isDark ? "#CCC" : "#555" }]}
            >
              Made with ❤️ for productive people
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Changed to navigate to the "Home" tab
          style={styles.homeButtonWrapper}
        >
          <LinearGradient
            colors={["#42a5f5", "#1976d2"]}
            style={styles.homeButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.9,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  featureIcon: {
    marginRight: 15,
    marginTop: 3,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
  },
  homeButtonWrapper: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default About;
