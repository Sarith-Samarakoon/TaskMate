import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatePicker from 'react-native-date-picker';

const SetReminderScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date(2025, 1, 19)); // Default: Feb 19, 2025
  const [time, setTime] = useState(new Date(2025, 1, 19, 9, 0)); // Default: 09:00 AM
  const [isPM, setIsPM] = useState(false);
  const [note, setNote] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA", padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>Reminders</Text>
        <TouchableOpacity style={{ marginLeft: "auto" }}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Reminder Card */}
      <TouchableOpacity
        style={{
          backgroundColor: "white",
          padding: 15,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => setModalVisible(true)}
      >
        <View style={{ width: 10, height: 10, backgroundColor: "#3D5AFE", borderRadius: 5, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold" }}>Client Call</Text>
          <Text style={{ color: "#9E9E9E" }}>Set your reminder</Text>
        </View>
        <Ionicons name="pencil-outline" size={20} color="black" style={{ marginRight: 10 }} />
        <Ionicons name="notifications-outline" size={20} color="black" />
      </TouchableOpacity>

      {/* Modal for Setting Reminder */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            {/* Title */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>🔔 Set Reminder</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Reminder Details */}
            <Text style={{ fontWeight: "bold" }}>Title - Client Call</Text>
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Date - FEB 19, 2025</Text>

            {/* Note Input */}
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Note</Text>
            <TextInput
              style={{
                backgroundColor: "#F5F7FA",
                padding: 10,
                borderRadius: 5,
                marginTop: 5,
              }}
              placeholder="Add a note..."
              value={note}
              onChangeText={setNote}
            />

            {/* Time Picker */}
            <Text style={{ fontWeight: "bold", marginTop: 15 }}>Set Time</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
              {/* Digital Time Input */}
              <TextInput
                style={{
                  backgroundColor: "#E3F2FD",
                  width: 50,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginRight: 5,
                  padding: 5,
                  borderRadius: 5,
                }}
                keyboardType="numeric"
                value={time.getHours().toString().padStart(2, "0")}
                onChangeText={(val) => {
                  const newTime = new Date(time);
                  newTime.setHours(parseInt(val) || 0);
                  setTime(newTime);
                }}
              />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>:</Text>
              <TextInput
                style={{
                  backgroundColor: "#E3F2FD",
                  width: 50,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginLeft: 5,
                  padding: 5,
                  borderRadius: 5,
                }}
                keyboardType="numeric"
                value={time.getMinutes().toString().padStart(2, "0")}
                onChangeText={(val) => {
                  const newTime = new Date(time);
                  newTime.setMinutes(parseInt(val) || 0);
                  setTime(newTime);
                }}
              />

              {/* AM / PM Toggle */}
              <TouchableOpacity
                style={{
                  backgroundColor: isPM ? "#E0E0E0" : "#FFEB3B",
                  padding: 8,
                  borderRadius: 5,
                  marginLeft: 10,
                }}
                onPress={() => setIsPM(false)}
              >
                <Text style={{ fontWeight: "bold", color: isPM ? "black" : "blue" }}>AM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: isPM ? "#FFEB3B" : "#E0E0E0",
                  padding: 8,
                  borderRadius: 5,
                  marginLeft: 5,
                }}
                onPress={() => setIsPM(true)}
              >
                <Text style={{ fontWeight: "bold", color: isPM ? "blue" : "black" }}>PM</Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker Clock */}
            <DatePicker
  modal
  open={modalVisible}
  date={time}
  mode="time"
  onConfirm={(selectedTime) => {
    setTime(selectedTime);
    setModalVisible(false);
  }}
  onCancel={() => setModalVisible(false)}
/>



            {/* Set Reminder Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#3D5AFE",
                padding: 15,
                borderRadius: 5,
                marginTop: 15,
                alignItems: "center",
              }}
              onPress={() => {
                setModalVisible(false);
                alert("Reminder Set for " + time.toLocaleTimeString());
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SetReminderScreen;


