"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { StoreSetup, getPublicStoreSetup } from "@/lib/api/storeSetup";

interface StoreSetupContextValue {
  storeSetup: StoreSetup | null;
  isLoading: boolean;
  refreshStoreSetup: () => Promise<void>;
}

const StoreSetupContext = createContext<StoreSetupContextValue>({
  storeSetup: null,
  isLoading: false,
  refreshStoreSetup: async () => {},
});

export function StoreSetupProvider({
  children,
  initialData = null,
}: {
  children: React.ReactNode;
  initialData?: StoreSetup | null;
}) {
  const [storeSetup, setStoreSetup] = useState<StoreSetup | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  const refreshStoreSetup = async () => {
    try {
      setIsLoading(true);
      const res = await getPublicStoreSetup();
      if (res.success && res.resources) {
        setStoreSetup(res.resources);
      }
    } catch (err) {
      console.error("Failed to load store setup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      refreshStoreSetup();
    }
  }, [initialData]);

  return (
    <StoreSetupContext.Provider value={{ storeSetup, isLoading, refreshStoreSetup }}>
      {children}
    </StoreSetupContext.Provider>
  );
}

export function useStoreSetup() {
  return useContext(StoreSetupContext);
}
