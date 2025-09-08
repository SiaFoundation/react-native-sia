import { View, StyleSheet } from 'react-native';
import { Hosts } from '../Hosts';
import { useSettings } from '../settingsContext';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type SettingsStackParamList } from './SettingsHomeScreen';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Hosts'>;

export default function HostsScreen({ navigation }: Props) {
  const { app } = useSettings();
  return (
    <View style={styles.flex1}>
      {app ? (
        <Hosts
          app={app}
          hideHeader
          onSelectHost={(host) => navigation.navigate('HostDetail', { host })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
