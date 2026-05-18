import { useCallback, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AppKey,
  Builder,
  PinnedObject,
  generateRecoveryPhrase,
  type Reader,
  type Sdk,
} from 'react-native-sia';

const INDEXER_URL = 'https://sia.storage';

const APP_META = {
  // A 32-byte identifier unique to your app. Not secret, but should be stable.
  id: new Uint8Array(32).fill(2).buffer as ArrayBuffer,
  name: 'Sia Example',
  description: 'A minimal react-native-sia example',
  serviceUrl: 'https://example.sia.tech',
  callbackUrl: 'siaexample://callback',
  logoUrl: undefined,
};

// In a real app, store this in the Keychain / Keystore (e.g. via
// react-native-keychain or expo-secure-store). For this example we keep
// it in module scope so the demo can reconnect during a single session.
let savedAppKey: ArrayBuffer | null = null;

function bufferReader(data: ArrayBuffer, chunkSize = 256 * 1024): Reader {
  let offset = 0;
  return {
    async read() {
      if (offset >= data.byteLength) return new ArrayBuffer(0);
      const end = Math.min(offset + chunkSize, data.byteLength);
      const chunk = data.slice(offset, end);
      offset = end;
      return chunk;
    },
  };
}

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [busy, setBusy] = useState(false);
  const lastObjectId = useRef<string | null>(null);

  const log = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const connect = useCallback(async () => {
    setBusy(true);
    try {
      const builder = new Builder(INDEXER_URL, APP_META);

      if (savedAppKey) {
        log('Reconnecting with saved AppKey…');
        const existing = await builder.connected(new AppKey(savedAppKey));
        if (existing) {
          setSdk(existing);
          log('Connected.');
          return;
        }
        log('Saved AppKey not authorized; starting fresh approval flow.');
      }

      const phrase = generateRecoveryPhrase();
      log(`Recovery phrase: ${phrase}`);

      await builder.requestConnection();
      const url = builder.responseUrl();
      log(`Open in browser to approve: ${url}`);
      await Linking.openURL(url);

      await builder.waitForApproval();
      const next = await builder.register(phrase);

      savedAppKey = next.appKey().export_();
      setSdk(next);
      log('Registered and connected.');
    } catch (e) {
      log(`Connect failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [log]);

  const upload = useCallback(async () => {
    if (!sdk) return;
    setBusy(true);
    try {
      const data = new TextEncoder().encode(
        `hello from react-native-sia at ${new Date().toISOString()}`
      ).buffer as ArrayBuffer;
      log(`Uploading ${data.byteLength} bytes…`);
      const object = await sdk.upload(
        new PinnedObject(),
        bufferReader(data),
        {}
      );
      await sdk.pinObject(object);
      lastObjectId.current = object.id();
      log(`Pinned: ${object.id()}`);
    } catch (e) {
      log(`Upload failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [sdk, log]);

  const download = useCallback(async () => {
    if (!sdk || !lastObjectId.current) return;
    setBusy(true);
    try {
      const object = await sdk.object(lastObjectId.current);
      const dl = sdk.download(object, {});
      const chunks: ArrayBuffer[] = [];
      while (true) {
        const chunk = await dl.read();
        if (chunk.byteLength === 0) break;
        chunks.push(chunk);
      }
      const total = chunks.reduce((n, c) => n + c.byteLength, 0);
      const buf = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        buf.set(new Uint8Array(c), offset);
        offset += c.byteLength;
      }
      log(`Downloaded: ${new TextDecoder().decode(buf)}`);
    } catch (e) {
      log(`Download failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [sdk, log]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>react-native-sia</Text>
      <View style={styles.row}>
        <Button label="Connect" onPress={connect} disabled={busy || !!sdk} />
        <Button label="Upload" onPress={upload} disabled={busy || !sdk} />
        <Button
          label="Download"
          onPress={download}
          disabled={busy || !sdk || !lastObjectId.current}
        />
      </View>
      <ScrollView
        style={styles.logs}
        contentContainerStyle={styles.logsContent}
      >
        {logs.map((line, i) => (
          <Text key={i} style={styles.logLine}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

function Button({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0969da',
    borderRadius: 6,
  },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { backgroundColor: '#8c959f' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
  logs: {
    flex: 1,
    borderColor: '#d0d7de',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
  },
  logsContent: { padding: 10 },
  logLine: { fontFamily: 'Menlo', fontSize: 11, color: '#24292f' },
});
