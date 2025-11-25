import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { colors } from "../theme/colors";
import { loadJSON } from "../lib/storage";
import {
  getState,
  setSoundEnabled,
  setHapticsEnabled,
  setVolume,
} from "../lib/sound";

const K_SOUND = "@settings:soundEnabled";
const K_HAPTICS = "@settings:hapticsEnabled";
const K_VOLUME = "@settings:volume";

export default function SettingsScreen() {
  const initial = getState();
  const [sound, setSound] = React.useState(initial.soundEnabled);
  const [haptics, setHaptics] = React.useState(initial.hapticsEnabled);
  const [volume, setVol] = React.useState(
    typeof initial.volume === "number" ? initial.volume : 1
  );

  React.useEffect(() => {
    (async () => {
      try {
        const savedSound = await loadJSON(K_SOUND, null);
        if (savedSound !== null) setSound(!!savedSound);

        const savedHaptics = await loadJSON(K_HAPTICS, null);
        if (savedHaptics !== null) setHaptics(!!savedHaptics);

        const savedVolume = await loadJSON(K_VOLUME, null);
        if (typeof savedVolume === "number") setVol(savedVolume);
      } catch {}
    })();
  }, []);

  const onToggleSound = async (v) => {
    setSound(v);
    try { await setSoundEnabled(v); } catch {}
  };

  const onToggleHaptics = async (v) => {
    setHaptics(v);
    try { await setHapticsEnabled(v); } catch {}
  };

  const onVolumeDone = async (v) => {
    try { await setVolume(v); } catch {}
  };

  return (
    <View style={styles.container}>
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

      <View style={{ width: "100%", marginTop: 8, marginBottom: 8 }}>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={volume}
          onValueChange={setVol}
          onSlidingComplete={onVolumeDone}
        />
        <Text style={styles.hint}>Громкость: {Math.round(volume * 100)}%</Text>
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
        Звук клика срабатывает при нажатии на все кнопки интерфейса. Вы можете
        отключить звук или отрегулировать громкость. На iOS звук активен даже в
        беззвучном режиме (игровой режим).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
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