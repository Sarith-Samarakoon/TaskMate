import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Onboarding1 = ({ navigation }) => {
  const handleGetStarted = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("Onboarding2"); // Or your next screen
  };

return (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      {/* Main onboarding image */}
      <Image
        source={require("../../assets/TaskMateL.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Spacer to push text closer to button */}
      <View style={{ flex: 1 }} />

      {/* Title & Subtitle */}
      <Text style={styles.title}>TaskMate</Text>
      <Text style={styles.subtitle}>Your AI-powered personal assistant</Text>
      <Text style={styles.subtitle}>for smart task management</Text>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop:30,
    paddingBottom: 40, // Added some bottom padding
  },
   title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 6,
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 2,
  },
  image: {
    width: width * 0.8, // Slightly wider for better display
    height: height * 0.3,
    marginBottom: 10,
    marginTop: 20
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 40,
    width: width * 0.8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Onboarding1;
