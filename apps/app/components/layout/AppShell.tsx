import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto min-h-dvh w-full max-w-md pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
