import 'react-native-get-random-values';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import Hotels from './screens/Hotels'

/* TODO: set up environment variables */
// const Environment = {
//   FIREBASE_API_KEY: ,
//   FIREBASE_AUTH_DOMAIN: ,
//   FIREBASE_DATABASE_URL: ,
//   FIREBASE_PROJECT_ID: ,
//   FIREBASE_STORAGE_BUCKET: ,
//   FIREBASE_MESSAGING_SENDER_ID: ,
//   GOOGLE_CLOUD_VISION_API_KEY: ,
//   PRICELINE_SERVER: ,
//   PRICELINE_REFID: ,
//   PRICELINE_APIKEY: ,
//   PRICELINE_HOTEL_PREFIX: ,
// };

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: Environment['FIREBASE_API_KEY'],
    authDomain: Environment['FIREBASE_AUTH_DOMAIN'],
    databaseURL: Environment['FIREBASE_DATABASE_URL'],
    projectId: Environment['FIREBASE_PROJECT_ID'],
    storageBucket: Environment['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: Environment['FIREBASE_MESSAGING_SENDER_ID'],
  });
}

const Stack = createStackNavigator();


export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    googleResponse: null,
    screenshot: null
  };

  async componentDidMount() {
    document.title = "Pic and Pin";
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);

    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Hotels" component={Hotels} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>

    )
  }

}

