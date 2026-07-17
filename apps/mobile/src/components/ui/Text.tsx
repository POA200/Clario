import { Text, type TextProps } from "react-native";
import { Typography } from "@/constants";

type Variant = "display" | "h1" | "h2" | "h3" | "body" | "small" | "caption";

interface AppTextProps extends TextProps {
  variant?: Variant;
}

const sizes = {
  display: Typography.display,
  h1: Typography.h1,
  h2: Typography.h2,
  h3: Typography.h3,
  body: Typography.body,
  small: Typography.small,
  caption: Typography.caption,
};

export function AppText({ variant = "body", style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: sizes[variant],
          color: "#000001",
        },
        style,
      ]}
    />
  );
}
