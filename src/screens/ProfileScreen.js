// src/screens/ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import PressableScale from "../components/PressableScale";
import { readAllBests, clearAllBests } from "../lib/stats";
import { uploadBestsToSupabase, downloadBestsFromSupabase } from "../lib/resultsSync";
import { colors } from "../theme/colors";

export default function ProfileScreen() {
  const [bests, setBests] = React.useState({});

  const load = React.useCallback(async () => {
    const data = await readAllBests();
    setBests(data);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const reset = async () => { await clearAllBests(); await load(); };

  const sendToServer = async () => {
    try {
      await uploadBestsToSupabase();
      Alert.alert("Готово", "Результаты отправлены на сервер ✅");
    } catch (e) {
      Alert.alert("Ошибка", String(e?.message || e));
    }
  };

  const downloadFromServer = async () => {
    try {
      const r = await downloadBestsFromSupabase({ overwriteLocal: true });
      if (!r.ok) {
        Alert.alert("Нет данных", r.message || "На сервере нет данных.");
        return;
      }
      await load();
      Alert.alert("Готово", "Результаты скачаны и сохранены локально ✅");
    } catch (e) {
      Alert.alert("Ошибка", String(e?.message || e));
    }
  };

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

      <PressableScale style={styles.btnPrimary} onPress={sendToServer}>
        <Text style={styles.btnPrimaryText}>Отправить результаты</Text>
      </PressableScale>
      <PressableScale style={styles.btnPrimary} onPress={downloadFromServer}>
        <Text style={styles.btnPrimaryText}>Скачать результаты</Text>
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
  btnPrimary: { width:"100%", backgroundColor: colors.primary, paddingVertical:12, borderRadius:12, alignItems:"center" },
  btnPrimaryText: { color:"#0b0f1a", fontWeight:"900" },
  note: { fontSize: 12, color: colors.subtext, textAlign:"center", marginTop: 6 }
});
