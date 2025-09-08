import { useEffect, useMemo } from 'react';
import { App } from 'react-native-sia';

const appSeed = new Uint8Array(32).fill(1);

export function useApp({ log }: { log: (message: string) => void }) {
  const app = useMemo<App>(
    () =>
      new App(
        'https://app.indexd.zeus.sia.dev',
        'Test',
        appSeed.buffer,
        'Test'
      ),
    []
  );

  useEffect(() => {
    (async () => {
      try {
        log('Connecting to app...');
        await app.connect();
        log('App connected');
      } catch (error) {
        log('Error creating app');
        log(error as string);
      }
    })();

    return () => {};
  }, [log, app]);

  return { app };
}
