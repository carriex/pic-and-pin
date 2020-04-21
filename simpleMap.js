import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
 

const AnyReactComponent = ({ text }) => (
    <div style={{
      color: 'white', 
      background: 'blue',
      padding: '15px 10px',
      display: 'inline-flex',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '100%',
      transform: 'translate(-50%, -50%)'
    }}>
      {text}
    </div>
  );

class SimpleMap extends Component {
  static defaultProps = {
    zoom: 11
  };
 
  render() {
    console.log(this.props.center);
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '30vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyAmmtXzyytzo_5YuV1NVRvOx2QsHr2lpvo" }}
          center={this.props.center}
          defaultZoom={this.props.zoom}
        >
          <AnyReactComponent
            lat={this.props.center.lat}
            lng={this.props.center.lng}
          />
        </GoogleMapReact>
        <div style = {{color: 'rgba(96,100,109, 1)', textAlign: 'center'}}>{this.props.description}</div>
      </div> 
    );
  }
}
 
export default SimpleMap;