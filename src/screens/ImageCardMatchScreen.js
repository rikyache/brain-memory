// src/screens/ImageCardMatchScreen.js
import React from "react";
import { View, Text, StyleSheet, FlatList, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import PressableScale from "../components/PressableScale";
import { colors } from "../theme/colors";
import { click } from "../lib/sound";

const SAMPLE_URIS = [
  // Лёгкие образцы (без авторских проблем): picsum
  "https://picsum.photos/seed/brain1/300/300",
  "https://picsum.photos/seed/brain2/300/300",
  "https://picsum.photos/seed/brain3/300/300",
  "https://picsum.photos/seed/brain4/300/300",
  "https://picsum.photos/seed/brain5/300/300",
  "https://picsum.photos/seed/brain6/300/300",
];

function makeDeck(uris) {
  // Делаем пары: на каждую URI — 2 карты
  const base = uris.flatMap((uri, idx) => [
    { id: `c${idx}-a`, key: `k${idx}-a`, uri, flipped: false, matched: false },
    { id: `c${idx}-b`, key: `k${idx}-b`, uri, flipped: false, matched: false },
  ]);
  // Перемешаем
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

export default function ImageCardMatchScreen() {
  const [deck, setDeck] = React.useState([]);
  const [lock, setLock] = React.useState(false);
  const [first, setFirst] = React.useState(null);
  const [moves, setMoves] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);

  // Таймер
  React.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const startWithUris = React.useCallback((uris) => {
    if (!uris?.length) return;
    setDeck(makeDeck(uris));
    setFirst(null);
    setMoves(0);
    setSeconds(0);
  }, []);

  const pickFromGallery = React.useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Нет доступа", "Разреши доступ к фото для подбора изображений.");
          return;
        }
      }

      // На нативе попробуем множественный выбор, на web как получится
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 8, // до 8 картинок → 16 карт (4x4)
      });

      if (res.canceled) return;

      const uris = (res.assets || [])
        .map((a) => a?.uri)
        .filter(Boolean)
        .slice(0, 8);

      if (uris.length < 3) {
        Alert.alert("Мало изображений", "Выбери минимум 3 изображения (лучше 6–8).");
        return;
      }

      startWithUris(uris);
    } catch (e) {
      console.error(e);
      Alert.alert("Ошибка", "Не удалось выбрать изображения.");
    }
  }, [startWithUris]);

  const useSamples = React.useCallback(() => {
    startWithUris(SAMPLE_URIS);
  }, [startWithUris]);

  const onCardPress = React.useCallback(
    async (idx) => {
      if (lock) return;
      const d = [...deck];
      const card = d[idx];
      if (!card || card.flipped || card.matched) return;

      await click().catch(() => {});
      card.flipped = true;
      setDeck(d);

      if (!first) {
        setFirst({ idx, uri: card.uri });
        return;
      }

      // второй выбор
      setLock(true);
      setMoves((m) => m + 1);

      const prev = first;
      setFirst(null);

      if (card.uri === prev.uri && idx !== prev.idx) {
        // совпадение
        d[idx].matched = true;
        d[prev.idx].matched = true;
        setDeck([...d]);
        setLock(false);

        // победа?
        const allDone = d.every((c) => c.matched);
        if (allDone) {
          setTimeout(() => {
            Alert.alert(
              "Готово!",
              `Все пары найдены.\nХоды: ${moves + 1}\nВремя: ${seconds} c`,
              [{ text: "Ок" }]
            );
          }, 150);
        }
      } else {
        // промах — перевернём обратно
        setTimeout(() => {
          d[idx].flipped = false;
          d[prev.idx].flipped = false;
          setDeck([...d]);
          setLock(false);
        }, 500);
      }
    },
    [deck, first, lock, moves, seconds]
  );

  const gridSize = React.useMemo(() => {
    const n = deck.length;
    if (n <= 12) return 3; // 3x? (до 12 карт)
    return 4; // 4x? (до 16 карт)
  }, [deck.length]);

  const keyExtractor = (item) => item.key;

  const renderItem = ({ item, index }) => {
    const show = item.flipped || item.matched;
    return (
      <PressableScale
        key={item.key}
        onPress={() => onCardPress(index)}
        disabled={item.flipped || item.matched || lock}
        style={[styles.card, item.matched && styles.cardMatched]}
      >
        {show ? (
          <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.cardBack}>
            <Text style={styles.cardBackText}>?</Text>
          </View>
        )}
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Card Match</Text>
      <Text style={styles.subtitle}>
        Найди пары изображений. Это тренирует рабочую память и устойчивое внимание.
      </Text>

      <View style={styles.toolbar}>
        <PressableScale style={styles.btn} onPress={pickFromGallery}>
          <Text style={styles.btnText}>📷 Выбрать из галереи</Text>
        </PressableScale>
        <PressableScale style={styles.btnGhost} onPress={useSamples}>
          <Text style={styles.btnGhostText}>🎲 Образцы</Text>
        </PressableScale>
        <PressableScale
          style={styles.btnGhost}
          onPress={() => startWithUris(deck.filter((c, i, a) => a.findIndex(x => x.uri===c.uri)===i).map((c) => c.uri))}
          disabled={!deck.length}
        >
          <Text style={[styles.btnGhostText, !deck.length && { opacity: 0.5 }]}>↻ Перезапуск</Text>
        </PressableScale>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>Ходы: {moves}</Text>
        <Text style={styles.statText}>Время: {seconds} c</Text>
      </View>

      <FlatList
        contentContainerStyle={[
          styles.grid,
          { gridTemplateColumns: `repeat(${gridSize}, 1fr)` },
        ]}
        numColumns={gridSize}
        data={deck}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.subtext, textAlign: "center", marginBottom: 12 },
  toolbar: { flexDirection: "row", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12,
  },
  btnText: { color: colors.primaryText, fontWeight: "800" },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 2, borderColor: colors.primary,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 12,
  },
  btnGhostText: { color: colors.primary, fontWeight: "700" },
  stats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  statText: { color: colors.subtext, fontWeight: "600" },

  grid: {
    flexGrow: 1,
    gap: 8,
    // На native FlatList выкладывает по numColumns; на web gridTemplateColumns улучшает вид
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "#121620",
  },
  cardMatched: {
    opacity: 0.45,
  },
  image: { width: "100%", height: "100%" },
  cardBack: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "#202736",
  },
  cardBackText: { color: "#e5e7eb", fontSize: 26, fontWeight: "800" },
});
