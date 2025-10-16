// src/components/PressableScale.js
import React from "react";
import { Animated, Pressable } from "react-native";
import { click } from "../lib/sound";

export default function PressableScale({
  children,
  onPress,
  disabled = false,
  style,
  scaleTo = 0.96,
  duration = 70,
  ...rest
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.timing(scale, {
      toValue: disabled ? 1 : scaleTo,
      duration,
      useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.timing(scale, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();

  const handlePress = async () => {
    if (disabled) return;
    // Сначала — звуковой клик + лёгкий хэптик (если включены в настройках)
    await click().catch(() => {});
    // Затем — действие кнопки
    if (typeof onPress === "function") {
      await Promise.resolve(onPress());
    }
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={handlePress}
      style={style}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
