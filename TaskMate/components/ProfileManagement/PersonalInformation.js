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
import { databases, getCurrentUser } from "../../lib/appwriteConfig";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";

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

  const generateTaskReport = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "User not found. Please try again.");
        return;
      }

      // Load logo from assets
      const logoAsset = Asset.fromModule(require("../../assets/TaskMateL.png"));
      await logoAsset.downloadAsync();
      const logoUri = logoAsset.localUri || logoAsset.uri;
      const logoBase64 = await FileSystem.readAsStringAsync(logoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;

      // Fetch tasks from Appwrite
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683", // Database ID
        "67e15b720007d994f573" // Collection ID
        // [Query.equal("user_id", user.$id)] // Uncomment if tasks are filtered by user_id
      );

      const tasks = response.documents;

      if (!tasks || tasks.length === 0) {
        Alert.alert("Task Report", "No tasks found for this user.");
        return;
      }

      // Generate HTML content for PDF
      let html = `
        <html>
          <head>
            <style>
              body {
                font-family: Helvetica, Arial, sans-serif;
                margin: 40px;
                color: #333;
                background-color: #f9f9f9;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header img {
                max-width: 150px;
                margin-bottom: 10px;
              }
              .header h1 {
                color: #1a73e8;
                font-size: 24px;
                margin: 0;
              }
              .header p {
                color: #555;
                font-size: 14px;
                margin: 5px 0;
              }
              .summary {
                margin: 20px 0;
                padding: 15px;
                background-color: #e8f0fe;
                border-radius: 6px;
              }
              .summary p {
                margin: 5px 0;
                font-size: 14px;
              }
              .summary strong {
                color: #1a73e8;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border: 1px solid #ddd;
              }
              th {
                background-color: #1a73e8;
                color: #fff;
                font-weight: bold;
              }
              tr:nth-child(even) {
                background-color: #f5f5f5;
              }
              tr:hover {
                background-color: #e8f0fe;
              }
              .label {
                font-weight: bold;
                color: #333;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logoDataUrl}" alt="Logo" />
                <h1>Task Report</h1>
                <p><strong>User:</strong> ${user.name || "User"} (${
        user.email || "No email"
      })</p>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div class="summary">
                <p><strong>Total Tasks:</strong> ${tasks.length}</p>
                <p><strong>Completed:</strong> ${
                  tasks.filter((t) => t.completed).length
                }</p>
                <p><strong>Pending:</strong> ${
                  tasks.filter((t) => !t.completed).length
                }</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Schedule</th>
                    <th>Skip Count</th>
                  </tr>
                </thead>
                <tbody>
      `;

      tasks.forEach((task, index) => {
        html += `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${task.title}</td>
                    <td>${
                      task.description
                        ? task.description.substring(0, 100) +
                          (task.description.length > 100 ? "..." : "")
                        : "N/A"
                    }</td>
                    <td>${task.priority || "N/A"}</td>
                    <td>${
                      task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td>${task.category || "N/A"}</td>
                    <td>${task.completed ? "Completed" : "Pending"}</td>
                    <td>${task.schedule || "N/A"}</td>
                    <td>${task.skipCount || 0}</td>
                  </tr>
        `;
      });

      html += `
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Define file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `TaskReport_${timestamp}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Move the PDF to the document directory
      await FileSystem.moveAsync({
        from: uri,
        to: filePath,
      });

      // Notify user and offer to share/open
      Alert.alert(
        "Success",
        `Task report saved as ${fileName}`,
        [
          {
            text: "Open/Share",
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
              } else {
                Alert.alert(
                  "Error",
                  "Sharing is not available on this device."
                );
              }
            },
          },
          { text: "OK" },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error generating task report:", error);
      if (error.code === 404) {
        Alert.alert(
          "Error",
          "Tasks collection not found. Please contact support."
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to generate task report. Please try again."
        );
      }
    }
  };

  const generateRemindersReport = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "User not found. Please try again.");
        return;
      }

      // Load logo from assets
      const logoAsset = Asset.fromModule(require("../../assets/TaskMateL.png"));
      await logoAsset.downloadAsync();
      const logoUri = logoAsset.localUri || logoAsset.uri;
      const logoBase64 = await FileSystem.readAsStringAsync(logoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;

      // Fetch reminders from Appwrite
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683", // Database ID
        "67e00a9c0006981492be" // Collection ID
        // [Query.equal("user_id", user.$id)] // Uncomment if reminders are filtered by user_id
      );

      const reminders = response.documents;

      if (!reminders || reminders.length === 0) {
        Alert.alert("Reminders Report", "No reminders found for this user.");
        return;
      }

      // Generate HTML content for PDF
      let html = `
        <html>
          <head>
            <style>
              body {
                font-family: Helvetica, Arial, sans-serif;
                margin: 40px;
                color: #333;
                background-color: #f9f9f9;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header img {
                max-width: 150px;
                margin-bottom: 10px;
              }
              .header h1 {
                color: #1a73e8;
                font-size: 24px;
                margin: 0;
              }
              .header p {
                color: #555;
                font-size: 14px;
                margin: 5px 0;
              }
              .summary {
                margin: 20px 0;
                padding: 15px;
                background-color: #e8f0fe;
                border-radius: 6px;
              }
              .summary p {
                margin: 5px 0;
                font-size: 14px;
              }
              .summary strong {
                color: #1a73e8;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border: 1px solid #ddd;
              }
              th {
                background-color: #1a73e8;
                color: #fff;
                font-weight: bold;
              }
              tr:nth-child(even) {
                background-color: #f5f5f5;
              }
              tr:hover {
                background-color: #e8f0fe;
              }
              .label {
                font-weight: bold;
                color: #333;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logoDataUrl}" alt="Logo" />
                <h1>Reminders Report</h1>
                <p><strong>User:</strong> ${user.name || "User"} (${
        user.email || "No email"
      })</p>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div class="summary">
                <p><strong>Total Reminders:</strong> ${reminders.length}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Note</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
      `;

      reminders.forEach((reminder, index) => {
        html += `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${reminder.TaskTitle}</td>
                    <td>${
                      reminder.Date
                        ? new Date(reminder.Date).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td>${
                      reminder.Note
                        ? reminder.Note.substring(0, 100) +
                          (reminder.Note.length > 100 ? "..." : "")
                        : "N/A"
                    }</td>
                    <td>${
                      reminder.SetTime
                        ? new Date(reminder.SetTime).toLocaleTimeString()
                        : "N/A"
                    }</td>
                  </tr>
        `;
      });

      html += `
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Define file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `RemindersReport_${timestamp}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Move the PDF to the document directory
      await FileSystem.moveAsync({
        from: uri,
        to: filePath,
      });

      // Notify user and offer to share/open
      Alert.alert(
        "Success",
        `Reminders report saved as ${fileName}`,
        [
          {
            text: "Open/Share",
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
              } else {
                Alert.alert(
                  "Error",
                  "Sharing is not available on this device."
                );
              }
            },
          },
          { text: "OK" },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error generating reminders report:", error);
      if (error.code === 404) {
        Alert.alert(
          "Error",
          "Reminders collection not found. Please contact support."
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to generate reminders report. Please try again."
        );
      }
    }
  };

  const generateGoalsReport = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "User not found. Please try again.");
        return;
      }

      // Load logo from assets
      const logoAsset = Asset.fromModule(require("../../assets/TaskMateL.png"));
      await logoAsset.downloadAsync();
      const logoUri = logoAsset.localUri || logoAsset.uri;
      const logoBase64 = await FileSystem.readAsStringAsync(logoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;

      // Fetch goals from Appwrite
      const response = await databases.listDocuments(
        "67de6cb1003c63a59683", // Database ID
        "67e16137002384116add" // Collection ID
        // [Query.equal("user_id", user.$id)] // Uncomment if goals are filtered by user_id
      );

      const goals = response.documents;

      if (!goals || goals.length === 0) {
        Alert.alert("Goals Report", "No goals found for this user.");
        return;
      }

      // Generate HTML content for PDF
      let html = `
        <html>
          <head>
            <style>
              body {
                font-family: Helvetica, Arial, sans-serif;
                margin: 40px;
                color: #333;
                background-color: #f9f9f9;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header img {
                max-width: 150px;
                margin-bottom: 10px;
              }
              .header h1 {
                color: #1a73e8;
                font-size: 24px;
                margin: 0;
              }
              .header p {
                color: #555;
                font-size: 14px;
                margin: 5px 0;
              }
              .summary {
                margin: 20px 0;
                padding: 15px;
                background-color: #e8f0fe;
                border-radius: 6px;
              }
              .summary p {
                margin: 5px 0;
                font-size: 14px;
              }
              .summary strong {
                color: #1a73e8;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border: 1px solid #ddd;
              }
              th {
                background-color: #1a73e8;
                color: #fff;
                font-weight: bold;
              }
              tr:nth-child(even) {
                background-color: #f5f5f5;
              }
              tr:hover {
                background-color: #e8f0fe;
              }
              .label {
                font-weight: bold;
                color: #333;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logoDataUrl}" alt="Logo" />
                <h1>Goals Report</h1>
                <p><strong>User:</strong> ${user.name || "User"} (${
        user.email || "No email"
      })</p>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div class="summary">
                <p><strong>Total Goals:</strong> ${goals.length}</p>
                <p><strong>Completed:</strong> ${
                  goals.filter((g) => g.Completed).length
                }</p>
                <p><strong>Pending:</strong> ${
                  goals.filter((g) => !g.Completed).length
                }</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Note</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
      `;

      goals.forEach((goal, index) => {
        html += `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${goal.GoalName}</td>
                    <td>${
                      goal.GoalNote
                        ? goal.GoalNote.substring(0, 100) +
                          (goal.GoalNote.length > 100 ? "..." : "")
                        : "N/A"
                    }</td>
                    <td>${goal.Completed ? "Completed" : "Pending"}</td>
                    <td>${
                      goal.Start_Date
                        ? new Date(goal.Start_Date).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td>${
                      goal.End_Date
                        ? new Date(goal.End_Date).toLocaleDateString()
                        : "N/A"
                    }</td>
                  </tr>
        `;
      });

      html += `
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Define file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `GoalsReport_${timestamp}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Move the PDF to the document directory
      await FileSystem.moveAsync({
        from: uri,
        to: filePath,
      });

      // Notify user and offer to share/open
      Alert.alert(
        "Success",
        `Goals report saved as ${fileName}`,
        [
          {
            text: "Open/Share",
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
              } else {
                Alert.alert(
                  "Error",
                  "Sharing is not available on this device."
                );
              }
            },
          },
          { text: "OK" },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error generating goals report:", error);
      if (error.code === 404) {
        Alert.alert(
          "Error",
          "Goals collection not found. Please contact support."
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to generate goals report. Please try again."
        );
      }
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
        <View style={{ width: 28 }} />
      </View>
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

        <TouchableOpacity
          style={[
            styles.reportButton,
            theme === "dark" ? styles.darkButton : styles.lightButton,
          ]}
          onPress={generateTaskReport}
        >
          <Text
            style={[
              styles.reportButtonText,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            Generate Task Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reportButton,
            theme === "dark" ? styles.darkButton : styles.lightButton,
            styles.remindersButton,
          ]}
          onPress={generateRemindersReport}
        >
          <Text
            style={[
              styles.reportButtonText,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            Generate Reminders Report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reportButton,
            theme === "dark" ? styles.darkButton : styles.lightButton,
            styles.goalsButton,
          ]}
          onPress={generateGoalsReport}
        >
          <Text
            style={[
              styles.reportButtonText,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            Generate Goals Report
          </Text>
        </TouchableOpacity>
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
  uploadHint: {
    marginTop: 10,
    color: "#777",
    fontSize: 12,
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
  reportButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  remindersButton: {
    marginTop: 10, // Add spacing between buttons
  },
  goalsButton: {
    marginTop: 10, // Add spacing between buttons
  },
  darkButton: { backgroundColor: "#333" },
  lightButton: { backgroundColor: "#007AFF" },
  reportButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PersonalInformation;
