"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type MobileNavMode = "sidebar" | "bottom";

type NavigationContextType = {
  mobileNav: MobileNavMode;
  setMobileNav: (mode: MobileNavMode) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "clario_mobile_nav";

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNav, setMobileNavState] = useState<MobileNavMode>("bottom");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "sidebar" || saved === "bottom") {
        setMobileNavState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setMobileNav = (mode: MobileNavMode) => {
    setMobileNavState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore
    }
  };

  return (
    <NavigationContext.Provider value={{ mobileNav, setMobileNav }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    return {
      mobileNav: "bottom" as MobileNavMode,
      setMobileNav: (mode: MobileNavMode) => {
        try {
          localStorage.setItem(STORAGE_KEY, mode);
        } catch {}
      },
    };
  }
  return context;
}
