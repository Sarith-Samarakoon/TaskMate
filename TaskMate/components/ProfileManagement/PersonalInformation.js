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
import { LinearGradient } from "expo-linear-gradient";
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
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="Personal Information" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={theme === "dark" ? "#FFFFFF" : "#2D3748"}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              theme === "dark" ? styles.darkText : styles.lightText,
            ]}
          >
            My Profile
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={
            theme === "dark" ? ["#16161A", "#242629"] : ["#FFFFFF", "#F8F9FA"]
          }
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userName,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              {user?.name || "User"}
            </Text>
            <Text
              style={[
                styles.userEmail,
                theme === "dark" ? styles.darkSubText : styles.lightSubText,
              ]}
            >
              {user?.email || "user@example.com"}
            </Text>
          </View>
        </LinearGradient>

        {/* Personal Information Section */}
        <View
          style={[
            styles.section,
            theme === "dark" ? styles.darkSection : styles.lightSection,
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={theme === "dark" ? "#7F5AF0" : "#6C63FF"}
            />
            <Text
              style={[
                styles.sectionTitle,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              Personal Information
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="person-outline"
                size={18}
                color={theme === "dark" ? "#94A1B2" : "#718096"}
              />
              <Text
                style={[
                  styles.infoLabel,
                  theme === "dark" ? styles.darkSubText : styles.lightSubText,
                ]}
              >
                Full Name
              </Text>
            </View>
            <Text
              style={[
                styles.infoValue,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              {user?.name || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={theme === "dark" ? "#94A1B2" : "#718096"}
              />
              <Text
                style={[
                  styles.infoLabel,
                  theme === "dark" ? styles.darkSubText : styles.lightSubText,
                ]}
              >
                Email Address
              </Text>
            </View>
            <Text
              style={[
                styles.infoValue,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              {user?.email || "Not provided"}
            </Text>
          </View>
        </View>

        {/* Reports Section */}
        <View
          style={[
            styles.section,
            theme === "dark" ? styles.darkSection : styles.lightSection,
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={theme === "dark" ? "#7F5AF0" : "#6C63FF"}
            />
            <Text
              style={[
                styles.sectionTitle,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              Generate Reports
            </Text>
          </View>

          <Text
            style={[
              styles.sectionDescription,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
            ]}
          >
            Export your data for record keeping or analysis
          </Text>

          <TouchableOpacity
            style={[
              styles.reportButton,
              { backgroundColor: theme === "dark" ? "#7F5AF0" : "#6C63FF" },
            ]}
            onPress={generateTaskReport}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.reportButtonText}>Task Report</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reportButton,
              { backgroundColor: theme === "dark" ? "#2CB67D" : "#38B2AC" },
            ]}
            onPress={generateRemindersReport}
          >
            <Ionicons name="alarm-outline" size={24} color="#FFFFFF" />
            <Text style={styles.reportButtonText}>Reminders Report</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reportButton,
              { backgroundColor: theme === "dark" ? "#EF4565" : "#F56565" },
            ]}
            onPress={generateGoalsReport}
          >
            <Ionicons name="flag-outline" size={24} color="#FFFFFF" />
            <Text style={styles.reportButtonText}>Goals Report</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text
          style={[
            styles.versionText,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          TaskMate v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#16161A",
  },
  lightContainer: {
    backgroundColor: "#F8F9FA",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  darkLoaderContainer: {
    backgroundColor: "#16161A",
  },
  lightLoaderContainer: {
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  darkText: {
    color: "#FFFFFE",
  },
  lightText: {
    color: "#2D3748",
  },
  darkSubText: {
    color: "#94A1B2",
  },
  lightSubText: {
    color: "#718096",
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#6C63FF",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  darkSection: {
    backgroundColor: "#242629",
  },
  lightSection: {
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    paddingLeft: 26,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});

export default PersonalInformation;
