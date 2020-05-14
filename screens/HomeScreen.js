//https://blog.jscrambler.com/create-a-react-native-image-recognition-app-with-google-vision-api/ 
import 'react-native-get-random-values';
import React, { Component } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Image,
  Share,
  StyleSheet,
  ScrollView,
  View,
  Linking,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import {
  Container,
  Text,
  Button,
  Header,
  Left,
  Body,
  Right,
  Title,
} from 'native-base';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
//https://codeburst.io/react-native-google-map-with-react-native-maps-572e3d3eee14
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';




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


export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    image: null,
    uploading: false,
    googleResponse: null,
    screenshot: null,
    showPickButton: true
  };

  async componentDidMount() {
    document.title = "Pic and Pin";
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
    const { navigate } = this.props.navigation;

    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });
  }

  render() {
    let { image } = this.state;
    const scrollEnabled = true;
    return (
      <View style={styles.container}
        ref={view => {
          this._container = view;
        }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={scrollEnabled}>
          <Header>
            <Left>
            </Left>
            <Body>
              <Title style={{ textAlign: "center" }}>Pic and Pin</Title>
            </Body>
            <Right>
            </Right>
          </Header>

          <View style={styles.helpContainer}>
            {this.state.showPickButton &&
              <Button rounded info onPress={this._pickImage}
                style={styles.pickbutton}
              >
                <Text style={styles.buttontext}> Select image from camera roll </Text>
              </Button>}
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

  _maybeRenderHotel = () => {
    console.log("Here ???")
    console.log(this.props.navigation)
    return (
      <View>
        <Hotel hotels={this.state.hotels} navigation={this.props.navigation} />
        <Container>
          <Text style={{ color: 'white' }}>pic and pin</Text></Container>
      </View>
    )
  }

  _maybeRenderImage = () => {
    let { image, googleResponse, hotels } = this.state;
    if (!image) {
      return;
    }

    return (
      <SafeAreaView>
        <View
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image source={{ uri: image }} style={styles.imageStyle} />
          <Button rounded info onPress={this.submitToGoogle} style={{ textAlign: "center", width: 200 }}>
            <Text style={styles.buttontext}>Locate</Text>
          </Button>
        </View>


        {<View>
          {googleResponse && (
            <MapView provider={PROVIDER_GOOGLE}
              style={styles.mapContainer}
              initialRegion={{
                latitude: this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng['latitude'],
                longitude: this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng['longitude'],
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }} />
          )}
        </View>}

        {googleResponse &&
          (<Text style={{
            textAlign: "center",
            fontSize: 20,
            marginTop: 20,
            marginBottom: 20,
            fontWeight: '600'
          }}>
            {this.state.googleResponse.responses[0].landmarkAnnotations[0].description}
          </Text>)}

        {googleResponse &&
          (<Button rounded info onPress={this._shareToIns} style={{ textAlign: "center", width: 195, marginLeft: 5 }}>
            <Text style={styles.buttontext}>Share to Instagram</Text>
          </Button>
          )}

        {hotels && this._maybeRenderHotel()}
      </SafeAreaView>
    );
  };

  _keyExtractor = (item, index) => item.id;

  _renderItem = item => {
    <Text>response: {JSON.stringify(item)}</Text>;
  };

  _shareToIns = async () => {
    try {
      const testResult = await captureRef(this._container, {
        format: "jpg",
        quality: 0.8
      });
      console.log("testResult", testResult);
      //const saveresult = CameraRoll.saveToCameraRoll(testResult, 'photo');
      const saveResult = await MediaLibrary.createAssetAsync(testResult); // screenshot saved in album
      console.log("saveResult", saveResult); // object uri?
      this.setState({ screenshot: saveResult });
    } catch (e) {
      console.log(e);
    }
    let encodedURL = encodeURIComponent(this.state.screenshot);
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



  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this.setState({ showPickButton: false });
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

      var responseJson = await response.json();
      this.setState({
        googleResponse: responseJson,
        uploading: false
      });
    } catch (error) {
      console.log(error);
    }

    try {
      // get hotel info with the lag and long
      console.log('Fetching hotel info...')
      var priceline_response = await getHotelInfoAsync(responseJson);
      ;
      this.setState({
        hotels: priceline_response['getHotelExpress.Results']['results']['hotel_data']

      });
    } catch (error) {
      console.log(error);
    }

  };

}

/****************************
*     helper functions      *
*****************************/

function Hotel(props) {
  //   const {navigate} = this.props.navigation;
  const content = props.hotels.map((hotel) =>

    <Text style={styles.hotelText} key={hotel.id} onPress={() => Linking.openURL(Environment['PRICELINE_HOTEL_PREFIX'] + hotel.id_t.toString())}>
      {hotel.name}
    </Text>)
  return (
    <View>
      <Button rounded info onPress={() => props.navigation.navigate('Hotels', { HotelData: props.hotels })} style={{ textAlign: "center", width: 195, marginLeft: 200, marginTop: -45 }}>
        <Text style={styles.buttontext}>Show nearby hotels</Text>
      </Button>
    </View>
  );
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

  // return url 
  return await snapshot.ref.getDownloadURL();
}

function convert_date(date) {
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();
  date = yyyy + '-' + mm + '-' + dd;
  return date
}

async function getHotelInfoAsync(response) {
  // send request to priceline and get response 
  const lag = response.responses[0].landmarkAnnotations[0].locations[0].latLng["latitude"];
  const lon = response.responses[0].landmarkAnnotations[0].locations[0].latLng["longitude"];
  var checkin = new Date();
  var checkout = new Date(checkin);
  checkout.setDate(checkin.getDate() + 2);
  checkin = convert_date(checkin);
  checkout = convert_date(checkout);
  console.log(checkin, checkout);
  console.log(lag, lon);

  var server_url = new URL(Environment['PRICELINE_SERVER']),
    url = new URL('getExpress.Results', server_url),
    // to by pass cors error: https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors/43268098
    // no need for native app
    proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    params = {
      refid: Environment['PRICELINE_REFID'],
      api_key: Environment['PRICELINE_APIKEY'],
      format: 'json2',
      sort_by: 'gs',
      limit: 10,
      latitude: lag,
      longitude: lon,
      check_in: checkin,
      check_out: checkout
    };
  console.log("url");
  console.log(url);

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  console.log(url);

  let res = await fetch(url);

  return await res.json();
}

/****************************
*     style sheets          *
*****************************/


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10,
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

  mapContainer: {
    width: 400,
    height: 250,
    backgroundColor: '#fff',
    paddingBottom: 10,
    marginBottom: 20,
    marginTop: 20
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
  },
  pickbutton: {
    width: 300
  },
  buttontext: {
    textAlign: "center",
    flex: 1,
    fontSize: 18,
    fontWeight: "500"
  },
  imageStyle: {
    width: 250,
    height: 250,
    marginTop: 25,
    marginBottom: 25,
    borderRadius: 20,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 5,
    overflow: 'hidden',
  },
  hotelText: {
    lineHeight: 30,
    fontSize: 16
  }
});
