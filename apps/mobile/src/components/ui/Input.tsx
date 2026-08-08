import React, { useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { AppText } from "./Text";
import { Colors, Radius, Spacing } from "@/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="body" style={styles.label}>
          {label}
        </AppText>
      )}

      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={Colors.muted}
          style={[styles.input, style]}
        />

        {secureTextEntry && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
            {hidden ? (
              <EyeOff size={20} color={Colors.muted} />
            ) : (
              <Eye size={20} color={Colors.muted} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <AppText variant="small" style={styles.error}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="small" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: Spacing.lg,
  },

  label: {
    marginBottom: Spacing.sm,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
  },

  input: {
    flex: 1,
    height: 52,
    color: Colors.text,
  },

  inputError: {
    borderColor: Colors.error,
  },

  helper: {
    marginTop: Spacing.xs,
    color: Colors.muted,
  },

  error: {
    marginTop: Spacing.xs,
    color: Colors.error,
  },
});
