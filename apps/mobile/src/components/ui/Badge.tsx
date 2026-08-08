import { View } from "react-native";
import { AppText } from "./Text";
import { Colors } from "@/constants";

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <AppText
        style={{
          color: "#fff",
        }}
        variant="small"
      >
        {label}
      </AppText>
    </View>
  );
}
