import React from 'react'
import './App.css'

class Search extends React.Component {

    state = {
        searchResult: [],
        venueLoc: [],
        infoWindows: [],
        venueWindows: []
    };

    componentDidMount() {
        this.nameInput.focus();
    }

    findLoc = (loc) => {

        let searchResult = [], venueLoc = [], markers = this.props.marker, marker, map = this.props.map;
        //Fetch locstions based on user input using Foursquare API
        fetch('https://api.foursquare.com/v2/venues/search?near="' + loc +
            '"&client_id=Y4ZQOW5RNKPBP4TWULUZRL2YCCY33VJUF5UADROSTWKRPVGE&' +
            'client_secret=XL2YMRNJDBDO3QOMILLDOTIPWKYAVRCHPNCLIU0LCD1MKVLE&v=20180707',
            {
                method: 'GET',
                mode: 'cors'
            })
            .then(res => res.json())
            .then(data => {
                if (data.meta.code === 200) {
                    searchResult = data.response.venues;
                    this.setState({searchResult: searchResult});
                    for (let result in searchResult) {
                        venueLoc.push({
                            lat: searchResult[result].location.lat,
                            lng: searchResult[result].location.lng
                        })
                    }
                    this.setState({venueLoc});

                    // Change map center according to search results
                    map.setCenter(venueLoc[0]);
                    map.setZoom(16);

                    // Set new markers according to search result
                    venueLoc.map(loc => {
                        marker = new window.google.maps.Marker({
                            position: loc,
                            map: map,
                        });
                        markers.push(marker);
                    });
                    this.setState({marker: markers})

                }
                else {
                    this.setState({searchResult: []})
                }
            }).catch(error => console.log("error"));

    }
    ;
    setMarker = (name) => {
        this.props.mapArea.focus();
        let allVenues = this.state.searchResult,
            currentVenue,
            marker,
            currentVenueLoc = {},
            markers = this.state.marker,
            venueWindows = this.state.venueWindows,
            infoWindows = this.state.infoWindows,
            mapContainer = document.getElementById('map'),
            searchContainer = document.getElementById('searchContainer'),
            searchButton = document.getElementById('searchButton');

        //Hide search window on mobile
        searchContainer.style.zIndex = 1;
        searchButton.style.zIndex = 3;
        mapContainer.style.zIndex = 2;

        // Get lat and lng of all searched venues
        for (let n in allVenues) {
            if (allVenues[n].name === name) {
                currentVenue = allVenues[n];
                currentVenueLoc = {lat: allVenues[n].location.lat, lng: allVenues[n].location.lng};

            }
        }

        // Close any open info window
        venueWindows.map(ven => {
            ven.close();
        });

        // Close any open info window
        infoWindows.map(inf => {
            inf.close();
        });

        // Create new Info window when list item is clicked
        let map = this.props.map,
            venueDetails = '<div tabindex="0" id="venueDetails">' +
                '<h3>' + currentVenue.name + '</h3>' +
                '</div>',
            venueWindow = new window.google.maps.InfoWindow({
                content: venueDetails
            });

        venueWindows.push(venueWindow);
        this.setState({venueWindows});

        // Clear any previous markers
        markers.map(m => m.setMap(null));
        markers = [];

        // Set new markers according to list item clicked
        allVenues.map(all => {
                if (all.location.lat === currentVenueLoc.lat && all.location.lng === currentVenueLoc.lng) {
                    marker = new window.google.maps.Marker({
                        position: all.location,
                        map: map
                    });
                    marker.setAnimation(window.google.maps.Animation.BOUNCE);
                    markers.push(marker);
                    venueWindow.open(map, marker);
                    this.showInfoWindow(venueWindow, name, marker, map, all)
                }
                else {
                    marker = new window.google.maps.Marker({
                        position: all.location,
                        map: map,
                    });
                    markers.push(marker);
                    this.showInfoWindow(false, name, marker, map, all)

                }
            }
        );
        this.setState({marker: markers})

    };

    // Show info window when marker is clicked
    showInfoWindow = (venueWindow, name, marker, map, all) => {
        let currentCity, currentCountry, currentAddress, currentState,
            infoWindows = this.state.infoWindows,
            venueWindows = this.state.venueWindows;

        // Stop marker bounce animation
        if (venueWindow) {
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1000)
        }

        all.location.address ? currentAddress = all.location.address : currentAddress = '';
        all.location.city ? currentCity = all.location.city : currentCity = '';
        all.location.state ? currentState = all.location.state : currentState = '';
        all.location.country ? currentCountry = all.location.country : currentCountry = '';

        // Create new info window for marker click event
        let contentString = '<div id="venueInfo">' +
            '<h3>' + all.name + '</h3>' +
            '<div tabindex="0" role="contentinfo" aria-label="venue details" id="bodyContent">' +
            '<P tabindex="0">' + currentAddress + '</P>' +
            '<P tabindex="0">' + currentCity + '</P>' +
            '<P tabindex="0">' + currentState + '</P>' +
            '<P tabindex="0">' + currentCountry + '</P>' +
            '</div>' +
            '</div>';

        let infoWindow = new window.google.maps.InfoWindow({
            content: contentString,
            maxWidth: 150
        });
        infoWindows.push(infoWindow);

        // Listen to click event on marker
        marker.addListener('click', function () {

            // Close any info window opened by click on list items
            if (venueWindow) {
                venueWindow.close();
            }
            // Close any info window opened by click on other markers
            infoWindows.map(inf => {
                inf.close()
            });

            // Close any info window opened by click on list items
            venueWindows.map(ven => {
                ven.close()
            });

            // Open info window and animate marker when clicked
            infoWindow.open(map, marker);
            marker.setAnimation(window.google.maps.Animation.BOUNCE)
            setTimeout(function () {
                marker.setAnimation(null)
            }, 1000)
        });
        this.setState({infoWindows})
    };

    render() {
        let venueNames = [];
        for (let result in this.state.searchResult) {
            venueNames.push(this.state.searchResult[result].name)
        }
        return (

            <div id='searchContainer'>
                <input type="text" id="searchInput" className="search" placeholder="Search"
                       tabIndex={0} ref={(input) => {
                    this.nameInput = input;
                }}
                       onChange={e => this.findLoc(e.target.value)}/>
                <div className="searchList">
                    {/* Create list items based on search results*/}

                    <ul aria-label='Venues'>
                        {this.state.searchResult.length > 0 ?
                            (venueNames.map(venue =>
                                <li key={venue}
                                    tabIndex={0}
                                    onClick={e => this.setMarker(venue)}> {venue} </li>)) :
                            (<span> <li>No places Found </li></span>)
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export default Search