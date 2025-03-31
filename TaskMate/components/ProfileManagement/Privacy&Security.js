import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const PrivacyPolicy = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privacy Policy</Text>

      <Text style={styles.subHeader}>1. Introduction</Text>
      <Text style={styles.text}>
        Welcome to IntelliTask! Your privacy is important to us. This Privacy
        Policy explains how we collect, use, and protect your data.
      </Text>

      <Text style={styles.subHeader}>2. Information We Collect</Text>
      <Text style={styles.text}>
        - **Personal Information**: Name, email, and login details (only when
        using authentication features). - **Task Data**: Your task entries,
        reminders, and schedules. - **Device Data**: Device type, OS, and app
        usage statistics.
      </Text>

      <Text style={styles.subHeader}>3. How We Use Your Information</Text>
      <Text style={styles.text}>
        - To provide, maintain, and improve the IntelliTask app. - To
        personalize your experience and offer smart task reminders. - To enhance
        security and prevent unauthorized access.
      </Text>

      <Text style={styles.subHeader}>4. Data Security</Text>
      <Text style={styles.text}>
        We implement security measures to protect your data. However, no system
        is 100% secure, so we recommend safeguarding your login credentials.
      </Text>

      <Text style={styles.subHeader}>5. Third-Party Services</Text>
      <Text style={styles.text}>
        We may integrate with third-party services (e.g., Google authentication)
        to enhance user experience. These services have their own privacy
        policies.
      </Text>

      <Text style={styles.subHeader}>6. Your Rights</Text>
      <Text style={styles.text}>
        - You can access, update, or delete your personal data. - You may opt
        out of non-essential data collection through settings.
      </Text>

      <Text style={styles.subHeader}>7. Contact Us</Text>
      <Text style={styles.text}>
        If you have any questions, reach out to us at
        **support@intellitask.com**.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PrivacyPolicy;
