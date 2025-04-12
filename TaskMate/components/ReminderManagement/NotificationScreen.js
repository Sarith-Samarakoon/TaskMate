import React from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../MenuBars/TopBar";
import { useTheme } from "../ThemeContext"; // Import useTheme for theme management

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Use theme from context

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="Notification" />

      {/* Header */}
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
        <Text
          style={[
            styles.headerTitle,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          Notifications
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Alerts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Notifications */}
        <Text
          style={[
            styles.sectionHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          TODAY
        </Text>
        <NotificationCard
          title="Flownuet Project Meeting"
          time="2m ago"
          description="Complete UI design review before 3 PM today"
          button1="View Task"
          button2="Snooze"
          color="#4CAF50"
          theme={theme}
        />
        <NotificationCard
          title="Team Meeting Reminder"
          time="15m ago"
          description="Complete UI design review before 3 PM today"
          button1="Join Meeting"
          button2="Dismiss"
          color="#FF9800"
          theme={theme}
        />

        <Text
          style={[
            styles.sectionHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          EARLIER
        </Text>
        <NotificationCard
          title="Task Completed"
          time="1h ago"
          description="Weekly task has been submitted successfully"
          color="#9C27B0"
          theme={theme}
        />
      </ScrollView>

      {/* Quick Settings */}
      <View
        style={[
          styles.quickSettingsContainer,
          theme === "dark" ? styles.darkCard : styles.lightCard,
        ]}
      >
        <Text
          style={[
            styles.sectionHeader,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          QUICK SETTINGS
        </Text>
        <QuickSetting title="Do Not Disturb" theme={theme} />
        <QuickSetting title="Sound" isEnabled={true} theme={theme} />
        <QuickSetting title="Vibration" isEnabled={true} theme={theme} />
      </View>
    </View>
  );
};

const NotificationCard = ({
  title,
  time,
  description,
  button1,
  button2,
  color,
  theme,
}) => (
  <View
    style={[styles.card, theme === "dark" ? styles.darkCard : styles.lightCard]}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
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
        {time}
      </Text>
    </View>
    <Text
      style={[
        styles.cardDescription,
        theme === "dark" ? styles.darkSubText : styles.lightSubText,
      ]}
    >
      {description}
    </Text>
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

const QuickSetting = ({ title, isEnabled = false, theme }) => {
  const [enabled, setEnabled] = React.useState(isEnabled);
  return (
    <View style={styles.quickSetting}>
      <Text
        style={[
          styles.quickSettingText,
          theme === "dark" ? styles.darkText : styles.lightText,
        ]}
      >
        {title}
      </Text>
      <Switch value={enabled} onValueChange={() => setEnabled(!enabled)} />
    </View>
  );
};

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

  headerTitle: { fontSize: 18, fontWeight: "bold" },
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
  cardTitle: { fontSize: 16, fontWeight: "bold", flex: 1 },
  cardTime: { fontSize: 12, color: "#757575" },
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
});

export default NotificationScreen;
