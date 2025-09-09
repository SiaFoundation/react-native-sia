import { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { App, setLogCallback } from 'react-native-sia';

const appSeed = new Uint8Array(32).fill(1);

export default function AppComponent() {
  const [logs, setLogs] = useState<string[]>([]);
  const [app, setApp] = useState<App | null>(null);

  const logClient = useCallback((message: string) => {
    setLogs((prev) => [...prev, `[client][info] ${message}`]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const _app = new App(
          'https://app.indexd.zeus.sia.dev',
          'Test',
          appSeed.buffer,
          'Test'
        );
        logClient('Connecting to app...');
        // // if more than 5 seconds abort the connection
        // const controller = new AbortController();
        // setTimeout(() => {
        //   logClient('Aborting connection');
        //   controller.abort();
        // }, 5000);
        await _app.connect();
        // await _app.connect({
        //   signal: controller.signal,
        // });
        setApp(_app);
        logClient('App connected');
      } catch (error) {
        logClient('Error creating app');
        logClient(error as string);
      }
    })();
  }, [logClient]);

  const [controller, setController] = useState<AbortController | null>();
  const handleUpload = () => {
    if (!app) return;
    const c = new AbortController();
    setController(c);
    logClient('starting upload...');
    // Detach from the press handler so UI stays responsive.
    (async () => {
      try {
        const upload = await app.upload(appSeed.buffer, 10, 20, {
          signal: c.signal,
        });
        for (let i = 0; i < 15; i++) {
          logClient(`Writing chunk ${i}...`);
          await upload.write(new Uint8Array(4194304).buffer);
          logClient(`Chunk ${i} written`);
          // Yield to the JS event loop to keep UI responsive.
          await new Promise<void>((r) => setImmediate(r));
        }
        logClient('Finishing upload...');
        await upload.finish();
        logClient('Upload finished');
      } catch (e) {
        logClient(`Upload error: ${String(e)}`);
      }
    })();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.heading}>Sia Rust SDK in React Native</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upload</Text>
            <Pressable style={styles.button} onPress={handleUpload}>
              <Text style={styles.buttonText}>Upload Bullshit</Text>
            </Pressable>
            <Pressable
              style={[styles.button, !controller && styles.buttonDisabled]}
              disabled={!controller}
              onPress={async () => {
                controller?.abort();
                logClient('Aborting upload');
                setController(null);
              }}
            >
              <Text style={styles.buttonText}>Abort</Text>
            </Pressable>
          </View>

          <View style={[styles.card, styles.cardGrow]}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Logs</Text>
              <Pressable onPress={() => setLogs([])} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.logBox}
              contentContainerStyle={styles.resultContent}
            >
              {logs.map((l, i) => (
                <Text key={String(i)} style={styles.logLine}>
                  {l}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0f19' },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e6edf3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9da7b3',
    marginTop: 12,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  cardGrow: {
    flex: 1,
    minHeight: 0,
  },
  input: {
    backgroundColor: '#0b1220',
    borderColor: '#334155',
    borderWidth: StyleSheet.hairlineWidth,
    color: '#e6edf3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#334155',
  },
  buttonText: {
    color: '#001019',
    fontWeight: '700',
  },
  resultBox: {
    maxHeight: 140,
    backgroundColor: '#0b1220',
    borderColor: '#334155',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  resultContent: {
    padding: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mono: {
    color: '#cbd5e1',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
  },
  logBox: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#0b1220',
    borderColor: '#334155',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  logLine: {
    color: '#9da7b3',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    marginBottom: 4,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1f2937',
  },
  clearButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
});
