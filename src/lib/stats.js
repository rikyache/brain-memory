// src/lib/stats.js
import { loadJSON, saveJSON, removeKey } from "./storage";
import { record as playRecord } from "./sound";

// атомарное обновление рекорда
export async function updateBest(key, candidate, { playSound = true } = {}) {
  const prev = await loadJSON(key, 0);
  if (candidate > prev) {
    await saveJSON(key, candidate);
    if (playSound) { try { await playRecord(); } catch {} }
    return { best: candidate, isNew: true };
  }
  return { best: prev, isNew: false };
}

export async function readAllBests() {
  const keys = ["nm_best","seq_best","chimp_best","vm_best","cm_best"];
  const out = {};
  for (const k of keys) out[k] = await loadJSON(k, 0);
  return out;
}
export async function clearAllBests() {
  const keys = ["nm_best","seq_best","chimp_best","vm_best","cm_best"];
  for (const k of keys) await removeKey(k);
}
