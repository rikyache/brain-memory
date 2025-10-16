import React from "react";
import { View, Text, Switch, StyleSheet, SafeAreaView } from "react-native";
import { colors } from "../theme/colors";
import { loadJSON } from "../lib/storage";
import {
  getState,
  setSoundEnabled,
  setHapticsEnabled,
} from "../lib/sound";

const K_SOUND = "@settings:soundEnabled";
const K_HAPTICS = "@settings:hapticsEnabled";

export default function SettingsScreen() {
  const [sound, setSound] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const savedSound = await loadJSON(K_SOUND, null);
      const savedHaptics = await loadJSON(K_HAPTICS, null);
      const fallback = getState();
      setSound(savedSound === null ? fallback.soundEnabled : !!savedSound);
      setHaptics(savedHaptics === null ? fallback.hapticsEnabled : !!savedHaptics);
    })();
  }, []);

  const onToggleSound = async (v) => {
    setSound(v);
    await setSoundEnabled(v);
  };

  const onToggleHaptics = async (v) => {
    setHaptics(v);
    await setHapticsEnabled(v);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Настройки</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Звук интерфейса</Text>
        <Switch
          value={sound}
          onValueChange={onToggleSound}
          thumbColor={sound ? colors.primary : "#aaa"}
          trackColor={{ false: "#3a3f4b", true: "#334155" }}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Вибрация</Text>
        <Switch
          value={haptics}
          onValueChange={onToggleHaptics}
          thumbColor={haptics ? colors.primary : "#aaa"}
          trackColor={{ false: "#3a3f4b", true: "#334155" }}
        />
      </View>

      <Text style={styles.hint}>
        Звук клика срабатывает при нажатии на все кнопки интерфейса.
        Отключите «Звук», если хотите играть без аудио.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.bg ?? "#0b0f1a",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text ?? "#fff",
    marginBottom: 24,
  },
  row: {
    height: 56,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.card ?? "#111827",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: colors.text ?? "#fff",
  },
  hint: {
    marginTop: 16,
    color: "#97a3b6",
    fontSize: 13,
    lineHeight: 18,
  },
});
