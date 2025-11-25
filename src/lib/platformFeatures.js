// src/lib/platformFeatures.js
import { Platform, Share, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";

// ============================================================================
// HAPTIC FEEDBACK (Тактильная обратная связь)
// ============================================================================

/**
 * Типы тактильной обратной связи
 * - light: легкая вибрация (успешное действие)
 * - medium: средняя вибрация (нейтральное действие)
 * - heavy: сильная вибрация (ошибка, важное событие)
 * - success: паттерн успеха
 * - warning: паттерн предупреждения
 * - error: паттерн ошибки
 */
export async function triggerHapticFeedback(type = "medium") {
    try {
        if (Platform.OS === "ios") {
            // iOS: используем UIImpactFeedbackGenerator
            switch (type) {
                case "light":
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case "medium":
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case "heavy":
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case "success":
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case "warning":
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case "error":
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                default:
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        } else if (Platform.OS === "android") {
            // Android: используем Vibration API с разными паттернами
            const { Vibration } = require("react-native");

            switch (type) {
                case "light":
                    Vibration.vibrate(50); // короткая вибрация
                    break;
                case "medium":
                    Vibration.vibrate(100); // средняя вибрация
                    break;
                case "heavy":
                    Vibration.vibrate(200); // длинная вибрация
                    break;
                case "success":
                    Vibration.vibrate([0, 50, 100, 50]); // паттерн: пауза-короткая-пауза-короткая
                    break;
                case "warning":
                    Vibration.vibrate([0, 100, 100, 100]); // паттерн: пауза-средняя-пауза-средняя
                    break;
                case "error":
                    Vibration.vibrate([0, 200, 100, 200]); // паттерн: пауза-длинная-пауза-длинная
                    break;
                default:
                    Vibration.vibrate(100);
            }
        }
    } catch (error) {
        console.warn("Haptic feedback error:", error);
    }
}

// ============================================================================
// NOTIFICATIONS (Локальные уведомления)
// ============================================================================

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Запросить разрешение на уведомления
 */
export async function requestNotificationPermissions() {
    try {
        console.log("🔔 Requesting notification permissions...");
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log("🔔 Existing status:", existingStatus);
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            console.log("🔔 Requesting permissions...");
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            console.log("🔔 New status:", finalStatus);
        }

        if (finalStatus !== "granted") {
            console.warn("❌ Notification permission not granted");
            return false;
        }

        // Для Android создаем канал уведомлений
        if (Platform.OS === "android") {
            console.log("🔔 Creating Android notification channel...");
            await Notifications.setNotificationChannelAsync("default", {
                name: "Game Achievements",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
            console.log("✅ Android channel created");
        }

        console.log("✅ Notification permissions granted");
        return true;
    } catch (error) {
        console.warn("❌ Notification permission error:", error);
        return false;
    }
}

/**
 * Отправить локальное уведомление
 * @param {string} title - Заголовок уведомления
 * @param {string} body - Текст уведомления
 * @param {object} data - Дополнительные данные
 * @param {number} delaySeconds - Задержка в секундах (0 = немедленно)
 */
export async function scheduleNotification(title, body, data = {}, delaySeconds = 0) {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.warn("No notification permission");
            return null;
        }

        const trigger = delaySeconds > 0 ? { seconds: delaySeconds } : null;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
                // iOS специфичные настройки
                ...(Platform.OS === "ios" && {
                    badge: 1,
                    categoryIdentifier: "achievement",
                }),
                // Android специфичные настройки
                ...(Platform.OS === "android" && {
                    channelId: "default",
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                }),
            },
            trigger,
        });

        return notificationId;
    } catch (error) {
        console.warn("Schedule notification error:", error);
        return null;
    }
}

/**
 * Отправить уведомление о новом рекорде
 */
export async function notifyNewRecord(gameType, score) {
    const gameNames = {
        number: "Память на числа",
        sequence: "Последовательности",
        chimp: "Тест шимпанзе",
        verbal: "Вербальная память",
        card: "Поиск пар",
    };

    const gameName = gameNames[gameType] || "Игра";

    try {
        console.log("🎉 Attempting to send new record notification:", gameName, score);

        // Проверяем, что уведомления доступны на платформе
        if (Platform.OS !== "ios" && Platform.OS !== "android") {
            console.log("⚠️ Notifications not supported on this platform:", Platform.OS);
            return null;
        }

        // В Expo Go уведомления не работают, показываем Alert
        // В production build будут работать настоящие уведомления
        const result = await scheduleNotification(
            "🎉 Новый рекорд!",
            `Поздравляем! Вы установили новый рекорд в игре "${gameName}": ${score}`,
            { gameType, score, type: "new_record" },
            2 // задержка 2 секунды
        );

        if (result) {
            console.log("✅ Notification scheduled successfully with ID:", result);
        } else {
            console.log("⚠️ Notification was not scheduled (possibly no permission or Expo Go)");
            // В Expo Go показываем Alert для тестирования
            Alert.alert(
                "🎉 Новый рекорд!",
                `Поздравляем! Вы установили новый рекорд в игре "${gameName}": ${score}`
            );
        }

        return result;
    } catch (error) {
        console.warn("❌ Notify new record error:", error);
        // Показываем Alert как fallback
        try {
            Alert.alert(
                "🎉 Новый рекорд!",
                `Поздравляем! Вы установили новый рекорд в игре "${gameName}": ${score}`
            );
        } catch (alertError) {
            console.warn("❌ Alert also failed:", alertError);
        }
        return null;
    }
}

// ============================================================================
// SHARE (Поделиться результатами)
// ============================================================================

/**
 * Поделиться результатами игры
 * @param {string} gameType - Тип игры
 * @param {number} score - Счет
 */
export async function shareResults(gameType, score) {
    const gameNames = {
        number: "Память на числа",
        sequence: "Последовательности",
        chimp: "Тест шимпанзе",
        verbal: "Вербальная память",
        card: "Поиск пар",
    };

    const gameName = gameNames[gameType] || "Brain Memory";
    const message = `🧠 Я набрал ${score} очков в игре "${gameName}" в приложении Brain Memory! Попробуй побить мой рекорд!`;

    try {
        if (Platform.OS === "ios" || Platform.OS === "android") {
            // Используем нативный Share API
            const result = await Share.share({
                message,
                title: "Мой результат в Brain Memory",
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // iOS: поделились через конкретное приложение
                    console.log("Shared via:", result.activityType);
                } else {
                    // Android: просто поделились
                    console.log("Shared successfully");
                }
                return true;
            } else if (result.action === Share.dismissedAction) {
                // Пользователь отменил
                console.log("Share dismissed");
                return false;
            }
        } else {
            // Web: используем Web Share API или fallback
            if (navigator.share) {
                await navigator.share({
                    title: "Мой результат в Brain Memory",
                    text: message,
                });
                return true;
            } else {
                // Fallback: копируем в буфер обмена
                await navigator.clipboard.writeText(message);
                Alert.alert("Скопировано", "Результат скопирован в буфер обмена");
                return true;
            }
        }
    } catch (error) {
        console.warn("Share error:", error);
        return false;
    }
}

// ============================================================================
// PLATFORM CONFIG (Платформо-специфичная конфигурация)
// ============================================================================

/**
 * Получить конфигурацию для текущей платформы
 */
export function getPlatformSpecificConfig() {
    return {
        platform: Platform.OS,
        isIOS: Platform.OS === "ios",
        isAndroid: Platform.OS === "android",
        isWeb: Platform.OS === "web",
        version: Platform.Version,

        // Поддержка функций
        features: {
            haptics: Platform.OS === "ios" || Platform.OS === "android",
            notifications: Platform.OS === "ios" || Platform.OS === "android",
            share: true, // доступно на всех платформах
            vibration: Platform.OS === "android",
        },

        // Рекомендуемые настройки
        ui: {
            // iOS предпочитает более мягкие тени
            shadowOpacity: Platform.OS === "ios" ? 0.3 : 0.5,
            // Android предпочитает elevation
            useElevation: Platform.OS === "android",
            // Разные стили кнопок
            buttonStyle: Platform.OS === "ios" ? "rounded" : "material",
        },
    };
}

/**
 * Проверить доступность функции на текущей платформе
 */
export function isFeatureAvailable(featureName) {
    const config = getPlatformSpecificConfig();
    return config.features[featureName] || false;
}
