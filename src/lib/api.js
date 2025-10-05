// src/lib/api.js
// Пример управления ресурсами: загрузка слов через API с отменой и фолбэком.
const FALLBACK = [
  "subnormal","theory","bridge","orange","system","planet","unique","forest","memory","object",
  "delta","winter","author","silver","random","native","symbol","energy","coffee","rapid",
  "garden","window","camera","puzzle","future","ticket","galaxy","magnet","fabric","yellow"
];

/**
 * Возвращает массив слов. Пытается получить из публичного API, при ошибке — FALLBACK.
 * @param {AbortSignal} signal — для отмены запроса (очистка эффекта).
 */
export async function fetchWords(signal) {
  try {
    const res = await fetch("https://random-word-api.herokuapp.com/word?number=150", { signal });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    // Фильтруем слишком короткие/длинные, нормализуем
    const filtered = data
      .map(String)
      .filter(w => w.length >= 3 && w.length <= 12)
      .slice(0, 120);
    return filtered.length ? filtered : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
