import { useCallback, useRef, type ComponentRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PlusIcon } from 'lucide-react-native';
import { type UploadedItem, pickAndUploadImages } from '../Upload';
import { Gallery } from '../Gallery';
import { useSettings } from '../settingsContext';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type FeedStackParamList } from '../navigation/types';

type Props = {
  uploads: UploadedItem[];
  setUploads: React.Dispatch<React.SetStateAction<UploadedItem[]>>;
};

export default function HomeScreen({ uploads, setUploads }: Props) {
  const headerRef = useRef<ComponentRef<typeof View> | null>(null);
  const { sdk: app, log } = useSettings();
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();

  const handleUpload = useCallback(async () => {
    if (!app) return;
    try {
      const finalItems = await pickAndUploadImages({
        app,
        log,
        onPicked: (temps) => setUploads((prev) => [...temps, ...prev]),
        onProgress: (id, progress) =>
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, progress } : u))
          ),
      });
      if (finalItems.length > 0) {
        setUploads((prev) =>
          prev.map((it) => finalItems.find((fi) => fi.id === it.id) ?? it)
        );
      }
    } catch (e) {
      log(`Upload flow error: ${String(e)}`);
    }
  }, [app, log, setUploads]);

  const handleOpenDetail = useCallback(
    (item: UploadedItem) => {
      navigation.navigate('PhotoDetail', { item });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header} ref={headerRef}>
        <Text style={styles.headerTitle}>Home</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleUpload}
          style={styles.headerIcon}
        >
          <PlusIcon color="#0969da" size={22} />
        </Pressable>
      </View>
      {uploads.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No uploads yet</Text>
          <Text style={styles.emptyText}>
            Tap the plus to upload a photo from your library.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleUpload}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Upload photo</Text>
          </Pressable>
        </View>
      ) : (
        <Gallery items={uploads} onPressItem={handleOpenDetail} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 44,
    paddingHorizontal: 16,
    borderBottomColor: '#d0d7de',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: { color: '#24292f', fontSize: 16, fontWeight: '600' },
  headerIcon: { marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 8 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyTitle: { color: '#24292f', fontWeight: '700' },
  emptyText: { color: '#57606a', textAlign: 'center', marginBottom: 8 },
  primaryButton: {
    backgroundColor: '#0969da',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700' },
});
