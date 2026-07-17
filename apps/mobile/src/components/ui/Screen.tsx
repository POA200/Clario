import { ReactNode } from "react";
import { SafeAreaView, ScrollView, View, type ViewStyle } from "react-native";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, scroll = false, style }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
          }}
        >
          <View style={style}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}
