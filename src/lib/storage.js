import AsyncStorage from "@react-native-async-storage/async-storage";


export async function saveJSON(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn("saveJSON error", e); }
}
export async function loadJSON(key, def = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch (e) { return def; }
}
export async function removeKey(key) {
  try { await AsyncStorage.removeItem(key); } catch {}
}
