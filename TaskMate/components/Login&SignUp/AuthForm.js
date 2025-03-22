import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getCurrentUser,
  resetPassword,
} from "../../lib/appwriteConfig";
import * as WebBrowser from "expo-web-browser"; // Import WebBrowser for OAuth handling

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        navigation.replace("Home"); // Redirect if already logged in
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const session = await loginUser(email, password);
        if (session) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          navigation.replace("Home"); // Navigate to Home on success
        } else {
          Alert.alert("Login Failed", "Invalid email or password.");
        }
      } else {
        const newUser = await registerUser(email, password, name);
        if (newUser) {
          Alert.alert("Success", "Account created! Please log in.");
          setIsLogin(true);
        } else {
          Alert.alert("Registration Failed", "Check your details.");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Use correct redirect URL for your app
      const redirectUrl = "exp://127.0.0.1:19000"; // Replace with actual URL if in production
      const authUrl = await loginWithGoogle();

      // Open OAuth session
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl
      );

      if (result.type === "success") {
        // Extract the URL and parse token or user data if needed
        const { url } = result;

        if (url) {
          const token = url.split("access_token=")[1].split("&")[0]; // Example token extraction, adjust based on your URL structure
          if (token) {
            // Store or use the token
            Alert.alert("Google Login", "Successfully signed in with Google.");
            navigation.replace("Home"); // Navigate to Home on success
          } else {
            Alert.alert("Error", "Unable to extract token from the URL.");
          }
        }
      } else {
        Alert.alert("Google Login Failed", "Login was unsuccessful.");
      }
    } catch (error) {
      Alert.alert("Google Login Failed", error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Input Required", "Please enter your email.");
      return;
    }
    await resetPassword(email);
    Alert.alert("Reset Email Sent", "Check your inbox.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Register"}</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={isLogin ? "Login" : "Register"} onPress={handleSubmit} />

      <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton}>
        <Text style={styles.googleText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePasswordReset}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.linkText}>
          {isLogin ? "Create an account" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: 300,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  googleButton: {
    backgroundColor: "#DB4437",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: 250,
    alignItems: "center",
  },
  googleText: {
    color: "white",
    fontWeight: "bold",
  },
  linkText: {
    color: "blue",
    marginTop: 10,
    textAlign: "center",
  },
});

export default AuthScreen;
