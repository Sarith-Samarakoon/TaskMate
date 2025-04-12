import { Client, Account } from "appwrite";
import { Databases } from "appwrite";
import { launchImageLibrary } from "react-native-image-picker";
import { ID } from "appwrite";
import { Alert } from "react-native";
import { Storage } from "appwrite"; // Ensure you are using the correct import
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("67d2d4400029f32f7259"); // Replace with your Project ID

// Initialize Appwrite Databases
const databases = new Databases(client);

// Initialize Appwrite Account
const account = new Account(client);
const storage = new Storage(client);
const bucketId = "67dbcd080010eecc3c4d"; // Replace with your Appwrite bucket ID

// Register user
export const registerUser = async (email, password, name) => {
  try {
    const user = await account.create("unique()", email, password, name);
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
    alert("Password reset email sent!");
  } catch (error) {
    console.error("Password Reset Error:", error);
  }
};

// Upload profile picture to Appwrite and update user prefs
export const updateProfilePicture = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      launchImageLibrary({ mediaType: "photo", quality: 0.5 }, (response) => {
        if (response.didCancel || response.errorCode || !response.assets) {
          reject("Image selection cancelled or failed.");
        } else {
          resolve(response.assets[0]);
        }
      });
    });

    const { uri } = result;
    const fileName = uri.split("/").pop();

    // Convert URI to a format Appwrite accepts
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload file
    const uploadedFile = await storage.createFile(
      bucketId,
      ID.unique(),
      Buffer.from(fileContent, "base64"),
      fileName
    );

    const fileId = uploadedFile.$id;

    // Generate URL
    const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=67d2d4400029f32f7259`;

    // Update user preferences with the new profile picture URL
    await account.updatePrefs({ profilePicture: fileUrl });

    return fileUrl;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
};

const uploadImageToAppwrite = async (uri) => {
  try {
    const file = await storage.createFile(bucketId, ID.unique(), uri);
    return file.$id;
  } catch (error) {
    console.error("Image Upload Error:", error);
    return null;
  }
};

// Initialize Appwrite Databases
const databaseId = "67de6cb1003c63a59683"; // Replace with your actual Database ID
const collectionId = "67e15b720007d994f573"; // Replace with your actual Collection ID

export const handleCreateTask = async (
  title,
  description,
  priority,
  Category,
  deadline,
  image
) => {
  if (!title.trim()) {
    Alert.alert("Validation Error", "Title is required.");
    return;
  }

  if (!deadline) {
    Alert.alert("Validation Error", "Deadline is required.");
    return;
  }

  let imageFileId = null;
  if (image) {
    imageFileId = await uploadImageToAppwrite(image);
  }

  try {
    const newTask = {
      title,
      description,
      priority,
      Deadline: deadline.toISOString(), // Ensure the deadline is formatted correctly
      Category,
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

// Export
export { client, databases, account };
