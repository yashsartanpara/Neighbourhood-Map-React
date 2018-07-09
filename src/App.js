import React from 'react'
import scriptLoader from 'react-async-script-loader'
import './App.css'
import Search from "./Search";

// Positions for starting markers
let position = [{lat: 40.689247, lng: -74.044502},
    {lat: 40.696011, lng: -73.993286},
    {lat: 40.852905, lng: -73.872971},
    {lat: 40.785091, lng: -73.968285},
    {lat: 40.758896, lng: -73.985130}];

class App extends React.Component {

    state = {
        locations: {
            position: position,
        },
        success: true,
        marker: [],
        map: []
    };

// Check if maps api loads
    componentWillReceiveProps({isScriptLoadSucceed}) {
        if (isScriptLoadSucceed) {
            let marker = [];
            // initiating the map
            let mapContainer = document.getElementById('map'),
                map = new window.google.maps.Map(mapContainer, {
                    zoom: 11,
                    center: {lat: 40.730610, lng: -73.935242},
                    mmapTypeControl: true,
                    mapTypeControlOptions: {
                        position: window.google.maps.ControlPosition.RIGHT_CENTER,
                    }
                }),
                markers,
                currentLocation = this.state.locations.position;
            // Initialize markers
            currentLocation.map(loc => {
                markers = new window.google.maps.Marker({position: loc, map: map});
                marker.push(markers)
            });
            this.setState({marker, map})

        }
        else {
            alert("google maps API couldn't load");
            console.log("google maps API couldn't load.");
            this.setState({success: false})
        }
    }

// show search window on mobile phone
    showSearch = (e) => {
        // document.getElementById('searchContainer').style.display = 'block';
        document.getElementById('searchContainer').style.zIndex = 1000;
        document.getElementById('map').style.zIndex = -1;
        document.getElementById('searchButton').style.zIndex = -1;
    };

    render() {
        return (
            <div className='container'>

                {this.state.success ? (
                    <div id="map" role="application" aria-label="map" tabIndex={0} ref={(map) => {
                        this.mapArea = map;
                    }}>

                    </div>
                ) : (
                    <div>
                        Problem Loading Map
                    </div>

                )}
                <Search
                    marker={this.state.marker}
                    mapArea={this.mapArea}
                    map={this.state.map}
                />
                <button tabIndex={0} id='searchButton' className='searchButton' onClick={e => this.showSearch(e)}>
                    <i className="fa fa-bars fa-2x"></i>
                </button>
            </div>
        )
    }

}

export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=AIzaSyC7_AY8OizYw9fA2nnLwKwSuZkL5yT7LTA&libraries=places`]
)(App);