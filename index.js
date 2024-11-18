/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
if (module.exports = require('./App').default) {
    AppRegistry.registerComponent('main', () => App);
}
