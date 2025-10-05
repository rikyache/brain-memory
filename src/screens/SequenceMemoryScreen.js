// src/screens/SequenceMemoryScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableScale from "../components/PressableScale";
import { randInt } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";

const GRID = 9; // 3x3

export default function SequenceMemoryScreen() {
  const [sequence, setSequence] = React.useState([]);
  const [lit, setLit] = React.useState(-1);
  const [phase, setPhase] = React.useState("show"); // show | input | over
  const [idx, setIdx] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [best, setBest] = React.useState(0);

  React.useEffect(() => { loadJSON("seq_best", 0).then(setBest); }, []);

  // проигрывание/старт уровня
  React.useEffect(() => {
    const next = sequence.length ? sequence : [randInt(0, GRID-1)];
    if (sequence.length === 0) setSequence(next);

    setPhase("show");
    let i = 0;
    const timer = setInterval(() => {
      setLit(next[i]);
      setTimeout(() => setLit(-1), 300);
      i++;
      if (i >= next.length) { clearInterval(timer); setTimeout(() => setPhase("input"), 350); setIdx(0); }
    }, 700);
    return () => clearInterval(timer);
  }, [level]);

  const onPressTile = async (tile) => {
    if (phase !== "input") return;
    if (tile === sequence[idx]) {
      if (idx + 1 === sequence.length) {
        const extended = sequence.concat(randInt(0, GRID-1));
        setSequence(extended);
        setLevel(l => l + 1);
        if (level > best) { setBest(level); await saveJSON("seq_best", level); }
      } else {
        setIdx(i => i + 1);
      }
    } else {
      if (level - 1 > best) { setBest(level - 1); await saveJSON("seq_best", level - 1); }
      setPhase("over");
    }
  };

  const restart = () => { setSequence([]); setLevel(1); setPhase("show"); };

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
  container: { flex:1, padding: 18, gap: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  meta: { fontSize: 15, color: colors.subtext },
  grid: { width: 280, flexDirection:"row", flexWrap:"wrap", gap: 10, justifyContent:"center" },
  tile: {
    width: 84, height: 84, borderRadius: 14,
    backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.outline
  },
  tileLit: { backgroundColor: colors.tileLit, borderColor: colors.primary },
  overlay: { position: "absolute", inset: 0, backgroundColor:"#0008", alignItems:"center", justifyContent:"center" },
  card: { backgroundColor: colors.surface, borderWidth:1, borderColor: colors.outline, padding:18, borderRadius:16, gap:10, minWidth:260, alignItems:"center" },
  cardTitle: { fontSize: 18, fontWeight:"900", color: colors.text },
  cardText: { color: colors.subtext, marginBottom: 6 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight:"900" },
});
