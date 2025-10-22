// src/lib/sound.js
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { loadJSON, saveJSON } from "./storage";

// Settings keys
const K_SOUND   = "@settings:soundEnabled";
const K_HAPTICS = "@settings:hapticsEnabled";
const K_VOLUME  = "@settings:volume";

let soundEnabled = true;
let hapticsEnabled = true;
let volume = 1.0;

// Регистр звуков (положи файлы в /assets/sounds)
const REGISTRY = {
  click:   require("../../assets/sounds/ui-click.mp3"),
  match:   require("../../assets/sounds/match.mp3"),
  wrong:   require("../../assets/sounds/wrong.mp3"),
  win:     require("../../assets/sounds/win.mp3"),
  lose:    require("../../assets/sounds/lose.mp3"),
  record:  require("../../assets/sounds/record.mp3"),
};

const cache = new Map(); // Map<key, Audio.Sound>

async function ensureLoaded(key) {
  if (cache.has(key)) return cache.get(key);
  const module = REGISTRY[key];
  if (!module) return null;
  const snd = new Audio.Sound();
  await snd.loadAsync(module, { volume, shouldPlay: false }, false);
  cache.set(key, snd);
  return snd;
}

export async function initSound() {
  const [s, h, v] = await Promise.all([
    loadJSON(K_SOUND, true),
    loadJSON(K_HAPTICS, true),
    loadJSON(K_VOLUME, 1.0),
  ]);
  soundEnabled = !!s;
  hapticsEnabled = !!h;
  volume = typeof v === "number" ? v : 1.0;

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    interruptionModeIOS: 1,
  });

  await Promise.all(
    [...cache.values()].map(snd => snd.setVolumeAsync(volume).catch(()=>{}))
  );
}

export function getState() { return { soundEnabled, hapticsEnabled, volume }; }
export async function setSoundEnabled(v){ soundEnabled = !!v; await saveJSON(K_SOUND, soundEnabled); }
export async function setHapticsEnabled(v){ hapticsEnabled = !!v; await saveJSON(K_HAPTICS, hapticsEnabled); }
export async function setVolume(v){
  volume = Math.max(0, Math.min(1, Number(v) || 0));
  await saveJSON(K_VOLUME, volume);
  await Promise.all([...cache.values()].map(snd => snd.setVolumeAsync(volume).catch(()=>{})));
}

export async function play(key, opts = {}) {
  if (!soundEnabled) return;
  try {
    const snd = await ensureLoaded(key);
    if (!snd) return;
    await snd.setPositionAsync(0);
    if (opts.volume != null) await snd.setVolumeAsync(opts.volume);
    await snd.playAsync();
  } catch (e) { /* web autoplay restrictions — ок, молчим */ }

  if (hapticsEnabled && (opts.haptic ?? true)) {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
  }
}

// Шорткаты
export const click  = () => play("click",  { haptic: true });
export const match  = () => play("match");
export const wrong  = () => play("wrong");
export const win    = () => play("win");
export const lose   = () => play("lose");
export const record = () => play("record", { haptic: true });

export async function unloadAllSounds() {
  await Promise.all([...cache.values()].map(snd => snd.unloadAsync().catch(()=>{})));
  cache.clear();
}
