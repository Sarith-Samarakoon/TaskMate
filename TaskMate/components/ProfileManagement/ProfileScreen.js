import React, { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  getCurrentUser,
  account,
  updateProfilePicture,
} from "../../lib/appwriteConfig";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import TopBar from "../MenuBars/TopBar";
import { ProgressBar } from "react-native-paper";

// Debug: Log to verify imports
console.log("Imported updateProfilePicture:", updateProfilePicture);

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Status"); // Manage active tab
  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const preloadImages = async () => {
      await Asset.loadAsync([
        require("../../assets/level1.png"),
        require("../../assets/level2.png"),
        require("../../assets/level3.png"),
      ]);
    };
    preloadImages();
  }, []);

  const handleProfilePictureChange = async () => {
    try {
      const newProfilePicUrl = await updateProfilePicture();
      if (newProfilePicUrl) {
        setUser((prevUser) => ({
          ...prevUser,
          prefs: {
            ...prevUser.prefs,
            profilePicture: newProfilePicUrl,
          },
        }));
      }
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
    }
  };

  // New handleLogout function
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      console.log("Logged out successfully");
      navigation.replace("Auth"); // or navigation.navigate('Login')
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Status":
        return (
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text
                style={[
                  styles.progressLabel,
                  theme === "dark" ? styles.darkText : styles.lightText,
                ]}
              >
                Completed Tasks
              </Text>
              <View style={styles.progressRow}>
                <ProgressBar
                  progress={5 / 8} // 5 out of 8
                  color="#FFD700"
                  style={styles.progressBar}
                />
                <Text
                  style={[
                    styles.progressValue,
                    theme === "dark" ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  5/8
                </Text>
              </View>
            </View>
            <View style={styles.progressItem}>
              <Text
                style={[
                  styles.progressLabel,
                  theme === "dark" ? styles.darkText : styles.lightText,
                ]}
              >
                Completed Goals
              </Text>
              <View style={styles.progressRow}>
                <ProgressBar
                  progress={3 / 8} // 3 out of 8
                  color="#FFD700"
                  style={styles.progressBar}
                />
                <Text
                  style={[
                    styles.progressValue,
                    theme === "dark" ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  3/8
                </Text>
              </View>
            </View>
          </View>
        );
      case "Achievement":
        return (
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text
                style={[
                  styles.progressLabel,
                  theme === "dark" ? styles.darkText : styles.lightText,
                ]}
              >
                Task Master
              </Text>
              <View style={styles.progressRow}>
                <Ionicons
                  name="trophy-outline"
                  size={24}
                  color="#FFD700"
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.progressValue,
                    theme === "dark" ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  Completed 10 tasks in a week
                </Text>
              </View>
            </View>
            <View style={styles.progressItem}>
              <Text
                style={[
                  styles.progressLabel,
                  theme === "dark" ? styles.darkText : styles.lightText,
                ]}
              >
                Goal Champion
              </Text>
              <View style={styles.progressRow}>
                <Ionicons
                  name="medal-outline"
                  size={24}
                  color="#FFD700"
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.progressValue,
                    theme === "dark" ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  Achieved 5 goals this month
                </Text>
              </View>
            </View>
            <View style={styles.progressItem}>
              <Text
                style={[
                  styles.progressLabel,
                  theme === "dark" ? styles.darkText : styles.lightText,
                ]}
              >
                Early Bird
              </Text>
              <View style={styles.progressRow}>
                <Ionicons
                  name="sunny-outline"
                  size={24}
                  color="#FFD700"
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.progressValue,
                    theme === "dark" ? styles.darkSubText : styles.lightSubText,
                  ]}
                >
                  Completed a task before 8 AM
                </Text>
              </View>
            </View>
          </View>
        );
      case "Rewards":
        return (
          <View style={styles.rewardsContainer}>
            {rewardsData.map((reward, index) => (
              <View
                key={index}
                style={[
                  styles.rewardCard,
                  theme === "dark" ? styles.darkCard : styles.lightCard,
                ]}
              >
                <Image source={reward.image} style={styles.rewardImage} />
                <View style={styles.rewardTextContainer}>
                  <Text
                    style={[
                      styles.rewardTitle,
                      theme === "dark" ? styles.darkText : styles.lightText,
                    ]}
                  >
                    {reward.title}
                  </Text>
                  <Text
                    style={[
                      styles.rewardDescription,
                      theme === "dark"
                        ? styles.darkSubText
                        : styles.lightSubText,
                    ]}
                  >
                    {reward.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
      contentContainerStyle={styles.scrollContainer}
    >
      <TopBar title="Profile" />

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
          Profile
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          {" "}
          {/* Attach logout here */}
          <Ionicons
            name="log-out-outline" // Use logout icon
            size={28}
            color={theme === "dark" ? "#FFF" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri:
              user?.profilePicture ||
              "https://i.pinimg.com/736x/0b/97/6f/0b976f0a7aa1aa43870e1812eee5a55d.jpg",

          }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.editIcon}
          onPress={handleProfilePictureChange}
        >
          <Ionicons name="pencil" size={18} color="#FFF" />
        </TouchableOpacity>
        <Text
          style={[
            styles.name,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          {user?.name || "Nuwan Vithanage"}
        </Text>
        <Text
          style={[
            styles.email,
            theme === "dark" ? styles.darkSubText : styles.lightSubText,
          ]}
        >
          {user?.email || "nuwan12@gmail.com"}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["Status", "Achievement", "Rewards"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.activeTab : null]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab
                  ? styles.activeTabText
                  : theme === "dark"
                  ? styles.darkText
                  : styles.lightText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Menu Options */}
      <View
        style={[
          styles.menu,
          theme === "dark" ? styles.darkCard : styles.lightCard,
        ]}
      >
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (option.label === "Personal Information") {
                navigation.navigate("PersonalInformation");
              } else if (option.label === "Help & Support") {
                navigation.navigate("HelpSupport");
              } else if (option.label === "Privacy & Security") {
                navigation.navigate("PrivacyPolicy");
              }
            }}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={theme === "dark" ? "#FFF" : "#333"}
            />
            <Text
              style={[
                styles.menuText,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              {option.label}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme === "dark" ? "#BBB" : "#666"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const menuOptions = [
  { icon: "person-outline", label: "Personal Information" },
  { icon: "mic-outline", label: "Voice Settings" },
  { icon: "lock-closed-outline", label: "Privacy & Security" },
  { icon: "help-circle-outline", label: "Help & Support" },
];

const rewardsData = [
  {
    title: "Productivity Pro",
    description: "50 points for completing 10 tasks",
    image: require("../../assets/level1.png"),
  },
  {
    title: "Goal Getter",
    description: "30 points for achieving 5 goals",
    image: require("../../assets/level2.png"),
  },
  {
    title: "Streak Keeper",
    description: "20 points for a 7-day streak",
    image: require("../../assets/level3.png"),
  },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#121212" },
  lightContainer: { backgroundColor: "#F9F9F9" },
  scrollContainer: { paddingBottom: 80 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  profileContainer: { alignItems: "center", marginVertical: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: "green", // Green border as in screenshot

  },
  editIcon: {
    position: "absolute",
    top: 0,
    right: 140,
    backgroundColor: "#007AFF",
    padding: 6,
    borderRadius: 15,
  },
  name: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  email: { fontSize: 14, marginBottom: 5 },
  statusBadge: {
    backgroundColor: "green",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF00FF",
  },
  tabText: { fontSize: 16, fontWeight: "bold" },
  activeTabText: { color: "#FF00FF", fontWeight: "bold" },

  progressContainer: {
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FFF",
    elevation: 2,
    marginBottom: 20,
  },
  progressItem: { marginBottom: 15 },
  progressLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  progressRow: { flexDirection: "row", alignItems: "center" },
  progressBar: { flex: 1, height: 10, borderRadius: 5, marginRight: 10, width:310 },
  progressValue: { fontSize: 14 },

  rewardsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardImage: {
    width: 80,
    height: 80,
    marginRight: 15,
    resizeMode: "contain",
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  rewardDescription: {
    fontSize: 14,
  },

  menu: {
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: { flex: 1, marginLeft: 10, fontSize: 16 },

  darkCard: { backgroundColor: "#1E1E1E", elevation: 2 },
  lightCard: { backgroundColor: "#FFF", elevation: 2 },

  darkText: { color: "#FFF" },
  lightText: { color: "#333" },
  darkSubText: { color: "#BBB" },
  lightSubText: { color: "#777" },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
