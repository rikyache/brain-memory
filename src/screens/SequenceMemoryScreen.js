// src/screens/SequenceMemoryScreen.js
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Video } from "expo-av"; // нативное видео для iOS/Android
import PressableScale from "../components/PressableScale";
import { randInt } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";
import { win, match } from "../lib/sound";
import { triggerHapticFeedback, shareResults, notifyNewRecord } from "../lib/platformFeatures";

const GRID = 9; // 3x3

export default function SequenceMemoryScreen() {
  const [sequence, setSequence] = React.useState([]);
  const [lit, setLit] = React.useState(-1);
  const [phase, setPhase] = React.useState("show"); // show | input | over
  const [idx, setIdx] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [best, setBest] = React.useState(0);

  // Используем ref для отслеживания изначального best
  const initialBestRef = React.useRef(0);

  React.useEffect(() => {
    loadJSON("seq_best", 0).then((val) => {
      setBest(val);
      initialBestRef.current = val; // Сохраняем изначальное значение
    });
  }, []);

  // проигрывание/старт уровня
  React.useEffect(() => {
    const next = sequence.length ? sequence : [randInt(0, GRID - 1)];
    if (sequence.length === 0) setSequence(next);

    setPhase("show");
    let i = 0;
    const timer = setInterval(() => {
      setLit(next[i]);
      setTimeout(() => setLit(-1), 300);
      i++;
      if (i >= next.length) {
        clearInterval(timer);
        setTimeout(() => setPhase("input"), 350);
        setIdx(0);
      }
    }, 700);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const onPressTile = async (tile) => {
    if (phase !== "input") return;

    if (tile === sequence[idx]) {
      // Тактильная обратная связь при правильном выборе
      await triggerHapticFeedback("light");

      // закрыли всю последовательность — уровень пройден
      if (idx + 1 === sequence.length) {
        await triggerHapticFeedback("success");
        try { await match(); } catch { }
        const extended = sequence.concat(randInt(0, GRID - 1));
        setSequence(extended);
        setLevel((l) => l + 1);

        if (level > best) {
          setBest(level);
          await saveJSON("seq_best", level);
        }
      } else {
        setIdx((i) => i + 1);
      }
    } else {
      // Тактильная обратная связь при ошибке
      console.log("❌ SequenceMemory: Неправильная ячейка! tile=", tile, "expected=", sequence[idx]);
      await triggerHapticFeedback("error");

      const finalScore = level - 1;
      console.log("📊 SequenceMemory: finalScore=", finalScore, "initialBest=", initialBestRef.current);
      const isNewRecord = finalScore > initialBestRef.current; // Сравниваем с изначальным best
      console.log("🎯 SequenceMemory: isNewRecord=", isNewRecord);
      if (isNewRecord) {
        setBest(finalScore);
        await saveJSON("seq_best", finalScore);
        // Уведомление о новом рекорде ТОЛЬКО при проигрыше
        console.log("📢 SequenceMemory: Отправка уведомления о новом рекорде", finalScore);
        // Не блокируем UI - уведомление отправляется асинхронно без await
        notifyNewRecord("sequence", finalScore).catch(err => {
          console.warn("Notification error:", err);
        });
        console.log("📢 SequenceMemory: Уведомление запущено");
      }
      console.log("🏁 SequenceMemory: Устанавливаем phase='over'");
      setPhase("over");
      console.log("✅ SequenceMemory: Блок else завершён");
    }
  };

  const restart = () => {
    setSequence([]);
    setLevel(1);
    setPhase("show");
    initialBestRef.current = best; // Обновляем изначальный best для новой сессии
  };

  return (
    <View style={styles.container}>
      <Text style={styles.meta}>Level {level} · Best {best}</Text>

      <View style={styles.grid}>
        {Array.from({ length: GRID }, (_, i) => {
          const isLit = lit === i && phase === "show";
          return (
            <PressableScale
              key={i}
              onPress={() => onPressTile(i)}
              style={[styles.tile, isLit && styles.tileLit]}
              disabled={phase !== "input"}
              soundKey={null}
            >
              <View />
            </PressableScale>
          );
        })}
      </View>

      {phase === "over" && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ошибка в последовательности</Text>
            <Text style={styles.cardText}>Достигнут уровень: {level - 1}</Text>

            {/* квадратное видео с котом над кнопкой */}
            <View style={styles.videoWrapper}>
              {Platform.OS === "web" ? (
                // WEB: кладём файл в public/videos/cat.mp4
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
                // NATIVE: локальный файл из assets
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
                onPress={() => shareResults("sequence", level - 1)}
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
  container: {
    flex: 1, padding: 18, gap: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.bg
  },
  meta: { fontSize: 15, color: colors.subtext },
  grid: { width: 280, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  tile: {
    width: 84, height: 84, borderRadius: 14,
    backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.outline
  },
  tileLit: { backgroundColor: colors.tileLit, borderColor: colors.primary },
  overlay: {
    position: "absolute", inset: 0, backgroundColor: "#0008",
    alignItems: "center", justifyContent: "center"
  },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline,
    padding: 18, borderRadius: 16, gap: 10, minWidth: 260, alignItems: "center"
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  cardText: { color: colors.subtext, marginBottom: 6 },

  // квадрат 1:1 для видео/гиф
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

  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight: "900" },
});
