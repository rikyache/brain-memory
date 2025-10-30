// src/screens/NumberMemoryScreen.js
import React from "react";
import { View, Text, StyleSheet, TextInput, Platform } from "react-native";
import Video from "react-native-video"; // для iOS/Android
import PressableScale from "../components/PressableScale";
import { genNumberOfDigits } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { match, lose } from "../lib/sound";
import { colors } from "../theme/colors";

export default function NumberMemoryScreen() {
  const [level, setLevel] = React.useState(1);
  const [target, setTarget] = React.useState("");
  const [phase, setPhase] = React.useState("show"); // show | input | over
  const [input, setInput] = React.useState("");
  const [best, setBest] = React.useState(0);

  React.useEffect(() => { loadJSON("nm_best", 0).then(setBest); }, []);

  React.useEffect(() => {
    const t = genNumberOfDigits(level);
    setTarget(t);
    setPhase("show");
    setInput("");

    const seconds = Math.max(0.4, t.length);
    const id = setTimeout(() => setPhase("input"), Math.round(seconds * 1000));
    return () => clearTimeout(id);
  }, [level]);

  const onSubmit = async () => {
    const ok = input.trim() === target;

    if (ok) {
      try { await match(); } catch {}
      const next = level + 1;
      if (next - 1 > best) {
        setBest(next - 1);
        await saveJSON("nm_best", next - 1);
      }
      if (next > 20) {
        setPhase("over");
      } else {
        setLevel(next);
      }
    } else {
      try { await lose(); } catch {}
      if (level - 1 > best) {
        setBest(level - 1);
        await saveJSON("nm_best", level - 1);
      }
      setPhase("over");
    }
  };

  const restart = () => {
    setLevel(1);
    setPhase("show");
  };

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
            inputMode="numeric"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            blurOnSubmit={false}
            style={styles.input}
          />
          <PressableScale style={styles.btn} onPress={onSubmit} soundKey={null}>
            <Text style={styles.btnText}>Проверить</Text>
          </PressableScale>
        </>
      )}

      {phase === "over" && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Игра окончена</Text>
            <Text style={styles.cardText}>Достигнут уровень: {level - 1}</Text>

            {/* Медиа-квадрат */}
            <View style={styles.videoWrapper}>
              {Platform.OS === "web" ? (
                // WEB: HTML5 video, файл лежит в public/videos/cat.mp4
                <video
                  src="/videos/cat.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  // для отладки можно включить:
                  // controls
                  onError={(e) => console.warn("web video error", e)}
                />
              ) : (
                // NATIVE: react-native-video
                <Video
                  source={require("../../assets/videos/cat.mp4")}
                  style={styles.cardVideo}
                  resizeMode="cover"
                  repeat
                  muted
                  paused={false}
                  onError={(e) => console.warn("native video error", e)}
                />
              )}
            </View>

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

  // квадрат 1:1
  videoWrapper: {
    width: 220,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: "#000",
    alignSelf: "center",
  },
  cardVideo: { width: "100%", height: "100%" },
});
