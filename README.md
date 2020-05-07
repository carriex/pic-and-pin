# pic-and-pin

This is a Landmark Recognition App built in partnership with Priceline as part of Cornell Tech's BigCo Studio.

[presentation](https://docs.google.com/presentation/d/1f7Tu5ge8foK5i5TMpLLPk4oG0f8JKeX6d00a60kTUKY/edit?usp=sharing).

## Install npm 
[Download](https://www.npmjs.com/get-npm)

## Install expo and dependencies
```bash 
npm install -g expo-cli
```

```bash
npm install -S firebase
npm install --save uuid
npm install --save google-map-react
expo install expo-image-picker
expo install expo-constants
expo install expo-permissions
npm install react-native-maps --save-exact
expo install expo-media-library
expo install react-native-view-shot
```

## Native Base
```bash
yarn add native-base --save
expo install expo-font

npm i --save-exact native-base@2.13.8
```

## Run the app 

### Fill out API keys 

```javascript
const Environment = {
  FIREBASE_API_KEY: //,
  FIREBASE_AUTH_DOMAIN: //,
  FIREBASE_DATABASE_URL: //,
  FIREBASE_PROJECT_ID: //,
  FIREBASE_STORAGE_BUCKET: //,
  FIREBASE_MESSAGING_SENDER_ID: //,
  GOOGLE_CLOUD_VISION_API_KEY: //,
  PRICELINE_SERVER: //,
  PRICELINE_REFID: //,
  PRICELINE_APIKEY: //,
  PRICELINE_HOTEL_PREFIX: //,
};
```


### Start the app

```bash
npm start 
```

