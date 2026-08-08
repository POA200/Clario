import { SafeAreaView, ScrollView, View, ViewProps } from "react-native";

import { Colors } from "@/constants";

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  children: React.ReactNode;
}

export function Screen({ children, scroll = false, style }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.background,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
          }}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}
    >
      <View
        style={[
          {
            flex: 1,
            padding: 24,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
