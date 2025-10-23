// src/screens/ChimpTestScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableScale from "../components/PressableScale";
import { shuffle } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";
import { match, lose, record } from "../lib/sound"; // ← добавили record

export default function ChimpTestScreen() {
  const [n, setN] = React.useState(4);          // начальное количество чисел
  const [cells, setCells] = React.useState([]); // [{pos, num}]
  const [hidden, setHidden] = React.useState(false);
  const [need, setNeed] = React.useState(1);
  const [strikes, setStrikes] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [phase, setPhase] = React.useState("play"); // play | over

  React.useEffect(() => { loadJSON("chimp_best", 0).then(setBest); }, []);

  const newLayout = React.useCallback((count) => {
    const positions = shuffle(Array.from({ length: 25 }, (_, i) => i)).slice(0, count);
    const nums = Array.from({ length: count }, (_, i) => i + 1);
    const pairs = shuffle(nums.map((num, i) => ({ pos: positions[i], num })));
    setCells(pairs);
    setNeed(1);
    setHidden(false);
  }, []);

  React.useEffect(() => { newLayout(n); }, [n, newLayout]);

  const miss = async () => {
    const s = strikes + 1;
    setStrikes(s);
    if (s >= 3) {
      // игра закончена → проверяем рекорд
      const achieved = n - 1;
      const isNew = achieved > best;

      if (isNew) {
        setBest(achieved);
        await saveJSON("chimp_best", achieved);
        try { await record(); } catch {}
      } else {
        try { await lose(); } catch {}
      }

      setPhase("over");
    } else {
      newLayout(n);
    }
  };

  const onPressCell = async (pos) => {
    if (phase !== "play") return;
    const cell = cells.find(c => c.pos === pos);
    if (!cell) return;

    if (!hidden) {
      if (cell.num === 1) { setHidden(true); setNeed(2); }
      else { await miss(); }
      return;
    }

    if (cell.num === need) {
      if (need === n) {
        // успешно закрыли всю последовательность → увеличиваем N и играем match
        const next = n + 1;
        if (next - 1 > best) { setBest(next - 1); await saveJSON("chimp_best", next - 1); }
        setStrikes(0);
        try { await match(); } catch {}
        setN(next);
      } else {
        setNeed(need + 1);
      }
    } else {
      await miss();
    }
  };

  const restart = () => {
    setN(4); setStrikes(0); setPhase("play"); newLayout(4);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.meta}>N={n} · Strikes {strikes}/3 · Best {best}</Text>

      <View style={styles.grid}>
        {Array.from({ length: 25 }, (_, i) => {
          const cell = cells.find(c => c.pos === i);
          const showNum = !hidden && !!cell;
          return (
            <PressableScale
              key={i}
              onPress={() => onPressCell(i)}
              style={[styles.tile, cell && styles.hasNum]}
              soundKey={null} // клики плиток без звука — логика звуков выше
            >
              {showNum ? <Text style={styles.num}>{cell?.num}</Text> : <View />}
            </PressableScale>
          );
        })}
      </View>

      {phase === "over" && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Поражение</Text>
            <Text style={styles.cardText}>Последнее N: {n - 1}</Text>
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
  container: { flex:1, padding: 16, alignItems:"center", justifyContent:"center", gap: 12, backgroundColor: colors.bg },
  meta: { fontSize: 15, color: colors.subtext },
  grid: { width: 320, flexDirection:"row", flexWrap:"wrap" },
  tile: {
    width: 60, height:60, margin: 4, borderRadius: 10,
    backgroundColor: colors.surface2, borderWidth:2, borderColor: colors.outline,
    alignItems:"center", justifyContent:"center"
  },
  hasNum: { backgroundColor: colors.surface },
  num: { fontSize:18, fontWeight:"900", color: colors.text },
  overlay: { position: "absolute", inset: 0, backgroundColor:"#0008", alignItems:"center", justifyContent:"center" },
  card: { backgroundColor: colors.surface, borderWidth:1, borderColor: colors.outline, padding:18, borderRadius:16, gap:10, minWidth:260, alignItems:"center" },
  cardTitle: { fontSize: 18, fontWeight:"900", color: colors.text },
  cardText: { color: colors.subtext, marginBottom: 6 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight:"900" },
});
