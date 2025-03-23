import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import TopBar from "../MenuBars/TopBar"; // Importing TopBar

const NotificationScreen = () => {
  const navigation = useNavigation(); // Initialize navigation

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <TopBar title="Notification" />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}> {/* Back button functionality */}
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>Notifications</Text>
        <Ionicons name="notifications-outline" size={24} color="black" style={{ marginLeft: 'auto' }} />
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
        <TouchableOpacity style={styles.activeTab}><Text style={styles.activeTabText}>All</Text></TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}><Text style={styles.inactiveTabText}>Tasks</Text></TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}><Text style={styles.inactiveTabText}>Reminders</Text></TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}><Text style={styles.inactiveTabText}>Alerts</Text></TouchableOpacity>
      </View>

      <ScrollView>
        {/* Notifications */}
        <Text style={styles.sectionHeader}>TODAY</Text>
        <NotificationCard title="Flownuet Project Meeting" time="2m ago" description="Complete UI design review before 3 PM today" button1="View Task" button2="Snooze" color="#4CAF50" />
        <NotificationCard title="Team Meeting Reminder" time="15m ago" description="Complete UI design review before 3 PM today" button1="Join Meeting" button2="Dismiss" color="#FF9800" />

        <Text style={styles.sectionHeader}>EARLIER</Text>
        <NotificationCard title="Task Completed" time="1h ago" description="Weekly task has been submitted successfully" color="#9C27B0" />
      </ScrollView>

      {/* Quick Settings */}
      <View style={styles.quickSettingsContainer}>
        <Text style={styles.sectionHeader}>QUICK SETTINGS</Text>
        <QuickSetting title="Do Not Disturb" />
        <QuickSetting title="Sound" isEnabled={true} />
        <QuickSetting title="Vibration" isEnabled={true} />
      </View>
    </View>
  );
};

const NotificationCard = ({ title, time, description, button1, button2, color }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardTime}>{time}</Text>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
    <View style={styles.buttonContainer}>
      {button1 && <TouchableOpacity style={styles.primaryButton}><Text style={styles.buttonText}>{button1}</Text></TouchableOpacity>}
      {button2 && <TouchableOpacity style={styles.secondaryButton}><Text style={styles.buttonTextSecondary}>{button2}</Text></TouchableOpacity>}
    </View>
  </View>
);

const QuickSetting = ({ title, isEnabled = false }) => {
  const [enabled, setEnabled] = React.useState(isEnabled);
  return (
    <View style={styles.quickSetting}>
      <Text style={styles.quickSettingText}>{title}</Text>
      <Switch value={enabled} onValueChange={() => setEnabled(!enabled)} />
    </View>
  );
};

const styles = {
  activeTab: { backgroundColor: '#3D5AFE', padding: 8, borderRadius: 20, marginHorizontal: 5 },
  activeTabText: { color: 'white', fontWeight: 'bold' },
  inactiveTab: { backgroundColor: '#E0E0E0', padding: 8, borderRadius: 20, marginHorizontal: 5 },
  inactiveTabText: { color: '#616161' },
  sectionHeader: { padding: 15, fontSize: 16, fontWeight: 'bold', color: '#757575' },
  card: { backgroundColor: 'white', padding: 15, marginHorizontal: 15, borderRadius: 10, marginBottom: 10 },
  indicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  cardTime: { fontSize: 12, color: '#757575' },
  cardDescription: { fontSize: 14, color: '#616161', marginVertical: 5 },
  buttonContainer: { flexDirection: 'row', marginTop: 10 },
  primaryButton: { backgroundColor: '#3D5AFE', padding: 8, borderRadius: 5, marginRight: 5 },
  secondaryButton: { backgroundColor: '#E0E0E0', padding: 8, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  buttonTextSecondary: { color: '#616161', fontWeight: 'bold' },
  quickSettingsContainer: { backgroundColor: 'white', padding: 15, margin: 15, borderRadius: 10 },
  quickSetting: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  quickSettingText: { fontSize: 14, fontWeight: 'bold', color: '#424242' },
};

export default NotificationScreen;
