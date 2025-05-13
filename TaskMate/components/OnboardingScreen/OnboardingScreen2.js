import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Onboarding2 = ({ navigation }) => {
  const handleNext = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("Onboarding3");
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Onboarding1"); // Or some other fallback screen
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App name */}
        <Text style={styles.appName}>TasksMate</Text>

        {/* Calendar image in the middle */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/Screen2.png")} // Replace with your actual image path
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Onboarding text */}
        <View style={styles.onboardingTextContainer}>
          <Text style={styles.onboardingTitle}>Smart Task Management</Text>
          <Text style={styles.onboardingDescription}>
            Organize and prioritize tasks using voice or{"\n"}text input with
            AI-powered assistance
          </Text>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  skip: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginVertical: 16,
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width * 0.9,
    height: height * 0.4,
    marginBottom: 10,
    marginTop: 20
  },
  onboardingTextContainer: {
    marginBottom:30,
    marginTop:10,
    alignItems: "center",
  },
  onboardingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1D4ED8",
    marginBottom: 6,
    marginTop: 10,
    textAlign: "center",
  },
  onboardingDescription: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 2,
  },

  nextButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Onboarding2;
