import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import AuthScreen from "./components/Login&SignUp/AuthForm";
import DrawerWrapper from "./components/MenuBars/DrawerWrapper"; // ✅ Imported
import TabNavigator from "./components/MenuBars/TabNavigation";
import { getCurrentUser } from "./lib/appwriteConfig";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import OnboardingNavigator from "./components/OnboardingScreen/OnboardingNavigator";
import Notification from "./components/ReminderManagement/NotificationScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const hasCompletedOnboarding = await AsyncStorage.getItem(
        "onboardingCompleted"
      );
      if (!hasCompletedOnboarding) {
        setInitialRoute("Onboarding");
      } else {
        const user = await getCurrentUser();
        setInitialRoute(user ? "Home" : "Auth");
      }
      setLoading(false);
    };
    checkOnboardingStatus();
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
          name="Onboarding"
          component={OnboardingNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={DrawerWrapper}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
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
