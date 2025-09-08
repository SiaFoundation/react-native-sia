import React, { useState } from 'react';
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ToastProvider } from './Toast';
import { type UploadedItem } from './Upload';
import { type FeedStackParamList } from './navigation/types';
import HomeScreen from './screens/HomeScreen';
import PhotoDetailScreen from './screens/PhotoDetailScreen';
import SettingsHomeScreen, {
  type SettingsStackParamList,
} from './screens/SettingsHomeScreen';
import HostsScreen from './screens/HostsScreen';
import HostDetailScreen from './screens/HostDetailScreen';
import IndexerScreen from './screens/IndexerScreen';
import { HomeIcon, SettingsIcon, ListIcon } from 'lucide-react-native';
import { SettingsProvider, useSettings } from './settingsContext';
import { LogView } from './LogView';

const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator();

function HomeTabIcon({ color, size }: { color: string; size: number }) {
  return <HomeIcon color={color} size={size} />;
}

function SettingsTabIcon({ color, size }: { color: string; size: number }) {
  return <SettingsIcon color={color} size={size} />;
}

function LogsTabIcon({ color, size }: { color: string; size: number }) {
  return <ListIcon color={color} size={size} />;
}

function LogsTabScreen() {
  const { logs } = useSettings();
  return <LogView logs={logs} />;
}

function FeedStackNavigator({
  uploads,
  setUploads,
}: {
  uploads: UploadedItem[];
  setUploads: React.Dispatch<React.SetStateAction<UploadedItem[]>>;
}) {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen name="Home" options={{ headerShown: false }}>
        {() => <HomeScreen uploads={uploads} setUploads={setUploads} />}
      </FeedStack.Screen>
      <FeedStack.Screen
        name="PhotoDetail"
        component={PhotoDetailScreen}
        options={{ title: 'Photo' }}
      />
    </FeedStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="Hosts"
        component={HostsScreen}
        options={{ title: 'Hosts' }}
      />
      <SettingsStack.Screen
        name="HostDetail"
        component={HostDetailScreen}
        options={{ title: 'Host' }}
      />
      <SettingsStack.Screen
        name="Indexer"
        component={IndexerScreen}
        options={{ title: 'Indexer' }}
      />
    </SettingsStack.Navigator>
  );
}

export default function AppComponent() {
  const [uploads, setUploads] = useState<UploadedItem[]>([]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle={Platform.select({
            ios: 'dark-content',
            android: 'dark-content',
            default: 'dark-content',
          })}
        />
        <SettingsProvider>
          <ToastProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarStyle: {
                    height: 49,
                    paddingBottom: 4,
                    paddingTop: 4,
                  },
                  tabBarLabelStyle: { marginBottom: 0 },
                  tabBarItemStyle: { paddingVertical: 0 },
                }}
              >
                <Tab.Screen
                  name="FeedTab"
                  options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: HomeTabIcon,
                  }}
                >
                  {() => (
                    <FeedStackNavigator
                      uploads={uploads}
                      setUploads={setUploads}
                    />
                  )}
                </Tab.Screen>
                <Tab.Screen
                  name="LogsTab"
                  options={{
                    tabBarLabel: 'Logs',
                    tabBarIcon: LogsTabIcon,
                  }}
                  component={LogsTabScreen}
                />
                <Tab.Screen
                  name="SettingsTab"
                  options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: SettingsTabIcon,
                  }}
                >
                  {() => <SettingsStackNavigator />}
                </Tab.Screen>
              </Tab.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </SettingsProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
});
