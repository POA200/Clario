import { View, ViewProps } from "react-native";
import { Colors, Radius, Spacing } from "@/constants";

export function Card({ style, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.surface,
          borderRadius: Radius.lg,
          padding: Spacing.lg,
        },
        style,
      ]}
      {...props}
    />
  );
}
