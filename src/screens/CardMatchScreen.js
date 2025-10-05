// src/screens/CardMatchScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableScale from "../components/PressableScale";
import { shuffle } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";

const EMOJI = ["🍉","🚗","🍍","⚽","🚌","✈️","🚀","🐶","🐱","🦊","🐼","🎲","🎧","💡","📚","🧩","🍔","🍩","🚲","🛵"];

function buildDeck(pairs) {
  const base = shuffle(EMOJI).slice(0, pairs);
  const deck = shuffle([...base, ...base]).map((emoji, i) => ({
    id: i, emoji, revealed: false, matched: false
  }));
  return deck;
}

export default function CardMatchScreen() {
  const [pairs, setPairs] = React.useState(2);
  const [deck, setDeck] = React.useState(buildDeck(2));
  const [open, setOpen] = React.useState([]); // индексы открытых карт (0..N)
  const [matchedCount, setMatchedCount] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [pairStep, setPairStep] = React.useState(2);
  const [locked, setLocked] = React.useState(false); // блокируем клики во время анимации закрытия

  React.useEffect(() => { loadJSON("cm_best", 0).then(setBest); }, []);
  React.useEffect(() => { loadJSON("pairStep", 2).then(setPairStep); }, []);
  React.useEffect(() => { reset(pairs); }, [pairs]);

  const reset = (p) => {
    setDeck(buildDeck(p));
    setOpen([]); setMatchedCount(0); setLocked(false);
  };

  const onCard = async (index) => {
    if (locked) return;
    setDeck(prev => {
      const d = prev.slice();
      const card = d[index];
      if (card.revealed || card.matched) return prev; // игнор
      card.revealed = true;
      return d;
    });

    setOpen(prevOpen => {
      const nextOpen = [...prevOpen, index];

      if (nextOpen.length === 2) {
        const [a, b] = nextOpen;
        setLocked(true);
        setTimeout(() => {
          setDeck(prev => {
            const d = prev.slice();
            if (d[a].emoji === d[b].emoji) {
              d[a].matched = d[b].matched = true;
              setMatchedCount(m => {
                const m2 = m + 1;
                // пройден раунд
                if (m2 === pairs) {
                  const nextPairs = pairs + pairStep;
                  const newBest = Math.max(best, nextPairs);
                  setBest(newBest);
                  saveJSON("cm_best", newBest);
                  setPairs(nextPairs);
                }
                return m2;
              });
            } else {
              d[a].revealed = false; d[b].revealed = false;
            }
            return d;
          });
          setOpen([]);
          setLocked(false);
        }, 650);
      }

      return nextOpen;
    });
  };

  const stop = async () => {
    const newBest = Math.max(best, pairs);
    setBest(newBest); await saveJSON("cm_best", newBest);
    setPairs(2);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.meta}>Пары: {pairs} · Best {best} · Шаг +{pairStep}</Text>
      <View style={styles.grid}>
        {deck.map((c, i) => {
          const up = c.revealed || c.matched;
          return (
            <PressableScale
              key={c.id}
              onPress={() => onCard(i)}
              disabled={locked || c.matched || c.revealed}
              style={[
                styles.card,
                up && styles.cardUp,
                c.matched && styles.cardMatched
              ]}
            >
              <Text style={[styles.cardText, c.matched && styles.cardTextMatched]}>
                {up ? c.emoji : "?"}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <View style={{ flexDirection:"row", gap: 10, marginTop: 10 }}>
        <PressableScale style={styles.btn} onPress={() => reset(pairs)}>
          <Text style={styles.btnText}>Перемешать</Text>
        </PressableScale>
        <PressableScale style={styles.btnOutline} onPress={stop}>
          <Text style={styles.btnOutlineText}>Стоп и сохранить</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 16, alignItems:"center", justifyContent:"center", backgroundColor: colors.bg },
  meta: { fontSize: 15, color: colors.subtext, marginBottom: 8 },
  grid: { width: 330, flexDirection:"row", flexWrap:"wrap", gap: 10, justifyContent:"center" },
  card: {
    width: 72, height: 92, borderRadius: 12, alignItems:"center", justifyContent:"center",
    backgroundColor: colors.surface2, borderWidth:2, borderColor: colors.outline
  },
  cardUp: { backgroundColor: colors.surface, borderColor: colors.primary },
  cardMatched: { backgroundColor: "#2E2E18" },
  cardText: { fontSize: 28, color: colors.text },
  cardTextMatched: { color: colors.tileLit },
  btn: { backgroundColor: colors.primary, padding: 12, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight:"900" },
  btnOutline: { borderWidth:2, borderColor: colors.primary, padding: 12, borderRadius: 12 },
  btnOutlineText: { color: colors.primary, fontWeight:"900" },
});
