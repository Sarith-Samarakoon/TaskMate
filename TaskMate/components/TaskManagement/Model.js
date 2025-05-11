import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Picker,
  Alert,
} from "react-native";

export default function Model() {
  const [priority, setPriority] = useState("High");
  const [category, setCategory] = useState("Work");
  const [title, setTitle] = useState("Coding");
  const [skipCount, setSkipCount] = useState("5");
  const [deadline, setDeadline] = useState("2025-07-15T06:29:57.626143");
  const [result, setResult] = useState("");

  const handlePredict = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority,
          category,
          title,
          skipCount: parseInt(skipCount),
          deadline,
        }),
      });

      const json = await response.json();
      if (json.predicted_time) {
        setResult(`Suggested time: ${json.predicted_time}`);
      } else {
        setResult("Prediction failed.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Time Predictor</Text>

      <Text>Title:</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text>Priority:</Text>
      <Picker selectedValue={priority} onValueChange={setPriority}>
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>

      <Text>Category:</Text>
      <Picker selectedValue={category} onValueChange={setCategory}>
        <Picker.Item label="Work" value="Work" />
        <Picker.Item label="Health" value="Health" />
        <Picker.Item label="Chores" value="Chores" />
        <Picker.Item label="Fitness" value="Fitness" />
      </Picker>

      <Text>Skip Count:</Text>
      <TextInput
        style={styles.input}
        value={skipCount}
        keyboardType="numeric"
        onChangeText={setSkipCount}
      />

      <Text>Deadline:</Text>
      <TextInput
        style={styles.input}
        value={deadline}
        onChangeText={setDeadline}
      />

      <Button title="Predict Time" onPress={handlePredict} />
      <Text style={styles.result}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  result: { marginTop: 20, fontSize: 18, color: "green" },
});
