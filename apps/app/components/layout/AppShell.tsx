import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto min-h-dvh w-full max-w-md pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
