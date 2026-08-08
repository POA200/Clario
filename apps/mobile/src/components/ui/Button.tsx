import React from "react";
import {
  Pressable,
  PressableProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { AppText } from "./Text";
import { Colors, Radius, Spacing } from "@/constants";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle | ViewStyle[];
}

const heights = {
  sm: 40,
  md: 48,
  lg: 56,
};

export function Button({
  title,
  loading = false,
  variant = "primary",
  size = "md",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        {
          height: heights[size],
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.primary : "#fff"}
        />
      ) : (
        <AppText variant="body" style={[styles.text, textStyles[variant]]}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
  },

  primary: {
    backgroundColor: Colors.primary,
  },

  secondary: {
    backgroundColor: Colors.surface,
  },

  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  ghost: {
    backgroundColor: "transparent",
  },

  danger: {
    backgroundColor: Colors.error,
  },

  text: {
    fontWeight: "600",
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: "#fff",
  },

  secondary: {
    color: Colors.text,
  },

  outline: {
    color: Colors.primary,
  },

  ghost: {
    color: Colors.primary,
  },

  danger: {
    color: "#fff",
  },
});
