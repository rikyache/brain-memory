// src/lib/sound.js
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { loadJSON, saveJSON } from "./storage";

const K_SOUND = "@settings:soundEnabled";
const K_HAPTICS = "@settings:hapticsEnabled";
const K_VOLUME = "@settings:volume";

let soundEnabled = true;
let hapticsEnabled = true;
let volume = 1.0;

// Кэш Audio.Sound по ключу
const cache = new Map();

// Маппинг коротких ключей на ассеты
const SOUND_MAP = {
  click: require("../../assets/sounds/ui-click.mp3"),
};

// Загружаем (лениво) и отдаём экземпляр звука
async function getSound(key) {
  if (!SOUND_MAP[key]) throw new Error(`Unknown sound key: ${key}`);
  if (cache.has(key)) return cache.get(key);

  const { sound } = await Audio.Sound.createAsync(SOUND_MAP[key], {
    volume,
    shouldPlay: false,
  });
  cache.set(key, sound);
  return sound;
}

export async function play(key) {
  if (!soundEnabled) return;
  try {
    const snd = await getSound(key);

    await snd.setPositionAsync(0);
    await snd.setVolumeAsync(volume);
    await snd.playAsync();
  } catch (e) {
  }
}

// клик + вибрация
export async function click() {
  await play("click");
  if (hapticsEnabled) {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  }
}

// --- Настройки и инициализация ---

export async function initSoundSettings() {
  const [snd, hap, vol] = await Promise.all([
    loadJSON(K_SOUND, true),
    loadJSON(K_HAPTICS, true),
    loadJSON(K_VOLUME, 1.0),
  ]);
  soundEnabled = !!snd;
  hapticsEnabled = !!hap;
  volume = Math.min(1, Math.max(0, Number(vol) || 1));
  try { await getSound("click"); } catch {}
}

export function getState() {
  return { soundEnabled, hapticsEnabled, volume };
}

export async function setSoundEnabled(v) {
  soundEnabled = !!v;
  await saveJSON(K_SOUND, soundEnabled);
}

export async function setHapticsEnabled(v) {
  hapticsEnabled = !!v;
  await saveJSON(K_HAPTICS, hapticsEnabled);
}

export async function setVolume(v) {
  volume = Math.min(1, Math.max(0, Number(v) || 0));
  await saveJSON(K_VOLUME, volume);

  await Promise.all(
    [...cache.values()].map(s => s?.setVolumeAsync?.(volume).catch(() => {}))
  );
}

// Освобождение ресурсов 
export async function unloadAllSounds() {
  await Promise.all(
    [...cache.values()].map(s => s?.unloadAsync?.().catch(() => {}))
  );
  cache.clear();
}
