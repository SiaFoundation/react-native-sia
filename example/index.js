import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { initSia } from 'react-native-sia';

initSia().then(() => {
  AppRegistry.registerComponent(appName, () => App);
});
