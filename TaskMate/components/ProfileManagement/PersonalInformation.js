import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import TopBar from "../MenuBars/TopBar";
import { supabase } from "../../lib/supabaseConfig"; // your initialized Supabase client
import { getCurrentUser } from "../../lib/appwriteConfig"; // assuming you fetch auth data from here

const PersonalInformation = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const pickImageAndUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert("Permission Denied", "Media access is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileExt = file.uri.split(".").pop();
        const fileName = `${user.$id || "user"}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(`profile/${fileName}`, blob, {
            cacheControl: "3600",
            upsert: true,
            contentType: blob.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicURL } = supabase.storage
          .from("images")
          .getPublicUrl(`profile/${fileName}`);

        if (publicURL?.publicUrl) {
          setUser((prev) => ({
            ...prev,
            prefs: {
              ...prev.prefs,
              profilePicture: publicURL.publicUrl,
            },
          }));
        }
      }
    } catch (err) {
      console.error("Image upload failed:", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
      contentContainerStyle={styles.scrollContainer}
    >
      <TopBar title="Personal Information" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={theme === "dark" ? "#FFF" : "#333"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          Personal Information
        </Text>
        <View style={{ width: 28 }} /> {/* Alignment placeholder */}
      </View>
      {/* User Info */}
      <View
        style={[
          styles.infoContainer,
          theme === "dark" ? styles.darkCard : styles.lightCard,
        ]}
      >
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={pickImageAndUpload}
        >
          <Image
            source={{
              uri:
                user?.prefs?.profilePicture ||
                "https://i.pinimg.com/736x/0b/97/6f/0b976f0a7aa1aa43870e1812eee5a55d.jpg",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.uploadHint}>Tap to change</Text>
        </TouchableOpacity>

        <View style={styles.infoItem}>
          <Text
            style={[
              styles.label,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            Name
          </Text>
          <Text
            style={[
              styles.value,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            {user?.name || "person"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text
            style={[
              styles.label,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            Email
          </Text>
          <Text
            style={[
              styles.value,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            {user?.email || "person@gmail.com"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#121212" },
  lightContainer: { backgroundColor: "#F9F9F9" },
  scrollContainer: { paddingBottom: 20 },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  infoContainer: {
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginTop: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#00FF00",
  },
  infoItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
  },

  darkCard: { backgroundColor: "#1E1E1E", elevation: 2 },
  lightCard: { backgroundColor: "#FFF", elevation: 2 },

  darkText: { color: "#FFF" },
  lightText: { color: "#333" },
  darkSubText: { color: "#BBB" },
  lightSubText: { color: "#777" },
});

export default PersonalInformation;
