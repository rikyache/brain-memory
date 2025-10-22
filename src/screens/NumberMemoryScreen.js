// src/screens/NumberMemoryScreen.js
import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import PressableScale from "../components/PressableScale";
import { genNumberOfDigits } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";

export default function NumberMemoryScreen() {
  const [level, setLevel] = React.useState(1);
  const [target, setTarget] = React.useState("");
  const [phase, setPhase] = React.useState("ready"); // ready | show | input | over
  const [input, setInput] = React.useState("");
  const [best, setBest] = React.useState(0);

  React.useEffect(() => { loadJSON("nm_best", 0).then(setBest); }, []);

  const startLevel = React.useCallback(() => {
    const t = genNumberOfDigits(level);
    setTarget(t);
    setPhase("show");
    setInput("");
    // время показа = длина числа - 0.2 (но не меньше 0.4с)
    const seconds = Math.max(0.4, t.length);
    const id = setTimeout(() => setPhase("input"), Math.round(seconds * 1000));
    return () => clearTimeout(id);
  }, [level]);

  React.useEffect(() => { if (phase === "ready") startLevel(); }, [phase, startLevel]);

  const onSubmit = async () => {
    const ok = input.trim() === target;
    if (ok) {
      const next = level + 1;
      if (next - 1 > best) { setBest(next - 1); await saveJSON("nm_best", next - 1); }
      if (next > 20) { setPhase("over"); } else { setLevel(next); setPhase("ready"); }
    } else {
      if (level - 1 > best) { setBest(level - 1); await saveJSON("nm_best", level - 1); }
      setPhase("over");
    }
  };

  const restart = () => { setLevel(1); setPhase("ready"); };

  return (
    <View style={styles.container}>
      <Text style={styles.meta}>Level {level} · Best {best}</Text>

      {phase === "show" && <Text style={styles.number}>{target}</Text>}

      {phase === "input" && (
        <>
          <Text style={styles.label}>Введите число</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="…"
            placeholderTextColor={colors.subtext}
            keyboardType="numeric"
            style={styles.input}
          />
          <PressableScale style={styles.btn} onPress={onSubmit}>
            <Text style={styles.btnText}>Проверить</Text>
          </PressableScale>
        </>
      )}

      {phase === "over" && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Игра окончена</Text>
            <Text style={styles.cardText}>Достигнут уровень: {level}</Text>
            <PressableScale style={styles.btn} onPress={restart}>
              <Text style={styles.btnText}>Заново</Text>
            </PressableScale>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 18, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg },
  meta: { fontSize: 15, color: colors.subtext },
  number: { fontSize: 44, fontWeight: "900", letterSpacing: 2, textAlign: "center", color: colors.text },
  label: { fontSize: 16, color: colors.text },
  input: {
    borderWidth: 2, borderColor: colors.primary, borderRadius: 12,
    padding: 12, minWidth: 220, textAlign: "center", fontSize: 18, color: colors.text, backgroundColor: colors.surface
  },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, marginTop: 6 },
  btnText: { color: colors.primaryText, fontWeight: "900" },
  overlay: {
    position: "absolute", inset: 0, backgroundColor: "#0008", alignItems: "center", justifyContent: "center"
  },
  card: {
    backgroundColor: colors.surface, borderWidth:1, borderColor: colors.outline,
    padding: 18, borderRadius: 16, gap: 10, minWidth: 260, alignItems: "center"
  },
  cardTitle: { fontSize: 20, fontWeight: "900", color: colors.text },
  cardText: { color: colors.subtext, marginBottom: 6 },
});
