import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext"; // Import theme context

const PrivacyPolicy = ({ navigation }) => {
  const { theme } = useTheme(); // Access the current theme

  return (
    <ScrollView
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="Privacy&Security" />
      <Text
        style={[
          styles.header,
          theme === "dark" ? styles.darkText : styles.lightText,
        ]}
      >
        Privacy Policy
      </Text>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          1. Introduction
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          Welcome to IntelliTask! Your privacy is important to us. This Privacy
          Policy explains how we collect, use, and protect your data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          2. Information We Collect
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          - <Text style={styles.bold}>Personal Information:</Text> Name, email,
          and login details (only when using authentication features).
          {"\n"}- <Text style={styles.bold}>Task Data:</Text> Your task entries,
          reminders, and schedules.
          {"\n"}- <Text style={styles.bold}>Device Data:</Text> Device type, OS,
          and app usage statistics.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          3. How We Use Your Information
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          - To provide, maintain, and improve the IntelliTask app.
          {"\n"}- To personalize your experience and offer smart task reminders.
          {"\n"}- To enhance security and prevent unauthorized access.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          4. Data Security
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          We implement security measures to protect your data. However, no
          system is 100% secure, so we recommend safeguarding your login
          credentials.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          5. Third-Party Services
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          We may integrate with third-party services (e.g., Google
          authentication) to enhance user experience. These services have their
          own privacy policies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          6. Your Rights
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          - You can access, update, or delete your personal data.
          {"\n"}- You may opt out of non-essential data collection through
          settings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.subHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          7. Contact Us
        </Text>
        <Text
          style={[
            styles.text,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          If you have any questions, reach out to us at{" "}
          <Text style={styles.email}>support@intellitask.com</Text>.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          theme === "dark" ? styles.darkButton : styles.lightButton,
        ]}
        onPress={() => navigation.goBack()}
      >
        <Text
          style={[
            styles.buttonText,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          ⬅ Back
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  lightContainer: {
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
  },
  email: {
    fontWeight: "bold",
    color: "#007bff",
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  darkText: {
    color: "#FFF",
  },
  lightText: {
    color: "#333",
  },
  darkSubText: {
    color: "#BBB",
  },
  lightSubText: {
    color: "#777",
  },
  darkButton: {
    backgroundColor: "#007bff",
  },
  lightButton: {
    backgroundColor: "#007bff",
  },
});

export default PrivacyPolicy;
