import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableScale from "../components/PressableScale";
import { shuffle } from "../lib/utils";
import { loadJSON, saveJSON } from "../lib/storage";
import { colors } from "../theme/colors";
import { play } from "../lib/sound"; // <-- добавили

// Палитра владельца пары
const P1_COLOR = "#EDEDED"; // белый (игрок 1)
const P2_COLOR = "#3B82F6"; // синий (игрок 2)

// Достаточно для 20 пар (40 карт)
const EMOJI = [
  "🍉","🚗","🍍","⚽","🚌","✈️","🚀","🐶","🐱","🦊",
  "🐼","🎲","🎧","💡","📚","🧩","🍔","🍩","🚲","🛵"
];

// Случайное чётное число в диапазоне [min,max]
function randomEven(min, max) {
  const a = Math.floor(Math.random() * ((max - min + 1))) + min; // любое в интервале
  const ev = a % 2 === 0 ? a : a + 1; // сделать чётным
  const bounded = ev > max ? ev - 2 : ev; // не выйти за предел
  return Math.max(min, Math.min(max, bounded));
}

function buildDeckByCardCount(cardCount) {
  // cardCount — чётное: 26..40
  const pairs = cardCount / 2;
  const base = shuffle(EMOJI).slice(0, pairs);
  const deck = shuffle([...base, ...base]).map((emoji, i) => ({
    id: i,
    emoji,
    revealed: false,
    matched: false,
    owner: null, // 1|2 — кто открыл пару
  }));
  return deck;
}

export default function CardMatchScreen() {
  const [cardCount, setCardCount] = React.useState(randomEven(26, 40));
  const [deck, setDeck] = React.useState(buildDeckByCardCount(cardCount));
  const [open, setOpen] = React.useState([]); // индексы открытых (0..N)
  const [locked, setLocked] = React.useState(false); // блокируем клики во время проверки пары
  const [current, setCurrent] = React.useState(1); // 1 или 2 — чей ход
  const [score1, setScore1] = React.useState(0);
  const [score2, setScore2] = React.useState(0);
  const [matchedPairs, setMatchedPairs] = React.useState(0);
  const totalPairs = deck.length / 2;

  // для экрана профилей будем хранить лучший личный счёт
  const [best, setBest] = React.useState(0);
  React.useEffect(() => { loadJSON("cm_best", 0).then(setBest); }, []);

  // при смене cardCount или старте — сброс
  const resetNewRandom = () => {
    const n = randomEven(12, 18);
    setCardCount(n);
    setDeck(buildDeckByCardCount(n));
    setOpen([]); setLocked(false);
    setCurrent(1);
    setScore1(0); setScore2(0);
    setMatchedPairs(0);
  };

  const resetSameSize = () => {
    setDeck(buildDeckByCardCount(cardCount));
    setOpen([]); setLocked(false);
    setCurrent(1);
    setScore1(0); setScore2(0);
    setMatchedPairs(0);
  };

  const onCard = (index) => {
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
        setLocked(true);
        const [a, b] = nextOpen;

        setTimeout(() => {
          setDeck(prev => {
            const d = prev.slice();
            const A = d[a], B = d[b];

            if (A.emoji === B.emoji) {
              // Пара угадана текущим игроком
              A.matched = B.matched = true;
              A.owner = B.owner = current;
              // увеличить счёт и matchedPairs
              setMatchedPairs(m => m + 1);
              if (current === 1) setScore1(s => s + 1); else setScore2(s => s + 1);

              // проиграть звук совпадения
              play("match");

              // текущий сохраняет ход (НЕ переключаем current)
            } else {
              // Не угадал — закрываем и передаём ход сопернику
              A.revealed = false; B.revealed = false;
              setCurrent(c => (c === 1 ? 2 : 1));
            }
            return d;
          });

          setOpen([]);
          setLocked(false);
        }, 600);
      }

      return nextOpen;
    });
  };

  // конец игры когда все пары найдены
  const isOver = matchedPairs === totalPairs && totalPairs > 0;
  const winner =
    !isOver ? null :
    score1 === score2 ? 0 : (score1 > score2 ? 1 : 2);

  // при завершении — обновить лучший личный счёт
  React.useEffect(() => {
    if (isOver) {
      const personalBest = Math.max(score1, score2);
      if (personalBest > best) {
        setBest(personalBest);
        saveJSON("cm_best", personalBest);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOver]);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.meta}>
          Карточек: {cardCount} ({totalPairs} пар)
        </Text>
        <Text style={styles.meta}>
          Лучший личный счёт: {best}
        </Text>
      </View>

      <View style={styles.turnBar}>
        <View style={[styles.dot, { backgroundColor: current === 1 ? P1_COLOR : "#888" }]} />
        <Text style={[styles.turnText, current === 1 && styles.turnTextActive]}>
          Ход игрока 1 (белый)
        </Text>
        <View style={{ width: 16 }} />
        <View style={[styles.dot, { backgroundColor: current === 2 ? P2_COLOR : "#888" }]} />
        <Text style={[styles.turnText, current === 2 && styles.turnTextActive]}>
          Игрок 2 (синий)
        </Text>
      </View>

      <View style={styles.scores}>
        <Text style={[styles.score, { color: P1_COLOR }]}>P1: {score1}</Text>
        <Text style={[styles.score, { color: P2_COLOR }]}>P2: {score2}</Text>
      </View>

      <View style={styles.grid}>
        {deck.map((c, i) => {
          const up = c.revealed || c.matched;
          const ownerStyle =
            c.matched && c.owner === 1 ? styles.cardOwnerP1 :
            c.matched && c.owner === 2 ? styles.cardOwnerP2 :
            null;

          return (
            <PressableScale
              key={c.id}
              onPress={() => onCard(i)}
              disabled={locked || c.matched || c.revealed}
              style={[styles.card, up && styles.cardUp, ownerStyle]}
            >
              <Text style={[styles.cardText, ownerStyle && styles.cardTextOwner]}>
                {up ? c.emoji : "?"}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {/* Оверлей завершения */}
      {isOver && (
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {winner === 0 ? "Ничья!" : `Победа игрока ${winner}`}
            </Text>
            <Text style={styles.resultText}>
              Итог — P1: {score1} · P2: {score2}
            </Text>

            <View style={styles.rowBtns}>
              <PressableScale style={styles.btn} onPress={resetSameSize}>
                <Text style={styles.btnText}>Реванш (тот же размер)</Text>
              </PressableScale>
              <PressableScale style={styles.btnOutline} onPress={resetNewRandom}>
                <Text style={styles.btnOutlineText}>Новый размер</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const CARD_W = 70, CARD_H = 90;

const styles = StyleSheet.create({
  container: { flex:1, padding: 14, alignItems:"center", backgroundColor: colors.bg },
  top: { width:"100%", flexDirection:"row", justifyContent:"space-between", marginBottom: 8 },
  meta: { fontSize: 13, color: colors.subtext },

  turnBar: {
    flexDirection:"row", alignItems:"center", gap: 6,
    backgroundColor: colors.surface, borderWidth:1, borderColor: colors.outline,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 8
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  turnText: { color: colors.subtext, fontSize: 13, marginRight: 10 },
  turnTextActive: { color: colors.text, fontWeight:"800" },

  scores: { flexDirection:"row", gap: 16, marginBottom: 10 },
  score: { fontWeight:"900", fontSize: 16 },

  grid: { width: 360, flexDirection:"row", flexWrap:"wrap", gap: 8, justifyContent:"center" },
  card: {
    width: CARD_W, height: CARD_H, borderRadius: 12, alignItems:"center", justifyContent:"center",
    backgroundColor: colors.surface2, borderWidth:2, borderColor: colors.outline
  },
  cardUp: { backgroundColor: colors.surface, borderColor: colors.primary },
  cardOwnerP1: { backgroundColor: "#2A2A2A", borderColor: P1_COLOR },
  cardOwnerP2: { backgroundColor: "#15243A", borderColor: P2_COLOR },
  cardText: { fontSize: 28, color: colors.text },
  cardTextOwner: { textShadowColor: "#000", textShadowRadius: 4 },

  rowBtns: { flexDirection:"row", gap: 10, marginTop: 8 },

  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight:"900", fontSize: 13 },

  btnOutline: { borderWidth:2, borderColor: colors.primary, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  btnOutlineText: { color: colors.primary, fontWeight:"900", fontSize: 13 },

  overlay: { position: "absolute", inset: 0, backgroundColor:"#0008", alignItems:"center", justifyContent:"center" },
  resultCard: {
    backgroundColor: colors.surface, borderWidth:1, borderColor: colors.outline,
    padding: 18, borderRadius: 16, gap: 8, minWidth: 280, alignItems: "center"
  },
  resultTitle: { fontSize: 20, fontWeight:"900", color: colors.text },
  resultText: { color: colors.subtext },
});