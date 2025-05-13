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

const Onboarding4 = ({ navigation }) => {
  const handleGetStarted = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("Auth");
  };
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Onboarding3"); // Or some other fallback screen
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button and skip button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGetStarted}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* App name */}
        <Text style={styles.appName}>TaskMate</Text>

        {/* Main image */}
        <Image
          source={require("../../assets/Screen4.png")}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {/* Feature title */}
        <Text style={styles.featureTitle}>Track Your Progress</Text>

        {/* Feature description */}
        <Text style={styles.featureDescription}>
          Monitor task completion and optimize{"\n"}your productivity with AI
          insights
        </Text>

        {/* Get Started button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Let's Get Started</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  skip: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 48,
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 24,
  },
  mainImage: {
    width: width * 0.85,
    height: height * 0.35,
    marginBottom: 30,
    marginTop: 40,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1D4ED8",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 80,
  },
  featureDescription: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Onboarding4;
