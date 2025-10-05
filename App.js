// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme/colors";

// Экраны
import HomeScreen from "./src/screens/HomeScreen.js";
import SettingsScreen from "./src/screens/SettingsScreen.js";
import NumberMemoryScreen from "./src/screens/NumberMemoryScreen.js";
import SequenceMemoryScreen from "./src/screens/SequenceMemoryScreen.js";
import ChimpTestScreen from "./src/screens/ChimpTestScreen.js";
import VerbalMemoryScreen from "./src/screens/VerbalMemoryScreen.js";
import CardMatchScreen from "./src/screens/CardMatchScreen.js";
import ProfileScreen from "./src/screens/ProfileScreen.js";
import AboutScreen from "./src/screens/AboutScreen.js";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Brain & Memory" }} />
          <Stack.Screen name="NumberMemory" component={NumberMemoryScreen} options={{ title: "Number Memory" }} />
          <Stack.Screen name="SequenceMemory" component={SequenceMemoryScreen} options={{ title: "Sequence Memory" }} />
          <Stack.Screen name="ChimpTest" component={ChimpTestScreen} options={{ title: "Chimp Test" }} />
          <Stack.Screen name="VerbalMemory" component={VerbalMemoryScreen} options={{ title: "Verbal Memory" }} />
          <Stack.Screen name="CardMatch" component={CardMatchScreen} options={{ title: "Card Match" }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Настройки" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Профиль" }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: "О нас" }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </>
  );
}
