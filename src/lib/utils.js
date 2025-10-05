// src/lib/utils.js
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function genNumberOfDigits(n) {
  if (n <= 1) return String(randInt(0, 9));
  const first = String(randInt(1, 9));
  let rest = "";
  for (let i = 0; i < n - 1; i++) rest += String(randInt(0, 9));
  return first + rest;
}
