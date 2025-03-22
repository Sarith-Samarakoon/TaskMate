import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import TopBar from "../MenuBars/TopBar"; // Importing the new TopBar
import { useTheme } from "../ThemeContext"; // Import ThemeContext

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Sample events (replace with actual data)
  const events = [
    { id: "1", title: "📌 Meeting with Team", time: "10:00 AM" },
    { id: "2", title: "🏋️ Gym Session", time: "12:00 PM" },
    { id: "3", title: "📞 Client Call", time: "3:00 PM" },
    { id: "4", title: "🎂 Birthday Party", time: "7:00 PM" },
  ];

  // Handle date change
  const onDateChange = (event, selected) => {
    setShowPicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const { theme } = useTheme(); // Get theme from context

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TopBar title="Calendar" />

      {/* Header with Date Picker */}
      <View
        style={[
          styles.header,
          theme === "dark" ? styles.darkHeader : styles.lightHeader,
        ]}
      >
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Ionicons
            name="calendar-outline"
            size={30}
            color={theme === "dark" ? "#FFD700" : "#007AFF"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.dateText,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          {selectedDate.toDateString()}
        </Text>
      </View>

      {/* Show Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => console.log(date)}
        />
      )}

      {/* Event List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.eventItem,
              theme === "dark" ? styles.darkEventItem : styles.lightEventItem,
            ]}
          >
            <Text
              style={[
                styles.eventText,
                theme === "dark" ? styles.darkEventText : styles.lightEventText,
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.eventTime,
                theme === "dark" ? styles.darkEventTime : styles.lightEventTime,
              ]}
            >
              {item.time}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#F5F5F5",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
  },
  lightHeader: {
    backgroundColor: "#fff",
  },
  darkHeader: {
    backgroundColor: "#1E1E1E",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  lightText: {
    color: "#333",
  },
  darkText: {
    color: "#FFD700",
  },
  eventItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  lightEventItem: {
    backgroundColor: "#fff",
  },
  darkEventItem: {
    backgroundColor: "#333",
  },
  eventText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lightEventText: {
    color: "#333",
  },
  darkEventText: {
    color: "#FFD700",
  },
  eventTime: {
    fontSize: 14,
  },
  lightEventTime: {
    color: "#007AFF",
  },
  darkEventTime: {
    color: "#FFD700",
  },
});

export default CalendarScreen;
