import { Client, Account } from "appwrite";
import { launchImageLibrary } from "react-native-image-picker";
import { ID } from "appwrite";
import { Storage } from "appwrite"; // Ensure you are using the correct import
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("67d2d4400029f32f7259"); // Replace with your Project ID

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

export { account };
