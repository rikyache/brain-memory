# 🧠 Brain Memory — README (dev)

## ⚙️ Требования
- Node.js ≥ 18
- npm / yarn / pnpm
- Expo CLI (`npx expo start` — глобально не обязательно)

---

## 🚀 Установка и запуск

```bash
git clone https://github.com/rikyache/brain-memory
cd brain-memory
npm install
npm run start
```

Дополнительно:
```bash
npm run android   # Android (Expo Go)
npm run ios       # iOS (macOS)
npm run web       # Web
```

---

## 📂 Структура
```
App.js
src/
  screens/      # экраны NumberMemory, VerbalMemory и др.
  lib/          # утилиты
  theme/        # стили
app.json
package.json
```

---

## 🧩 Примечание
- `.env` не используется
- Все зависимости ставятся через `npm install`
- Для Expo Go достаточно `npm run start`


## Тестирование
- `npm run test`
