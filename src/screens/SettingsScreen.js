// src/screens/SettingsScreen.js
import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import PressableScale from "../components/PressableScale";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";

export default function SettingsScreen() {
  const [pairStep, setPairStep] = React.useState(2);
  const [sound, setSound] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [ps, snd, hap] = await Promise.all([
        loadJSON("pairStep", 2), loadJSON("sound", true), loadJSON("haptics", true)
      ]);
      if (!mounted) return;
      setPairStep(ps); setSound(!!snd); setHaptics(!!hap);
    })();
    return () => { mounted = false; };
  }, []);

  const pick = async (val) => { setPairStep(val); await saveJSON("pairStep", val); };
  const toggle = async (key, value, setter) => { const v = !value; setter(v); await saveJSON(key, v); };

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>Настройки</Text>

      <Text style={styles.section}>Card Match — увеличение пар за раунд</Text>
      <View style={styles.row}>
        <PressableScale onPress={() => pick(2)} style={[styles.opt, pairStep === 2 && styles.optActive]}>
          <Text style={[styles.optText, pairStep === 2 && styles.optTextActive]}>+2 пары</Text>
        </PressableScale>
        <PressableScale onPress={() => pick(4)} style={[styles.opt, pairStep === 4 && styles.optActive]}>
          <Text style={[styles.optText, pairStep === 4 && styles.optTextActive]}>+4 пары</Text>
        </PressableScale>
      </View>

      <Text style={styles.section}>Мультимедиа</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Звук</Text>
        <Switch
          value={sound}
          onValueChange={() => toggle("sound", sound, setSound)}
          trackColor={{ true: colors.primary, false: colors.outline }}
          thumbColor={colors.bg}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Вибро</Text>
        <Switch
          value={haptics}
          onValueChange={() => toggle("haptics", haptics, setHaptics)}
          trackColor={{ true: colors.primary, false: colors.outline }}
          thumbColor={colors.bg}
        />
      </View>

      <Text style={styles.note}>Настройки сохраняются локально (AsyncStorage).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 14, backgroundColor: colors.bg },
  h2: { fontSize: 22, fontWeight: "800", textAlign: "center", color: colors.text },
  section: { marginTop: 6, fontSize: 16, fontWeight: "700", color: colors.text },
  row: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 10 },
  opt: { paddingVertical: 12, paddingHorizontal: 18, borderWidth: 2, borderColor: colors.primary, borderRadius: 12, backgroundColor: colors.surface },
  optActive: { backgroundColor: colors.primary },
  optText: { color: colors.primary, fontWeight: "800" },
  optTextActive: { color: colors.primaryText },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.outline },
  switchLabel: { fontSize: 16, color: colors.text },
  note: { fontSize: 12, textAlign: "center", color: colors.subtext, marginTop: 10 },
});
