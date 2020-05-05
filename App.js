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
  Linking,
  Dimensions,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import { Container, 
  Text, 
  Button, 
  Header, 
  Left, 
  Body, 
  Right, 
  Icon, 
  Title,
  ListItem,
  List } from 'native-base';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
//https://codeburst.io/react-native-google-map-with-react-native-maps-572e3d3eee14
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { captureRef } from 'react-native-view-shot';
import { takeSnapshotAsync } from 'expo';
import * as MediaLibrary from 'expo-media-library';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Environment = {
  FIREBASE_API_KEY: 'AIzaSyAmmtXzyytzo_5YuV1NVRvOx2QsHr2lpvo',
  FIREBASE_AUTH_DOMAIN: 'pic-and-pin.firebaseapp.com',
  FIREBASE_DATABASE_URL: 'https://pic-and-pin.firebaseio.com/',
  FIREBASE_PROJECT_ID: 'pic-and-pin',
  FIREBASE_STORAGE_BUCKET: 'pic-and-pin.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: '240232545232',
  GOOGLE_CLOUD_VISION_API_KEY: 'AIzaSyA1Ek0Sj0m3llWAGQCI6bAmOL4x8FO64e4',
  PRICELINE_SERVER: "https://api-sandbox.rezserver.com/api/hotel",
  PRICELINE_REFID: '1346',
  PRICELINE_APIKEY: '21e1fb57679db2489ba1c9f8c2c79e8c',
  PRICELINE_HOTEL_PREFIX: "https://www.priceline.com/relax/at/"
};

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: Environment['FIREBASE_API_KEY'],
    authDomain: Environment['FIREBASE_AUTH_DOMAIN'],
    databaseURL: Environment['FIREBASE_DATABASE_URL'],
    projectId: Environment['FIREBASE_PROJECT_ID'],
    storageBucket: Environment['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: Environment['FIREBASE_MESSAGING_SENDER_ID'],
    appId: "1:240232545232:web:ae295bead95956b8bed7d5",
    measurementId: "G-VVN9BF9ZKQ"
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
        scrollEnabled = {scrollEnabled}>
          <Header>
            <Left>
            </Left>
            <Body>
              <Title style={{ textAlign: "center" }}>Pic and Pin</Title>
            </Body>
            <Right>
              {/* <Button transparent>
                <Icon name='menu' />
              </Button> */}
            </Right>
          </Header>
  
        <View style={styles.helpContainer}>
          <Button rounded info onPress={this._pickImage}
            style = {styles.pickbutton}
          >
            <Text style = {styles.buttontext}> Select image from camera roll </Text>
          </Button>
              
          {/* {this.state.googleResponse && (
            <FlatList
              data={this.state.googleResponse.responses[0].labelAnnotations}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={({ item }) => <Text style={styles.getStartedText}>Item: {item.description}</Text>}
            />
          )} */}
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
    return (
      <View>
        <Hotel hotels={this.state.hotels} />
        <Container>
          <Text>pic and pin 📍</Text></Container>
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
            justifyContent:'center',
            alignContent:'center',
            alignItems: 'center',
          }}
        >
          <Image source={{ uri: image }} style={styles.imageStyle} />
          <Button rounded info onPress={this.submitToGoogle} style={{textAlign: "center",width:200}}>
            <Text style = {styles.buttontext}>Locate</Text>
          </Button>
        </View>


          { <View>
          {googleResponse && (
            <MapView provider = { PROVIDER_GOOGLE }
            style = { styles.mapContainer }
            initialRegion={{
              latitude: this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng['latitude'],
              longitude: this.state.googleResponse.responses[0].landmarkAnnotations[0].locations[0].latLng['longitude'],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}/>
          )}
          </View> }

          {googleResponse &&
          (<Text style = {{    
            textAlign: "center",
            fontSize:20,
            marginTop:20,
            marginBottom:20,
            fontWeight:'600'}}>
            {this.state.googleResponse.responses[0].landmarkAnnotations[0].description}
          </Text>)}

        {/* {googleResponse && 
          (<Button rounded info onPress={this._shareToIns} style={{ textAlign:"center",width:300,marginLeft:35 }}>
          <Text style = {styles.buttontext}>Share to Instagram</Text>
          </Button>
        )} */}

        {hotels && this._maybeRenderHotel()}     
      </SafeAreaView>
    );
  };

  _keyExtractor = (item, index) => item.id;

  _renderItem = item => {
    <Text>response: {JSON.stringify(item)}</Text>;
  };

  // saveToCameraRollAsync = async () => {
  //   try {
  //     const testResult = await captureRef(this._container, {
  //       format: "jpg",
  //       quality: 0.8
  //     });
  //     console.log("testResult", testResult);
  //     //const saveresult = CameraRoll.saveToCameraRoll(testResult, 'photo');
  //     const saveResult = await MediaLibrary.createAssetAsync(testResult); // screenshot saved in album
  //     console.log("saveResult", saveResult); // object uri?
  //     this.setState({screenshot: saveResult});
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }; 

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

function Hotel(props){
  console.log(props.hotels);
  const content = props.hotels.map((hotel) =>

  <Text style = {styles.hotelText} key={hotel.id} onPress={() => Linking.openURL(Environment['PRICELINE_HOTEL_PREFIX'] + hotel.id_t.toString())}>
    {hotel.name}
  </Text>)
  return(
    <View>
      <Text style = {{textAlign: "center",fontSize:20,marginTop:20,marginBottom:20,fontWeight:'600'}}>Hotels nearby</Text>
      {content}
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

  mapContainer:{
    width: 400,
    height: 250,
    backgroundColor: '#fff',
    paddingBottom: 10,
    marginBottom:20,
    marginTop:20
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
  pickbutton:{
    width:300
  },
  buttontext:{
    textAlign:"center",
    flex:1,
    fontSize:18,
    fontWeight:"500"
  },
  imageStyle:{
     width: 250,
     height: 250,
     marginTop:25,
     marginBottom:25,
     borderRadius:20,
    //  borderTopRightRadius: 3,
    // borderTopLeftRadius: 3,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 5,
    overflow: 'hidden',
  },
  hotelText:{
    lineHeight:30,
    fontSize:16
  }
});
