import { View, Text, StyleSheet } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type SettingsStackParamList } from './SettingsHomeScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'HostDetail'>;

export default function HostDetailScreen({ route }: Props) {
  const { host } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{host.publicKey}</Text>
        <Text style={styles.meta}>
          {host.addresses.map((address) => address.address).join(', ')}
        </Text>
        <Text style={styles.meta}>{host.countryCode}</Text>
        <Text style={styles.meta}>{host.latitude}</Text>
        <Text style={styles.meta}>{host.longitude}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f8fa' },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d0d7de',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  title: { color: '#24292f', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  meta: { color: '#57606a', fontSize: 12 },
});
