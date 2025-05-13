import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext";
import { Client, Databases, Query } from "appwrite";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";

// Appwrite setup
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d2d4400029f32f7259");
const databases = new Databases(client);
const DATABASE_ID = "67de6cb1003c63a59683";
const REMINDER_COLLECTION_ID = "67e00a9c0006981492be";
const GOAL_COLLECTION_ID = "67e16137002384116add";

// Dummy data for reminders (updated for 12:05 AM, May 14, 2025)
const dummyResponse = {
  documents: [
    // Missed Reminder (past)
    {
      $id: "1",
      TaskTitle: "Missed Team Sync",
      Note: "Discuss project updates",
      SetTime: new Date("2025-05-13T14:30:00+05:30").toISOString(),
    },
    // Today Reminder (alarm in ~10 min, notification already passed)
    {
      $id: "2",
      TaskTitle: "Submit Report",
      Note: "Complete and send Q2 report",
      SetTime: new Date("2025-05-14T00:15:00+05:30").toISOString(), // 12:15 AM
    },
    // Today Reminder (alarm in ~15 min, notification already passed)
    {
      $id: "3",
      TaskTitle: "Review Code",
      Note: "Check pull requests",
      SetTime: new Date("2025-05-14T00:44:00+05:30").toISOString(), // 12:20 AM
    },
    // Tomorrow Reminder
    {
      $id: "4",
      TaskTitle: "Client Meeting",
      Note: "Prepare presentation slides",
      SetTime: new Date("2025-05-15T10:00:00+05:30").toISOString(), // 10:00 AM
    },
    // Upcoming Reminder
    {
      $id: "5",
      TaskTitle: "Team Outing",
      Note: "Plan logistics for team outing",
      SetTime: new Date("2025-05-20T12:00:00+05:30").toISOString(), // 12:00 PM
    },
  ],
};

// Dummy data for goals (for testing)
const dummyGoalsResponse = {
  documents: [
    // Missed Goal (past, not completed)
    {
      $id: "g1",
      GoalName: "Missed Project Plan",
      GoalNote: "Draft initial project roadmap",
      Completed: false,
      Start_Date: new Date("2025-05-10T09:00:00+05:30").toISOString(),
      End_Date: new Date("2025-05-13T23:59:00+05:30").toISOString(),
    },
    // Today Goal
    {
      $id: "g2",
      GoalName: "Finish Report",
      GoalNote: "Complete Q2 financial report",
      Completed: false,
      Start_Date: new Date("2025-05-14T09:00:00+05:30").toISOString(),
      End_Date: new Date("2025-05-14T23:59:00+05:30").toISOString(), // 11:59 PM
    },
    // Tomorrow Goal
    {
      $id: "g3",
      GoalName: "Prepare Slides",
      GoalNote: "Create presentation for client",
      Completed: false,
      Start_Date: new Date("2025-05-14T09:00:00+05:30").toISOString(),
      End_Date: new Date("2025-05-15T10:00:00+05:30").toISOString(), // 10:00 AM
    },
    // Upcoming Goal
    {
      $id: "g4",
      GoalName: "Plan Outing",
      GoalNote: "Organize team outing logistics",
      Completed: false,
      Start_Date: new Date("2025-05-15T09:00:00+05:30").toISOString(),
      End_Date: new Date("2025-05-20T12:00:00+05:30").toISOString(), // 12:00 PM
    },
    // Completed Goal (past)
    {
      $id: "g5",
      GoalName: "Code Review",
      GoalNote: "Review team pull requests",
      Completed: true,
      Start_Date: new Date("2025-05-10T09:00:00+05:30").toISOString(),
      End_Date: new Date("2025-05-13T23:59:00+05:30").toISOString(),
    },
  ],
};

// Notification setup
const configureNotifications = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permissions not granted");
      return;
    }

    if (Platform.OS === "ios") {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("reminder-channel", {
        name: "Reminder Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  } catch (error) {
    console.error("Error configuring notifications:", error);
  }
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [reminders, setReminders] = useState({
    today: [],
    tomorrow: [],
    upcoming: [],
    missed: [],
  });
  const [goals, setGoals] = useState({
    today: [],
    tomorrow: [],
    upcoming: [],
    missed: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const soundRef = useRef(null);

  // Load alarm sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/alarm-sound.mp3"),
          { shouldPlay: false }
        );
        soundRef.current = sound;
        console.log("Alarm sound loaded successfully");
      } catch (error) {
        console.error("Error loading alarm sound:", error);
        soundRef.current = null;
      }
    };
    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((error) => {
          console.error("Error unloading sound:", error);
        });
      }
    };
  }, []);

  // Check for reminder alarm triggers every second
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!soundRef.current) return;
      const now = new Date();
      const triggeredReminders = reminders.today
        .concat(reminders.tomorrow, reminders.upcoming)
        .filter((reminder) => {
          const reminderTime = new Date(reminder.rawTime);
          const timeDiff = Math.abs(now - reminderTime);
          return timeDiff <= 5000; // Within 5 seconds
        });
      if (triggeredReminders.length > 0) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.playAsync();
          console.log("Alarm triggered for:", triggeredReminders[0].title);
          setTimeout(async () => {
            await soundRef.current.stopAsync();
          }, 10000); // Stop after 10 seconds
        } catch (error) {
          console.error("Error playing alarm sound:", error);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [reminders]);

  const scheduleNotification = async (reminder) => {
    try {
      const reminderTime = new Date(reminder.rawTime);
      const notifyTime = new Date(reminderTime.getTime() - 30 * 60 * 1000);

      if (notifyTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Reminder: ${reminder.title}`,
            body: reminder.note || "Reminder is due soon!",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { reminderId: reminder.id },
          },
          trigger: {
            date: notifyTime,
            channelId:
              Platform.OS === "android" ? "reminder-channel" : undefined,
          },
        });
        console.log(
          `Notification scheduled for ${reminder.title} at ${notifyTime}`
        );
      }
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REMINDER_COLLECTION_ID,
        [Query.orderAsc("SetTime")]
      );

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

      const categorizedReminders = {
        today: [],
        tomorrow: [],
        upcoming: [],
        missed: [],
      };

      response.documents.forEach((doc) => {
        const reminderTime = new Date(doc.SetTime);
        const reminder = {
          id: doc.$id,
          title: doc.TaskTitle,
          note: doc.Note,
          date: reminderTime.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          time: reminderTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          color: "#3B82F6",
          rawTime: reminderTime,
          type: "reminder",
        };

        if (reminderTime < now) {
          categorizedReminders.missed.push(reminder);
        } else if (reminderTime >= todayStart && reminderTime < tomorrowStart) {
          categorizedReminders.today.push(reminder);
        } else if (
          reminderTime >= tomorrowStart &&
          reminderTime < tomorrowEnd
        ) {
          categorizedReminders.tomorrow.push(reminder);
        } else if (reminderTime >= tomorrowEnd) {
          categorizedReminders.upcoming.push(reminder);
        }

        if (reminderTime >= now) {
          scheduleNotification(reminder);
        }
      });

      setReminders(categorizedReminders);
    } catch (error) {
      console.error("Error fetching reminders from Appwrite:", error);
      console.log("Falling back to dummy reminder data");
      const response = dummyResponse;

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

      const categorizedReminders = {
        today: [],
        tomorrow: [],
        upcoming: [],
        missed: [],
      };

      response.documents.forEach((doc) => {
        const reminderTime = new Date(doc.SetTime);
        const reminder = {
          id: doc.$id,
          title: doc.TaskTitle,
          note: doc.Note,
          date: reminderTime.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          time: reminderTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          color: "#3B82F6",
          rawTime: reminderTime,
          type: "reminder",
        };

        if (reminderTime < now) {
          categorizedReminders.missed.push(reminder);
        } else if (reminderTime >= todayStart && reminderTime < tomorrowStart) {
          categorizedReminders.today.push(reminder);
        } else if (
          reminderTime >= tomorrowStart &&
          reminderTime < tomorrowEnd
        ) {
          categorizedReminders.tomorrow.push(reminder);
        } else if (reminderTime >= tomorrowEnd) {
          categorizedReminders.upcoming.push(reminder);
        }

        if (reminderTime >= now) {
          scheduleNotification(reminder);
        }
      });

      setReminders(categorizedReminders);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        GOAL_COLLECTION_ID,
        [Query.orderAsc("End_Date")]
      );

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

      const categorizedGoals = {
        today: [],
        tomorrow: [],
        upcoming: [],
        missed: [],
      };

      response.documents.forEach((doc) => {
        const endDate = new Date(doc.End_Date);
        const goal = {
          id: doc.$id,
          title: doc.GoalName,
          note: doc.GoalNote,
          completed: doc.Completed,
          date: endDate.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          time: endDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          color: "#10B981", // Green for goals to differentiate
          rawTime: endDate,
          type: "goal",
        };

        if (endDate < now && !doc.Completed) {
          categorizedGoals.missed.push(goal);
        } else if (endDate >= todayStart && endDate < tomorrowStart) {
          categorizedGoals.today.push(goal);
        } else if (endDate >= tomorrowStart && endDate < tomorrowEnd) {
          categorizedGoals.tomorrow.push(goal);
        } else if (endDate >= tomorrowEnd) {
          categorizedGoals.upcoming.push(goal);
        }
      });

      setGoals(categorizedGoals);
    } catch (error) {
      console.error("Error fetching goals from Appwrite:", error);
      console.log("Falling back to dummy goal data");
      const response = dummyGoalsResponse;

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

      const categorizedGoals = {
        today: [],
        tomorrow: [],
        upcoming: [],
        missed: [],
      };

      response.documents.forEach((doc) => {
        const endDate = new Date(doc.End_Date);
        const goal = {
          id: doc.$id,
          title: doc.GoalName,
          note: doc.GoalNote,
          completed: doc.Completed,
          date: endDate.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          time: endDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          color: "#10B981",
          rawTime: endDate,
          type: "goal",
        };

        if (endDate < now && !doc.Completed) {
          categorizedGoals.missed.push(goal);
        } else if (endDate >= todayStart && endDate < tomorrowStart) {
          categorizedGoals.today.push(goal);
        } else if (endDate >= tomorrowStart && endDate < tomorrowEnd) {
          categorizedGoals.tomorrow.push(goal);
        } else if (endDate >= tomorrowEnd) {
          categorizedGoals.upcoming.push(goal);
        }
      });

      setGoals(categorizedGoals);
    }
  };

  useFocusEffect(
    useCallback(() => {
      configureNotifications();
      fetchReminders();
      fetchGoals();
      setLoading(false);
    }, [])
  );

  const renderSection = (title, items) => (
    <>
      <Text
        style={[
          styles.sectionHeader,
          theme === "dark" ? styles.darkText : styles.lightText,
        ]}
      >
        {title}
      </Text>
      {loading ? (
        <Text
          style={[
            styles.loadingText,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          Loading...
        </Text>
      ) : items.length === 0 ? (
        <Text
          style={[
            styles.noDataText,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          No {title.toLowerCase()}
        </Text>
      ) : (
        items.map((item) => (
          <NotificationCard
            key={item.id}
            title={item.title}
            time={item.time}
            date={item.date}
            description={item.note}
            completed={item.completed}
            button1={item.type === "reminder" ? "View Reminder" : "View Goal"}
            button2="Dismiss"
            color={item.color}
            theme={theme}
            isGoal={item.type === "goal"}
          />
        ))
      )}
    </>
  );

  const getTabItems = (category) => {
    if (activeTab === "All") {
      return [...reminders[category], ...goals[category]];
    } else if (activeTab === "Reminders") {
      return reminders[category];
    } else {
      return goals[category];
    }
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="Notification" />

      <View
        style={[
          styles.header,
          theme === "dark" ? styles.darkHeader : styles.lightHeader,
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === "dark" ? "#FFF" : "#000"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={activeTab === "All" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("All")}
        >
          <Text
            style={
              activeTab === "All"
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            activeTab === "Reminders" ? styles.activeTab : styles.inactiveTab
          }
          onPress={() => setActiveTab("Reminders")}
        >
          <Text
            style={
              activeTab === "Reminders"
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            Reminders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === "Goals" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("Goals")}
        >
          <Text
            style={
              activeTab === "Goals"
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            Goals
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {renderSection("TODAY", getTabItems("today"))}
        {renderSection("TOMORROW", getTabItems("tomorrow"))}
        {renderSection("UPCOMING", getTabItems("upcoming"))}
        {renderSection("MISSED", getTabItems("missed"))}
      </ScrollView>


    </View>
  );
};

const NotificationCard = ({
  title,
  time,
  date,
  description,
  completed,
  button1,
  button2,
  color,
  theme,
  isGoal,
}) => (
  <View
    style={[styles.card, theme === "dark" ? styles.darkCard : styles.lightCard]}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardTitle,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardTime,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          {date} • {time}
        </Text>
        {isGoal && (
          <Text
            style={[
              styles.cardStatus,
              theme === "dark" ? styles.darkSubText : styles.lightSubText,
              completed ? styles.completed : styles.notCompleted,
            ]}
          >
            {completed ? "Completed" : "Not Completed"}
          </Text>
        )}
      </View>
    </View>
    {description && (
      <Text
        style={[
          styles.cardDescription,
          theme === "dark" ? styles.darkSubText : styles.lightSubText,
        ]}
      >
        {description}
      </Text>
    )}
    <View style={styles.buttonContainer}>
      {button1 && (
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.buttonText}>{button1}</Text>
        </TouchableOpacity>
      )}
      {button2 && (
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.buttonTextSecondary}>{button2}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);


const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#121212" },
  lightContainer: { backgroundColor: "#F5F7FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  darkHeader: { backgroundColor: "#1E1E1E" },
  lightHeader: { backgroundColor: "#FFF" },

  darkText: { color: "#FFF" },
  lightText: { color: "#000" },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
  },
  activeTab: {
    backgroundColor: "#3D5AFE",
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTabText: { color: "white", fontWeight: "bold" },
  inactiveTab: {
    backgroundColor: "#E0E0E0",
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  inactiveTabText: { color: "#616161" },

  sectionHeader: {
    padding: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
  },

  card: {
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  darkCard: { backgroundColor: "#1E1E1E" },
  lightCard: { backgroundColor: "#FFF" },

  indicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardTime: { fontSize: 12, color: "#757575", marginTop: 4 },
  cardStatus: { fontSize: 12, marginTop: 4 },
  completed: { color: "#10B981" },
  notCompleted: { color: "#EF4444" },
  cardDescription: { fontSize: 14, color: "#616161", marginVertical: 5 },

  buttonContainer: { flexDirection: "row", marginTop: 10 },
  primaryButton: {
    backgroundColor: "#3D5AFE",
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  secondaryButton: { backgroundColor: "#E0E0E0", padding: 8, borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
  buttonTextSecondary: { color: "#616161", fontWeight: "bold" },

  quickSettingsContainer: {
    backgroundColor: "white",
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  quickSetting: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  quickSettingText: { fontSize: 14, fontWeight: "bold", color: "#424242" },

  loadingText: {
    textAlign: "center",
    padding: 15,
    fontSize: 14,
  },
  noDataText: {
    textAlign: "center",
    padding: 15,
    fontSize: 14,
  },
  darkSubText: { color: "#AAAAAA" },
  lightSubText: { color: "#616161" },
});

export default NotificationScreen;
