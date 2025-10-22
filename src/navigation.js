
// src/navigation.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NumberMemoryScreen from "./screens/NumberMemoryScreen";
import SequenceMemoryScreen from "./screens/SequenceMemoryScreen";
import ChimpTestScreen from "./screens/ChimpTestScreen";
import VerbalMemoryScreen from "./screens/VerbalMemoryScreen";
import CardMatchScreen from "./screens/CardMatchScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AboutScreen from "./screens/AboutScreen";

const Stack = createNativeStackNavigator();

export default function Navigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Brain Memory" }} />
      <Stack.Screen name="NumberMemory" component={NumberMemoryScreen} options={{ title: "Number Memory" }} />
      <Stack.Screen name="SequenceMemory" component={SequenceMemoryScreen} options={{ title: "Sequence Memory" }} />
      <Stack.Screen name="ChimpTest" component={ChimpTestScreen} options={{ title: "Chimp Test" }} />
      <Stack.Screen name="VerbalMemory" component={VerbalMemoryScreen} options={{ title: "Verbal Memory" }} />
      <Stack.Screen name="CardMatch" component={CardMatchScreen} options={{ title: "Card Match" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Настройки" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Профиль" }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: "О нас" }} />
    </Stack.Navigator>
  );
}
