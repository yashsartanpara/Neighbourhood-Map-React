import React from 'react'
import scriptLoader from 'react-async-script-loader'
import './App.css'
import Search from "./Search";


class App extends React.Component {

    state = {
        locations: [],
        success: true,
        marker: [],
        map: '',
        infoWindows: '',
        venueWindows: [],
        center: {lat: 40.730610, lng: -73.935242}
    };

    // Check if maps api loads
    componentWillReceiveProps({isScriptLoadSucceed}) {
        if (isScriptLoadSucceed) {

            // initiating the map
            let mapContainer = document.getElementById('map'),
                map = new window.google.maps.Map(mapContainer, {
                    zoom: 16,
                    center: {lat: 40.730610, lng: -73.935242}
                });

            // Initialize info windows
            let infowindow = new window.google.maps.InfoWindow({});

            this.setState({map: map, infoWindows: infowindow});

            // Fetch locations around new york city
            fetch('https://api.foursquare.com/v2/venues/search?ll=' + this.state.center.lat + ',' + this.state.center.lng +
                '&client_id=Y4ZQOW5RNKPBP4TWULUZRL2YCCY33VJUF5UADROSTWKRPVGE&' +
                'client_secret=LHQZFHYSYPHIN2QKXSEHTXVBOWYT3KJKX3XSOYMZRWSCGQNL&v=20180707')
                .then(
                    res => {
                        if (res.status !== 200) {
                            alert("Places API failed");
                            throw res;
                        }
                        return res.json()
                    })
                .then(res => {
                    let venues = res.response.venues;
                    this.setState({locations: venues})
                })
                .then(res => this.setMarker(map))
                .catch(error => console.log(error));
        }
        else {
            console.log("google maps API couldn't load.");
            this.setState({success: false})
        }
    }

    // Function to add markers to the map
    setMarker = (map) => {
        let self = this;
        let locs = this.state.locations;

        // Traverse through each locations and add marker
        locs.forEach(loc => {
            let marker = new window.google.maps.Marker({
                position: {lat: loc.location.lat, lng: loc.location.lng},
                map: map,
                title: loc.name
            });

            // Add event listener to markers to open info window
            marker.addListener('click', function () {
                self.showInfoWindow(marker, loc);
            });
            let markers = this.state.marker;
            markers.push(marker);
            this.setState({marker: markers})
        });
    };

    // Show info window when marker is clicked
    showInfoWindow = (marker, loc) => {
        document.getElementById('searchContainer').style.zIndex = 1;
        document.getElementById('map').style.zIndex = 2;
        document.getElementById('searchButton').style.zIndex = 3;
        // Close any opened info windows
        this.state.infoWindows.close();
        let markers = this.state.infoWindows.marker,
            venueWins = [];
        if (markers !== marker) {
            markers = marker;

            // Set bounce animation to markers
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1000);
            this.state.infoWindows.open(this.state.map, marker);
            this.showDetails(loc);
            venueWins.push(this.state.infoWindows)
            this.setState({venueWindows: venueWins})
        }


    };

    // Function to populate info window
    showDetails = (loc) => {

        // Get additional data about location from fetched data
        let currentCity, currentCountry, currentAddress, currentState;
        loc.location.address ? currentAddress = loc.location.address : currentAddress = '';
        loc.location.city ? currentCity = loc.location.city : currentCity = '';
        loc.location.state ? currentState = loc.location.state : currentState = '';
        loc.location.country ? currentCountry = loc.location.country : currentCountry = '';

        // Create new info window for marker click event
        let contentString = '<div id="venueInfo">' +
            '<h3>' + loc.name + '</h3>' +
            '<div tabindex="0" role="contentinfo" aria-label="venue details" id="bodyContent">' +
            '<P tabindex="0">' + currentAddress + '</P>' +
            '<P tabindex="0">' + currentCity + '</P>' +
            '<P tabindex="0">' + currentState + '</P>' +
            '<P tabindex="0">' + currentCountry + '</P>' +
            '</div>' +
            '</div>';
        this.state.infoWindows.setContent(contentString);
    };

    componentDidMount() {
        // Global function for Google map error handling
        window.gm_authFailure = this.gm_authFailure;
    }

    // Global function for Google map error handling
    gm_authFailure() {
        window.alert("Google Maps failed to Load")
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
                    infoWindows={this.state.infoWindows}
                    showInfo={this.showInfoWindow}
                    map={this.state.map}
                    locations={this.state.locations}
                />
                <button tabIndex={0} id='searchButton' className='searchButton' onClick={e => this.showSearch(e)}>
                    <i className="fa fa-bars fa-2x"></i>
                </button>
            </div>
        )
    }

}

export default scriptLoader(['https://maps.googleapis.com/maps/api/js?key=AIzaSyC7_AY8OizYw9fA2nnLwKwSuZkL5yT7LTA'])(App);
