import { View } from "react-native";
import { Colors } from "@/constants";

export function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: Colors.border,
        width: "100%",
      }}
    />
  );
}
