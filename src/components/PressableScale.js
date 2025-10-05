// src/components/PressableScale.js
import React from "react";
import { Animated, Pressable } from "react-native";

export default function PressableScale({
  children,
  onPress,
  disabled,
  style,
  scaleTo = 0.96,
  duration = 70,
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.timing(scale, { toValue: scaleTo, duration, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.timing(scale, { toValue: 1, duration, useNativeDriver: true }).start();

  return (
    <Pressable
      disabled={disabled}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}
