// src/screens/HomeScreen.js
import React, { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { colors } from "../theme/colors";

// Универсальная “карточка-кнопка”
const CardBtn = ({ title, desc, icon = "🧠", onPress }) => (
  <Pressable
    onPress={onPress}
    android_ripple={{ color: "rgba(255,255,255,0.08)" }}
    style={({ pressed }) => [styles.cardOuter, pressed && styles.cardOuterPressed]}
  >
    <View style={styles.cardInner}>
      <View style={styles.cardRow}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{icon}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          {desc ? (
            <Text style={styles.cardDesc} numberOfLines={2}>
              {desc}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  </Pressable>
);

export default function HomeScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation?.setOptions?.({ headerShown: false, title: "" });
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {}
      <Text style={styles.h1}>Brain Memory</Text>
      <Text style={styles.p}>Тренируй память и внимание короткими сессиями</Text>

      {}
      <Text style={styles.sectionTitle}>Тренировки</Text>
      <View style={styles.grid}>
        <CardBtn
          icon="🔢"
          title="Number Memory"
          desc="Запоминай числа"
          onPress={() => navigation.navigate("NumberMemory")}
        />
        <CardBtn
          icon="🔁"
          title="Sequence Memory"
          desc="Повторяй последовательности"
          onPress={() => navigation.navigate("SequenceMemory")}
        />
        <CardBtn
          icon="🐒"
          title="Chimp Test"
          desc="Найди числа по порядку"
          onPress={() => navigation.navigate("ChimpTest")}
        />
        <CardBtn
          icon="💬"
          title="Verbal Memory"
          desc="Новые/известные слова"
          onPress={() => navigation.navigate("VerbalMemory")}
        />
        <CardBtn
          icon="🧩"
          title="Card Match (эмодзи)"
          desc="Находи пары"
          onPress={() => navigation.navigate("CardMatch")}
        />
      </View>

      {/* Сервисные экраны */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Профиль и настройки</Text>
      <View style={styles.grid}>
        <CardBtn icon="👤" title="Профиль" desc="Графики и достижения" onPress={() => navigation.navigate("Profile")} />
        <CardBtn icon="⚙️" title="Настройки" desc="Тема, звук, сложность" onPress={() => navigation.navigate("Settings")} />
        <CardBtn icon="ℹ️" title="О нас" desc="Методология проекта" onPress={() => navigation.navigate("About")} />
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipText}>💡 Совет: играй короткими сессиями — так прогресс стабильнее.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ФОН + отступы
  container: {
    padding: 20,
    backgroundColor: colors.bg,
  },

  // Заголовки (6)
  h1: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginTop: 8,
  },
  p: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: colors.subtext,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },

  // Сетка карточек (ровные 2 колонки)
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  /*** (1) Глубина/контраст: двухслойная карточка
   * cardOuter — мягкая тень + свечение при pressed
   * cardInner — стеклянный фон + тонкая рамка
   ***/
  cardOuter: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 20,
    // Тень/поднятие
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    // Незначительный внешний контур для лучшего разделения с фоном
    borderWidth: Platform.OS === "ios" ? 0 : 0.5,
    borderColor: "rgba(255,255,255,0.04)",
  },
  cardOuterPressed: {
    transform: [{ scale: 0.98 }],
    // Лёгкое свечение в нажатом состоянии
    shadowOpacity: 0.5,
  },
  cardInner: {
    height: 130,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    // «Глянцевая» рамка: чуть светлее сверху, темнее снизу
    borderColor: "rgba(255,255,255,0.10)",
  },

  // Контент карточки (4)
  cardRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center", // иконка по центру по высоте
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginRight: 12,
  },
  cardIconText: { fontSize: 22 },
  cardBody: {
    flex: 1,
    justifyContent: "center", // выравнивание текста по центру вертикально
    minWidth: 0,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  cardDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },

  // Подсказка внизу
  tip: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tipText: { color: "rgba(255,255,255,0.7)", textAlign: "center", fontSize: 12 },
});
