import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";

const HelpSupport = () => {
  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@intellitask.com?subject=Support%20Request");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Help & Support</Text>

      <Text style={styles.subHeader}>Frequently Asked Questions</Text>

      <View style={styles.faqItem}>
        <Text style={styles.question}>📌 How do I add a new task?</Text>
        <Text style={styles.answer}>
          Tap the "Add Task" button on the home screen and fill in the required
          details.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>📌 How can I reset my password?</Text>
        <Text style={styles.answer}>
          Go to the login screen, tap "Forgot Password," and follow the
          instructions.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>
          📌 Does the app support voice commands?
        </Text>
        <Text style={styles.answer}>
          Yes! Use the microphone icon to add tasks using voice input.
        </Text>
      </View>

      <Text style={styles.subHeader}>Contact Support</Text>
      <TouchableOpacity style={styles.button} onPress={handleEmailSupport}>
        <Text style={styles.buttonText}>📩 Email Us</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Feedback</Text>
      <Text style={styles.feedbackText}>
        Have suggestions? Let us know at support@intellitask.com
      </Text>
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
  faqItem: {
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
  },
  answer: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  feedbackText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
});

export default HelpSupport;
