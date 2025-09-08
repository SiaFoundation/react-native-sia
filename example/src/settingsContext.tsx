import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { type App } from 'react-native-sia';
import { useApp } from './useApp';

type SettingsContextValue = {
  app: App | null;
  log: (message: string) => void;
  indexerName: string;
  setIndexerName: (value: string) => void;
  indexerUrl: string;
  setIndexerUrl: (value: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const log = useCallback((message: string) => {
    console.log(message);
  }, []);

  const { app } = useApp({ log });
  const [indexerName, setIndexerName] = useState<string>('Test');
  const [indexerUrl, setIndexerUrl] = useState<string>(
    'https://app.indexd.zeus.sia.dev'
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      app: app ?? null,
      log,
      indexerName,
      setIndexerName,
      indexerUrl,
      setIndexerUrl,
    }),
    [app, log, indexerName, indexerUrl]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('SettingsContext is not available.');
  return ctx;
}
