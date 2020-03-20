//environment.js

import Constants from 'expo-constants';
var environments = {
  staging: {
    FIREBASE_API_KEY: 'AIzaSyAmmtXzyytzo_5YuV1NVRvOx2QsHr2lpvo',
    FIREBASE_AUTH_DOMAIN: 'pic-and-pin.firebaseapp.comXXX',
    FIREBASE_DATABASE_URL: 'https://pic-and-pin.firebaseio.com/',
    FIREBASE_PROJECT_ID: 'pic-and-pin',
    FIREBASE_STORAGE_BUCKET: 'pic-and-pin.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '240232545232',
    GOOGLE_CLOUD_VISION_API_KEY: 'AIzaSyA1Ek0Sj0m3llWAGQCI6bAmOL4x8FO64e4'
  },
  production: {
    // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
  }
};

// function getReleaseChannel() {
//   let releaseChannel = Constants.manifest.releaseChannel;
//   if (releaseChannel === undefined) {
//     return 'staging';
//   } else if (releaseChannel === 'staging') {
//     return 'staging';
//   } else {
//     return 'staging';
//   }
// }
function getEnvironment(env) {
  console.log('Release Channel: ', 'staging');
  return environments[env];
}
var Environment = getEnvironment('staging');
export default Environment;