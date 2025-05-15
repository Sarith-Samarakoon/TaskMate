import { Client, Account, Databases, Storage, ID } from "appwrite";
import { launchImageLibrary } from "react-native-image-picker";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);
const bucketId = "67dbcd080010eecc3c4d";

// Register user
export const registerUser = async (email, password, name) => {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    return user;
  } catch (error) {
    console.error("Registration Error:", error);
    return null;
  }
};

// Email & password login
export const loginUser = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    await AsyncStorage.setItem("session", JSON.stringify(session));
    return session;
  } catch (error) {
    console.error("Login Error:", error);
    return null;
  }
};

// Google OAuth login
export const loginWithGoogle = async () => {
  try {
    const authUrl = account.createOAuth2Session(
      "google",
      "http://localhost:8081/",
      "http://localhost:8081/fail"
    );
    return authUrl;
  } catch (error) {
    console.error("Google Login Error:", error);
    return null;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
    await AsyncStorage.removeItem("session");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await account.createRecovery(email, "app://password-reset");
    Alert.alert("Password reset email sent!");
  } catch (error) {
    console.error("Password Reset Error:", error);
  }
};

// Upload profile picture to Appwrite and update user prefs
export const updateProfilePicture = async () => {
  try {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 512,
      maxHeight: 512,
    };
    const response = await launchImageLibrary(options);

    if (response.didCancel) {
      console.log("User cancelled image picker");
      return null;
    }
    if (response.errorCode) {
      throw new Error(`ImagePicker Error: ${response.errorMessage}`);
    }

    const asset = response.assets[0];
    const fileUri = asset.uri;
    const fileName = asset.fileName || `profile_${ID.unique()}.jpg`;
    const mimeType = asset.type || "image/jpeg";

    // Read file content using expo-file-system
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Create a File object for Appwrite
    const file = {
      uri: fileUri,
      name: fileName,
      type: mimeType,
      size: fileInfo.size, // Include size to avoid undefined error
    };

    // Upload to Appwrite storage bucket
    const uploadedFile = await storage.createFile(bucketId, ID.unique(), file);

    // Get the file URL
    const fileUrl = storage.getFileView(bucketId, uploadedFile.$id).href;

    // Update user preferences with the new profile picture URL
    await account.updatePrefs({ profilePicture: fileUrl });

    return fileUrl;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    Alert.alert("Error", "Failed to update profile picture.");
    return null;
  }
};

// Initialize Appwrite Databases
const databaseId = "67de6cb1003c63a59683";
const collectionId = "67e15b720007d994f573";

export const handleCreateTask = async (
  title,
  description,
  priority,
  Category,
  deadline,
  completed,
  schedule
) => {
  if (!title.trim()) {
    Alert.alert("Validation Error", "Title is required.");
    return;
  }

  if (!deadline) {
    Alert.alert("Validation Error", "Deadline is required.");
    return;
  }

  try {
    const newTask = {
      title,
      description,
      priority,
      Deadline: deadline.toISOString(),
      Category,
      completed,
      schedule,
    };

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      newTask
    );

    Alert.alert("Task Created", "Your task has been successfully saved.");
  } catch (error) {
    console.error("Error creating task:", error);
    Alert.alert("Error", "Failed to create task.");
  }
};

export { client, databases, account, storage, ID };
