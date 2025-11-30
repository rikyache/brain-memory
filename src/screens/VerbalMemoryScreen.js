// src/screens/VerbalMemoryScreen.js
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { Video } from "expo-av"; // iOS/Android
import PressableScale from "../components/PressableScale";
import { loadJSON, saveJSON } from "../lib/storage";
import { fetchWords } from "../lib/api";
import { colors } from "../theme/colors";
import { win, wrong, lose } from "../lib/sound";
import { triggerHapticFeedback, shareResults, notifyNewRecord } from "../lib/platformFeatures";

export default function VerbalMemoryScreen() {
  const [seen, setSeen] = React.useState(new Set());
  const [word, setWord] = React.useState("");
  const [lives, setLives] = React.useState(3);
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [pool, setPool] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [phase, setPhase] = React.useState("play"); // play | over

  // Используем ref для отслеживания актуального счёта
  const scoreRef = React.useRef(0);
  // Используем ref для отслеживания изначального best
  const initialBestRef = React.useRef(0);
  // Используем ref для отслеживания актуального количества жизней
  const livesRef = React.useRef(3);

  React.useEffect(() => {
    loadJSON("vm_best", 0).then((val) => {
      setBest(val);
      initialBestRef.current = val; // Сохраняем изначальное значение
    });
  }, []);

  // Синхронизируем livesRef с состоянием lives
  React.useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

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
      await triggerHapticFeedback("light");
      try { await win(); } catch { }
      // Обновляем и ref, и state
      scoreRef.current += 1;
      setScore(scoreRef.current);
      if (!isSeenNow) {
        const ns = new Set(seen);
        ns.add(word);
        setSeen(ns);
      }
      nextWord();
    } else {
      // Используем актуальное значение из ref
      const currentLives = livesRef.current;
      const left = currentLives - 1;
      livesRef.current = left; // Обновляем ref сразу
      setLives(left);

      if (left <= 0) {
        await triggerHapticFeedback("error");
        try { await lose(); } catch { }
        // Используем scoreRef.current для актуального значения
        const currentScore = scoreRef.current;
        if (currentScore > initialBestRef.current) { // Сравниваем с изначальным best
          setBest(currentScore);
          await saveJSON("vm_best", currentScore);
          console.log("📢 VerbalMemory: Отправка уведомления о новом рекорде", currentScore);
          // Не блокируем UI - уведомление отправляется асинхронно без await
          notifyNewRecord("verbal", currentScore).catch(err => {
            console.warn("Notification error:", err);
          });
          console.log("📢 VerbalMemory: Уведомление запущено");
        }
        setPhase("over");
      } else {
        await triggerHapticFeedback("warning");
        try { await wrong(); } catch { }
        nextWord();
      }
    }
  };

  const restart = () => {
    setSeen(new Set());
    setScore(0);
    scoreRef.current = 0; // Сбрасываем ref
    setLives(3);
    livesRef.current = 3; // Сбрасываем ref для жизней
    setPhase("play");
    initialBestRef.current = best; // Обновляем изначальный best для новой сессии
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
                  isLooping
                  isMuted
                  shouldPlay
                  onError={(e) => console.warn("native video error", e)}
                />
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <PressableScale style={styles.btn} onPress={restart}>
                <Text style={styles.btnText}>Заново</Text>
              </PressableScale>
              <PressableScale
                style={[styles.btn, { backgroundColor: "#10b981" }]}
                onPress={() => shareResults("verbal", score)}
              >
                <Text style={styles.btnText}>Поделиться</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg },
  meta: { fontSize: 15, color: colors.subtext },
  word: { fontSize: 36, fontWeight: "900", textAlign: "center", marginVertical: 10, color: colors.text },
  row: { flexDirection: "row", gap: 12 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight: "900" },
  overlay: { position: "absolute", inset: 0, backgroundColor: "#0008", alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline, padding: 18, borderRadius: 16, gap: 10, minWidth: 260, alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
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
