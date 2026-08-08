import { Screen } from "@/components/ui/Screen";
import { AppText } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <Screen>
      <AppText variant="h1">Welcome to Clario</AppText>

      <Input label="Email" placeholder="Enter your email" />

      <Input
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
      />

      <Button title="Continue" onPress={() => {}} />
    </Screen>
  );
}
