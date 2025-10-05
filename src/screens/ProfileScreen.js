// src/screens/ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PressableScale from "../components/PressableScale";
import { readAllBests, clearAllBests } from "../lib/stats";
import { colors } from "../theme/colors";

export default function ProfileScreen() {
  const [bests, setBests] = React.useState({});

  const load = React.useCallback(async () => {
    const data = await readAllBests();
    setBests(data);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const reset = async () => { await clearAllBests(); await load(); };

  return (
    <View style={styles.container}>
      <Text style={styles.h2}>Профиль</Text>
      <View style={styles.card}>
        <Text style={styles.item}>Number Memory: {bests.nm_best ?? 0}</Text>
        <Text style={styles.item}>Sequence Memory: {bests.seq_best ?? 0}</Text>
        <Text style={styles.item}>Chimp Test: {bests.chimp_best ?? 0}</Text>
        <Text style={styles.item}>Verbal Memory: {bests.vm_best ?? 0}</Text>
        <Text style={styles.item}>Card Match (пары): {bests.cm_best ?? 0}</Text>
      </View>
      <PressableScale style={styles.btnOutline} onPress={reset}>
        <Text style={styles.btnOutlineText}>Сбросить рекорды</Text>
      </PressableScale>
      <Text style={styles.note}>Данные хранятся локально (AsyncStorage).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 18, gap: 12, alignItems:"center", backgroundColor: colors.bg },
  h2: { fontSize: 22, fontWeight: "800", marginTop: 8, color: colors.text },
  card: { width:"100%", backgroundColor: colors.surface, borderRadius:12, padding:14, gap:6, borderWidth:1, borderColor: colors.outline },
  item: { fontSize: 16, color: colors.text },
  btnOutline: { borderWidth:2, borderColor:"#DCB626", paddingVertical:12, paddingHorizontal:18, borderRadius:12, marginTop:6 },
  btnOutlineText: { color:"#DCB626", fontWeight:"800" },
  note: { fontSize: 12, color: colors.subtext, textAlign:"center", marginTop: 6 }
});