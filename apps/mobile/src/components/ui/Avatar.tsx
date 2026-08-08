import { Image } from "react-native";

interface AvatarProps {
  uri: string;
  size?: number;
}

export function Avatar({ uri, size = 48 }: AvatarProps) {
  return (
    <Image
      source={{ uri }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
