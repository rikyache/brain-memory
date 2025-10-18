// src/screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import PressableScale from "../components/PressableScale";
import { colors } from "../theme/colors";

const Btn = ({ title, onPress, variant = "primary" }) => {
  const isOutline = variant === "outline";
  return (
    <PressableScale onPress={onPress} style={[styles.btn, isOutline && styles.btnOutline]}>
      <Text style={[styles.btnText, isOutline && styles.btnOutlineText]}>{title}</Text>
    </PressableScale>
  );
};

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Brain Memory</Text>
      <Text style={styles.p}>Тренируй память и внимание</Text>

      <Btn title="Number Memory" onPress={() => navigation.navigate("NumberMemory")} />
      <Btn title="Sequence Memory" onPress={() => navigation.navigate("SequenceMemory")} />
      <Btn title="Chimp Test" onPress={() => navigation.navigate("ChimpTest")} />
      <Btn title="Verbal Memory" onPress={() => navigation.navigate("VerbalMemory")} />
      <Btn title="Card Match (эмодзи)" onPress={() => navigation.navigate("CardMatch")} />

      <Btn title="Профиль" onPress={() => navigation.navigate("Profile")} />
      <Btn title="Настройки" variant="outline" onPress={() => navigation.navigate("Settings")} />
      <Btn title="О нас" variant="outline" onPress={() => navigation.navigate("About")} />

      <Text style={styles.note}>Совет: регулярно играйте короткими сессиями</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, backgroundColor: colors.bg },
  h1: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 10, color: colors.text },
  p: { fontSize: 14, lineHeight: 20, textAlign: "center", color: colors.subtext, marginBottom: 6 },
  note: { marginTop: 6, fontSize: 12, color: colors.subtext, textAlign: "center" },
  btn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
  },
  btnText: { color: colors.primaryText, fontWeight: "800", textAlign: "center" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.primary },
  btnOutlineText: { color: colors.primary },
});
