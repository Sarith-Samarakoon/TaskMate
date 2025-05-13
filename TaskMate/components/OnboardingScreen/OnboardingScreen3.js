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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Onboarding3 = ({ navigation }) => {
  const handleNext = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("Onboarding4");
  };
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Onboarding2"); // Or some other fallback screen
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button, time and skip button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Main image - replace with your actual image */}
        <Image
          source={require("../../assets/Screen3.png")}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {/* Feature description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Intelligent Reminders</Text>
          <Text style={styles.description}>
            Content-based smart reminders that adapt to your schedule and
            priorities
          </Text>
        </View>

        {/* Next button */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  skip: {
    fontSize: 16,
    color: "#007AFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginBottom: 10,
  },
  mainImage: {
    width: width * 0.9,
    height: height * 0.35,
    marginBottom: 50,
    marginTop: 90,
  },
  textContainer: {
    marginBottom: 30,
    marginTop:80,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#1D4ED8",
  },
  description: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Onboarding3;
