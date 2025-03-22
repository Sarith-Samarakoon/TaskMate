import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "./components/Login&SignUp/AuthForm";
import TabNavigator from "./components/MenuBars/TabNavigation"; // Updated bottom navigation
import { getCurrentUser } from "./lib/appwriteConfig";
import { ThemeProvider, useTheme } from "./components/ThemeContext"; // Import ThemeProvider and useTheme

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // Correct usage of useTheme inside the ThemeProvider context

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      setInitialRoute(user ? "Home" : "Auth");
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#121212" : "#F5F5F5",
        }}
      >
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#FFD700" : "#007AFF"}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
