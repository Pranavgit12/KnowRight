import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Jurisdiction } from "@/types/legal";

interface JurisdictionContextValue {
  jurisdiction: Jurisdiction;
  setJurisdiction: (value: Jurisdiction) => void;
}

const JurisdictionContext = createContext<JurisdictionContextValue | null>(null);

export function JurisdictionProvider({ children }: { children: ReactNode }) {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("India (Central)");
  const value = useMemo(
    () => ({ jurisdiction, setJurisdiction }),
    [jurisdiction],
  );

  return (
    <JurisdictionContext.Provider value={value}>
      {children}
    </JurisdictionContext.Provider>
  );
}

export function useJurisdiction() {
  const context = useContext(JurisdictionContext);
  if (!context) {
    throw new Error("useJurisdiction must be used within JurisdictionProvider");
  }
  return context;
}
