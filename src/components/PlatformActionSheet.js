// src/components/PlatformActionSheet.js
import React from "react";
import { Platform, Modal, View, Text, StyleSheet, Pressable, ActionSheetIOS } from "react-native";
import { colors } from "../theme/colors";

/**
 * Платформо-специфичный ActionSheet компонент
 * iOS: использует нативный ActionSheetIOS
 * Android: кастомный Modal с Material Design стилем
 */

export default function PlatformActionSheet({ visible, onClose, options, title, message }) {
    React.useEffect(() => {
        if (visible && Platform.OS === "ios") {
            // iOS: показываем нативный ActionSheet
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    title,
                    message,
                    options: [...options.map(o => o.text), "Отмена"],
                    cancelButtonIndex: options.length,
                    destructiveButtonIndex: options.findIndex(o => o.destructive),
                },
                (buttonIndex) => {
                    if (buttonIndex < options.length) {
                        options[buttonIndex].onPress?.();
                    }
                    onClose();
                }
            );
        }
    }, [visible, options, title, message, onClose]);

    if (Platform.OS === "ios") {
        // На iOS возвращаем null, т.к. используем нативный компонент
        return null;
    }

    // Android: кастомный Modal с Material Design стилем
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.container}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={styles.sheet}>
                            {title && <Text style={styles.title}>{title}</Text>}
                            {message && <Text style={styles.message}>{message}</Text>}

                            <View style={styles.optionsContainer}>
                                {options.map((option, index) => (
                                    <Pressable
                                        key={index}
                                        style={({ pressed }) => [
                                            styles.option,
                                            option.destructive && styles.optionDestructive,
                                            pressed && styles.optionPressed,
                                        ]}
                                        onPress={() => {
                                            option.onPress?.();
                                            onClose();
                                        }}
                                        android_ripple={{ color: "rgba(255,255,255,0.1)" }}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                option.destructive && styles.optionTextDestructive,
                                            ]}
                                        >
                                            {option.text}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.cancelButton,
                                    pressed && styles.cancelButtonPressed,
                                ]}
                                onPress={onClose}
                                android_ripple={{ color: "rgba(255,255,255,0.1)" }}
                            >
                                <Text style={styles.cancelText}>Отмена</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        // Material Design elevation
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    message: {
        fontSize: 14,
        color: colors.subtext,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    optionsContainer: {
        marginBottom: 8,
    },
    option: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    optionPressed: {
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    optionDestructive: {
        backgroundColor: "rgba(239,68,68,0.1)",
    },
    optionText: {
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
    },
    optionTextDestructive: {
        color: "#ef4444",
        fontWeight: "600",
    },
    cancelButton: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    cancelButtonPressed: {
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    cancelText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.primary,
        textAlign: "center",
    },
});
