import React,{Component} from 'react';
import { SafeAreaView,Text,StyleSheet,Linking,TouchableOpacity } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements'
import { View } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';

const Environment = {
    PRICELINE_HOTEL_PREFIX: "https://www.priceline.com/relax/at/"
  };

export default class HomeScreen extends Component {

    constructor(props){
        super(props);
    }

    render(){
        const {navigate} = this.props.navigation;
        const hotels = this.props.route.params;
        console.log(hotels);

        return(
            <SafeAreaView style = {styles.container}>
                <View style = {styles.title_container}>
                    <Text style = {styles.title}> Nearby Hotels </Text>
                </View>
                <ScrollView>
                
                {hotels.HotelData.map((hotel,index) =>
                    
                    <View style = {styles.listContainer} >
                        <TouchableOpacity key={hotel.id} onPress={() => Linking.openURL(Environment['PRICELINE_HOTEL_PREFIX'] + hotel.id_t.toString())}>
                        <ListItem
                        leftAvatar = {<Avatar large source={{uri: 'https:'+ hotel.thumbnail}} rounded height={80} width={80}/>}
                        rightTitle = {`$ ${hotel.room_data[0].rate_data[0].price_details.night_price_data[0].display_night_price}`}
                        rightTitleStyle = {{width:80,marginTop:30}}
                        title={` ${hotel.name}`}
                        titleNumberOfLines = {2}
                        titleStyle = {styles.title_style}
                        titleContainerStyle = {styles.title_containerstyle}
                        subtitle={`Rating: ${hotel.review_rating}`}
                        subtitleStyle = {styles.subtitle_style}
                        bottomDivider
                        
                        />
                        </TouchableOpacity>
                    
                    </View>
                    
                )}
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    hotelText:{
        lineHeight:34,
        fontSize:18,
        marginLeft:10
      },
      container:{
          flex:1,
          justifyContent:'flex-start',
          alignItems:'flex-start',
          marginLeft:0,
          marginTop:20,
          backgroundColor:'white'
      },
      title_container: {
        // marginLeft: '5%',
        marginTop:20,
        width: '85%',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent:'center',
        marginBottom: 10,
        marginLeft:35
      },
      title: {
        color: 'black',
        fontSize: 24,
        fontFamily: 'Avenir-Medium',
      },
      title_style: {
        color: 'black',
        fontSize: 18,
        fontFamily: 'Avenir-Medium',
        fontWeight:'600',
        width:280,
        marginLeft:0
      },
  
      subtitle_style: {
        fontFamily: 'Avenir-Medium',
        // color: 'darkgray'
        marginLeft:5,
        marginTop:5
      },

        subtitle_container: {
            marginTop: 20,
            marginLeft: '5%',
            width: '85%',
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'white',
            marginBottom: 10
        },
        listContainer:{
            width: 400
        }

})