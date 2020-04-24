//https://blog.jscrambler.com/create-a-react-native-image-recognition-app-with-google-vision-api/ 
import 'react-native-get-random-values';
import React from 'react';
import {
  ActivityIndicator,
  Clipboard,
  FlatList,
  Image,
  Share,
  StyleSheet,
  ScrollView,
  View,
  Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { v4 as uuidv4 } from 'uuid';
import * as firebase from 'firebase';
import { Container, Text, Button, Header, Left, Body, Right, Icon, Title, Content } from 'native-base';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import SimpleMap from './simpleMap'

import { captureRef } from 'react-native-view-shot';
import { takeSnapshotAsync } from 'expo';
import * as MediaLibrary from 'expo-media-library';


// import Axios from 'axios';
// import { Map, GoogleApiWrapper } from 'google-maps-react';
// import Environment from './config/environment';
// import firebase from './config/firebase';

const Environment = {
  FIREBASE_API_KEY: 'AIzaSyAmmtXzyytzo_5YuV1NVRvOx2QsHr2lpvo',
  FIREBASE_AUTH_DOMAIN: 'pic-and-pin.firebaseapp.com',
  FIREBASE_DATABASE_URL: 'https://pic-and-pin.firebaseio.com/',
  FIREBASE_PROJECT_ID: 'pic-and-pin',
  FIREBASE_STORAGE_BUCKET: 'pic-and-pin.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: '240232545232',
  GOOGLE_CLOUD_VISION_API_KEY: 'AIzaSyA1Ek0Sj0m3llWAGQCI6bAmOL4x8FO64e4'
};
if (!firebase.apps.length){
firebase.initializeApp({
  apiKey: Environment['FIREBASE_API_KEY'],
  authDomain: Environment['FIREBASE_AUTH_DOMAIN'],
  databaseURL: Environment['FIREBASE_DATABASE_URL'],
  projectId: Environment['FIREBASE_PROJECT_ID'],
  storageBucket: Environment['FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: Environment['FIREBASE_MESSAGING_SENDER_ID'],
  appId: "1:240232545232:web:ae295bead95956b8bed7d5",
  measurementId: "G-VVN9BF9ZKQ"
});}



export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    googleResponse: null,
    screenshot: null
  };


  async componentDidMount() {
    document.title = "Pic and Pin"
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
    
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });
  }

  render() {
    let { image } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <Container>
            <Header>
              <Left>
              </Left>
              <Body>
                <Title style={{ textAlign:"center" }}>Pic and Pin</Title>
              </Body>
              <Right>
              <Button transparent>
                <Icon name='menu' />
              </Button>
              </Right>
            </Header>

          </Container>

          <View style={styles.helpContainer}>
            <Button rounded info onPress={this._pickImage}>
              <Text> Pick an image from camera roll </Text>
            </Button>
   
            {/* <Button onPress={this._takePhoto} title="Take a photo" /> */}
            {this.state.googleResponse && (
              <FlatList
                data={this.state.googleResponse.responses[0].labelAnnotations}
                extraData={this.state}
                keyExtractor={this._keyExtractor}
                renderItem={({ item }) => <Text style={styles.getStartedText}>Item: {item.description}</Text>}
              />
            )}
            {this._maybeRenderImage()}
            {this._maybeRenderUploadingOverlay()}
          </View>
        </ScrollView>
      </View>
    );
  }

  organize = array => {
    return array.map(function (item, i) {
      return (
        <View key={i}>
          <Text>{item}</Text>
        </View>
      );
    });
  };

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.0)',
              alignItems: 'center',
              justifyContent: 'center'
            }
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image, googleResponse } = this.state;
    if (!image) {
      return;
    }

  //   if (googleResponse){
  //   let lag =  this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng["latitude"];
  //   let lon =  this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng["longitude"];
  //   console.log(lag, lon);
  //   Axios.get('https://api-sandbox.rezserver.com/api/hotel/getExpress.Results',
  //   { params: {refid: '1346',
  //   api_key: '21e1fb57679db2489ba1c9f8c2c79e8c',
  //   format: 'json2',
  //   latitude: lag,
  //   longitude: lon,
  //   check_in: '2020-05-01',
  //   check_out: '2020-05-03'
  // }}).then(function(response){
  //     console.log(response);
  //   }).catch(function (error) {
  //     // handle error
  //     console.log(error);
  //   });
  // }


    return (
      <View
        style={{
          marginTop: 20,
          width: 250,
          borderRadius: 3,
          elevation: 2
        }}
      >

        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: 'rgba(0,0,0,1)',
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: 'hidden'
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={{ paddingVertical: 10, paddingHorizontal: 10 }}
        />
        
        <Button rounded info onPress={this.submitToGoogle} style={{ textAlign:"center" }}>
          <Text>Locate!</Text>
        </Button>


        {googleResponse && 
          (<SimpleMap center={{ lat: this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng['latitude'],
                                          lng: this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng['longitude']}}
                      description={this.state.googleResponse.responses[0].landmarkAnnotations[0].description}
/>)}


{googleResponse && 
          (<Button rounded info onPress={this._saveToCameraRollAsync} style={{ textAlign:"center" }}>
          <Text>Take a snapshot</Text>
          </Button>
        )}

{googleResponse && 
          (<Button rounded info onPress={this._shareToIns} style={{ textAlign:"center" }}>
          <Text>Share snapshot to Ins</Text>
          </Button>
        )}



        
      </View>
    );
  };

  _keyExtractor = (item, index) => item.id;

  _renderItem = item => {
    <Text>response: {JSON.stringify(item)}</Text>;
  };

  _saveToCameraRollAsync = async () => {
    try {
      const testResult = await captureRef(this._container, {
        format: "jpg",
        quality: 0.8
      });
      console.log("testResult", testResult);
      //const saveresult = CameraRoll.saveToCameraRoll(testResult, 'photo');
      const saveResult = await MediaLibrary.createAssetAsync(testResult); // screenshot saved in album
      console.log("saveResult", saveResult); // object uri?
      this.setState({screenshot: saveResult});
    } catch (e) {
      console.log(e);
    }
  }; 

  _shareToIns = async () => {
    //let image = await ImagePicker.launchImageLibraryAsync();
    //let { origURL } = image;
    let encodedURL = encodeURIComponent(this.state.screen);
    let instagramURL = `instagram://library?AssetPath=${encodedURL}`;
    Linking.openURL(instagramURL);
  };

  _share = () => {
    Share.share({
      message: JSON.stringify(this.state.googleResponse.responses),
      title: 'Check it out',
      url: this.state.image
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied to clipboard');
  };

  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {
        const uploadUrl = await uploadImageAsync(pickerResult.uri);
        this.setState({ image: uploadUrl });
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({ uploading: false });
    }
  };

  submitToGoogle = async () => {
    try {
      this.setState({ uploading: true });
      let { image } = this.state;
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: 'LANDMARK_DETECTION', maxResults: 5 },
            ],
            image: {
              source: {
                imageUri: image
              }
            }
          }
        ]
      });
      let response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=' +
        Environment['GOOGLE_CLOUD_VISION_API_KEY'],
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: body
        }
      );
      let responseJson = await response.json();
      this.setState({
        googleResponse: responseJson,
        uploading: false
      });
    } catch (error) {
      console.log(error);
    }
  };
}

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });


  const ref = firebase
    .storage()
    .ref()
  //.child(uuidv4());
  .child(Math.floor(Math.random() * 100000).toString());

  // upload to firebase 
  const snapshot = await ref.put(blob);

  // const url = await snapshot.ref.getDownloadURL();
  // console.log(url);
  // return url;
  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  contentContainer: {
    paddingTop: 30
  },

  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },

  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center'
  },

  helpContainer: {
    marginTop: 50,
    alignItems: 'center',
    //color: '#007aff'
  }
});
