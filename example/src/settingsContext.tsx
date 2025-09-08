import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Sdk } from 'react-native-sia';
import { Linking } from 'react-native';

type SettingsContextValue = {
  sdk: Sdk | null;
  log: (message: string) => void;
  logs: string[];
  indexerName: string;
  setIndexerName: (value: string) => void;
  indexerUrl: string;
  setIndexerUrl: (value: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

const appSeed = new Uint8Array(32).fill(2);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<string[]>([]);

  const log = useCallback((message: string) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}`;
    console.log(line);
    setLogs((prev) => [...prev, line]);
  }, []);

  const [indexerName, setIndexerName] = useState<string>('Test');
  const [indexerUrl, setIndexerUrl] = useState<string>(
    'https://app.indexd.zeus.sia.dev'
  );
  const app = useMemo<Sdk>(
    () => new Sdk(indexerUrl, appSeed.buffer),
    [indexerUrl]
  );

  useEffect(() => {
    (async () => {
      try {
        log('Connecting to app...');
        const isConnected = await app.connect();
        if (!isConnected) {
          const url = await app.requestAppConnection({
            name: 'Test',
            description: 'Test',
            serviceUrl: 'https://sia.storage',
            callbackUrl: 'siamobile://callback',
            logoUrl: 'https://sia.storage/logo.png',
          });

          // open url in browser
          Linking.openURL(url.responseUrl);

          const isAuthorized = await app.waitForConnect(url);
          if (!isAuthorized) {
            throw new Error('App not authorized');
          }
        }
        log('App connected');
      } catch (error) {
        log('Error creating app');
        log(error as string);
      }
    })();

    return () => {};
  }, [log, app]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      sdk: app ?? null,
      log,
      logs,
      indexerName,
      setIndexerName,
      indexerUrl,
      setIndexerUrl,
    }),
    [app, log, logs, indexerName, indexerUrl]
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
