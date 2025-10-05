// src/screens/AboutScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.h2}>О нас</Text>
      <Text style={styles.p}>
        Учебный проект по мобильной разработке (React Native, Expo).
      </Text>
      <Text style={styles.pBold}>Команда: sxd0 · rikyache · feedbackW · sldkmay</Text>
      <Text style={styles.pSmall}>
        Дальше: мультимедиа (звук/вибро/анимации), расширенные словари и экспорт прогресса.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 18, gap: 12, alignItems:"center", justifyContent:"center", backgroundColor: colors.bg },
  h2: { fontSize: 22, fontWeight: "800", color: colors.text },
  p: { fontSize: 16, textAlign:"center", color: colors.text },
  pBold: { fontSize: 16, fontWeight: "800", textAlign:"center", color: colors.primary },
  pSmall: { fontSize: 13, textAlign:"center", color:"#C5C5CF" },
});
