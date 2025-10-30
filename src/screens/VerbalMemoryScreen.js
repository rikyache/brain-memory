// src/screens/VerbalMemoryScreen.js
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import Video from "react-native-video"; // iOS/Android
import PressableScale from "../components/PressableScale";
import { loadJSON, saveJSON } from "../lib/storage";
import { fetchWords } from "../lib/api";
import { colors } from "../theme/colors";
import { win, wrong, lose } from "../lib/sound";

export default function VerbalMemoryScreen() {
  const [seen, setSeen] = React.useState(new Set());
  const [word, setWord] = React.useState("");
  const [lives, setLives] = React.useState(3);
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [pool, setPool] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [phase, setPhase] = React.useState("play"); // play | over

  React.useEffect(() => { loadJSON("vm_best", 0).then(setBest); }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchWords(controller.signal).then(w => {
      setPool(w);
      setLoading(false);
      setWord(w[Math.floor(Math.random() * w.length)]);
    }).catch(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const nextWord = () => {
    if (!pool.length) return;
    const wantSeen = Math.random() < 0.4 && seen.size > 0;
    if (wantSeen) {
      const arr = Array.from(seen);
      setWord(arr[Math.floor(Math.random() * arr.length)]);
    } else {
      setWord(pool[Math.floor(Math.random() * pool.length)]);
    }
  };

  const answer = async (btn) => {
    if (phase !== "play") return;
    const isSeenNow = seen.has(word);
    const correct = (btn === "SEEN" && isSeenNow) || (btn === "NEW" && !isSeenNow);

    if (correct) {
      try { await win(); } catch {}
      setScore(s => s + 1);
      if (!isSeenNow) {
        const ns = new Set(seen);
        ns.add(word);
        setSeen(ns);
      }
      nextWord();
    } else {
      const left = lives - 1;
      setLives(left);

      if (left <= 0) {
        try { await lose(); } catch {}
        if (score > best) { setBest(score); await saveJSON("vm_best", score); }
        setPhase("over");
      } else {
        try { await wrong(); } catch {}
        nextWord();
      }
    }
  };

  const restart = () => {
    setSeen(new Set());
    setScore(0);
    setLives(3);
    setPhase("play");
    nextWord();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.subtext }}>Загрузка слов…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.meta}>Lives {lives} · Score {score} · Best {best}</Text>
      <Text style={styles.word}>{word}</Text>

      <View style={styles.row}>
        <PressableScale style={styles.btn} onPress={() => answer("SEEN")} soundKey={null}>
          <Text style={styles.btnText}>SEEN</Text>
        </PressableScale>
        <PressableScale style={styles.btn} onPress={() => answer("NEW")} soundKey={null}>
          <Text style={styles.btnText}>NEW</Text>
        </PressableScale>
      </View>

      {phase === "over" && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Игра окончена</Text>
            <Text style={styles.cardText}>Счёт: {score}</Text>

            {/* квадратное видео с котом, как в NumberMemory */}
            <View style={styles.videoWrapper}>
              {Platform.OS === "web" ? (
                <video
                  src="/videos/cat.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  // controls // ← включи для отладки при необходимости
                  onError={(e) => console.warn("web video error", e)}
                />
              ) : (
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
  container: { flex:1, padding: 18, alignItems:"center", justifyContent:"center", gap: 12, backgroundColor: colors.bg },
  meta: { fontSize: 15, color: colors.subtext },
  word: { fontSize: 36, fontWeight:"900", textAlign:"center", marginVertical: 10, color: colors.text },
  row: { flexDirection:"row", gap: 12 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight:"900" },
  overlay: { position: "absolute", inset: 0, backgroundColor:"#0008", alignItems:"center", justifyContent:"center" },
  card: { backgroundColor: colors.surface, borderWidth:1, borderColor: colors.outline, padding:18, borderRadius:16, gap:10, minWidth:260, alignItems:"center" },
  cardTitle: { fontSize: 18, fontWeight:"900", color: colors.text },
  cardText: { color: colors.subtext, marginBottom: 6 },

  // квадрат 1:1 — общий стиль медиа
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
  cardVideo: {
    width: "100%",
    height: "100%",
  },
});
