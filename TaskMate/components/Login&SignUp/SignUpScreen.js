import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { account } from "../../lib/appwriteConfig";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async () => {
    try {
      if (!email || !password || !name) {
        Alert.alert("Error", "All fields are required!");
        return;
      }

      const user = await account.create(
        "unique()", // Unique ID
        email,
        password,
        name
      );

      Alert.alert("Success", "Account created successfully!");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", error.message); // Show exact error message
      console.log("Signup Error:", error); // Log error for debugging
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Signup</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
};

export default SignupScreen;
