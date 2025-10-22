import React from "react";
import { Animated, Pressable } from "react-native";
import { click, play } from "../lib/sound";

export default function PressableScale({
  children,
  onPress,
  disabled = false,
  style,
  scaleTo = 0.96,
  duration = 70,
  soundKey = "click",
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

  const handlePress = async (e) => {
    if (disabled) return;

    // 1) Звук (если не отключён)
    try {
      if (soundKey) {
        if (soundKey === "click") await click();
        else await play(soundKey);
      }
    } catch {
      // молча игнорируем ошибки звука (особенно Web autoplay)
    }

    // 2) Действие кнопки (с поддержкой async)
    if (typeof onPress === "function") {
      try {
        const maybePromise = onPress(e);
        if (maybePromise && typeof maybePromise.then === "function") {
          await maybePromise;
        }
      } catch {
        // не роняем UI из-за исключений из onPress
      }
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
