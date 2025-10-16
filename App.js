// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { colors } from "./src/theme/colors";
import { initSoundSettings } from "./src/lib/sound";

// Экраны
import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import NumberMemoryScreen from "./src/screens/NumberMemoryScreen";
import SequenceMemoryScreen from "./src/screens/SequenceMemoryScreen";
import ChimpTestScreen from "./src/screens/ChimpTestScreen";
import VerbalMemoryScreen from "./src/screens/VerbalMemoryScreen";
import CardMatchScreen from "./src/screens/CardMatchScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AboutScreen from "./src/screens/AboutScreen";


const Stack = createNativeStackNavigator();

export default function App() {
  React.useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
      } catch {
      }
      await initSoundSettings();
    })();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#111" },
            headerTintColor: "#fff",
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg ?? "#0b0f1a" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Главная" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Настройки" }}
          />
          <Stack.Screen
            name="NumberMemory"
            component={NumberMemoryScreen}
            options={{ title: "Память на числа" }}
          />
          <Stack.Screen
            name="SequenceMemory"
            component={SequenceMemoryScreen}
            options={{ title: "Последовательности" }}
          />
          <Stack.Screen
            name="ChimpTest"
            component={ChimpTestScreen}
            options={{ title: "Тест шимпанзе" }}
          />
          <Stack.Screen
            name="VerbalMemory"
            component={VerbalMemoryScreen}
            options={{ title: "Вербальная память" }}
          />
          <Stack.Screen
            name="CardMatch"
            component={CardMatchScreen}
            options={{ title: "Поиск пар" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Профиль" }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: "О приложении" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
