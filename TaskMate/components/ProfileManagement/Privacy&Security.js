import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import TopBar from "../MenuBars/TopBar";

const PrivacyPolicy = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <TopBar title="Privacy&Security" />
      <Text style={styles.header}>Privacy Policy</Text>

      <View style={styles.section}>
        <Text style={styles.subHeader}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to IntelliTask! Your privacy is important to us. This Privacy
          Policy explains how we collect, use, and protect your data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>2. Information We Collect</Text>
        <Text style={styles.text}>
          - <Text style={styles.bold}>Personal Information:</Text> Name, email, and login details (only when
          using authentication features).
          {"\n"}- <Text style={styles.bold}>Task Data:</Text> Your task entries, reminders, and schedules.
          {"\n"}- <Text style={styles.bold}>Device Data:</Text> Device type, OS, and app
          usage statistics.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>3. How We Use Your Information</Text>
        <Text style={styles.text}>
          - To provide, maintain, and improve the IntelliTask app.
          {"\n"}- To personalize your experience and offer smart task reminders.
          {"\n"}- To enhance security and prevent unauthorized access.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>4. Data Security</Text>
        <Text style={styles.text}>
          We implement security measures to protect your data. However, no system
          is 100% secure, so we recommend safeguarding your login credentials.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>5. Third-Party Services</Text>
        <Text style={styles.text}>
          We may integrate with third-party services (e.g., Google authentication)
          to enhance user experience. These services have their own privacy
          policies.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>6. Your Rights</Text>
        <Text style={styles.text}>
          - You can access, update, or delete your personal data.
          {"\n"}- You may opt out of non-essential data collection through settings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>7. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions, reach out to us at{" "}
          <Text style={styles.email}>support@intellitask.com</Text>.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>⬅ Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
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
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PrivacyPolicy;