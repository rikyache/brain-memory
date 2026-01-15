import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabaseClient";
import { readAllBests } from "./stats";
import { saveJSON } from "./storage";

// Те самые локальные ключи рекордов (смотри src/lib/stats.js)
export const BEST_KEYS = ["nm_best", "seq_best", "chimp_best", "vm_best", "cm_best"];

const DEVICE_ID_KEY = "BM_DEVICE_ID";

export async function getOrCreateDeviceId() {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Отправить рекорды в Supabase.
 * Ожидается таблица public.results с колонками:
 * - device_id text unique
 * - bests jsonb
 * - updated_at timestamptz
 */
export async function uploadBestsToSupabase() {
  const deviceId = await getOrCreateDeviceId();
  const bests = await readAllBests();

  // Если вообще ничего нет (все 0) — всё равно можно отправить.
  const { error } = await supabase
    .from("results")
    .upsert(
      {
        device_id: deviceId,
        bests,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id" }
    );

  if (error) throw error;
  return { ok: true, deviceId, bests };
}

/**
 * Скачать рекорды из Supabase и записать локально.
 */
export async function downloadBestsFromSupabase({ overwriteLocal = true } = {}) {
  const deviceId = await getOrCreateDeviceId();

  const { data, error } = await supabase
    .from("results")
    .select("bests")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) throw error;

  const bests = data?.bests || null;

  if (!bests) {
    return { ok: false, deviceId, message: "На сервере нет сохранённых результатов для этого устройства." };
  }

  if (overwriteLocal) {
    // Записываем локальные ключи рекордов
    for (const k of BEST_KEYS) {
      const v = typeof bests[k] === "number" ? bests[k] : 0;
      await saveJSON(k, v);
    }
  }

  return { ok: true, deviceId, bests };
}
