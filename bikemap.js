var TORONTO_COORDS = [43.653, -79.383];
var ZOOM_LEVEL = 13;
var MAP_ID = 'map';
var MAPBOX_ACCESS_TOKEN = 'your.mapbox.access.token';
var MAPBOX_PROJECT_ID = 'your.mapbox.project.id';
var MAPBOX_DARK_TILEMAP = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}';

var map = L.map(MAP_ID).setView(TORONTO_COORDS, ZOOM_LEVEL);
L.tileLayer(MAPBOX_DARK_TILEMAP,  {
    maxZoom: 18,
    id: MAPBOX_PROJECT_ID,
    accessToken: MAPBOX_ACCESS_TOKEN
}).addTo(map);

const BIKE_DATA_URL = 'http://feeds.bikesharetoronto.com/stations/stations.xml';
const requestURL = 'https://resourcely.herokuapp.com/r/' + encodeURIComponent(BIKE_DATA_URL);
function fetchStations(){
  return fetch(requestURL)
    .then(res => res.json())
}
function populateMap(){
  fetchStations()
    .then(data => {
      const stations = data.stations.station.map(parseStation);
      stations.forEach(addMarker);
    })
}

function parseStation(station){
  var numBikes = parseInt(station.nbBikes[0])
  return {
    numBikes,
    id: station.id[0],
    name: station.name[0],
    latlng: [station.lat[0], station.long[0]],
    totalDocks: numBikes + parseInt(station.nbEmptyDocks[0])
  }
}

function addMarker(station){
  var stationColor = mapColor(station.numBikes / station.totalDocks);
  console.log(stationColor)
  var stationMarkerOptions = {
    radius: 50,
    color: stationColor  
  };
  var popupContent = '<h5>' + station.name[0] + '</h5>' 
    + '<p>' + station.numBikes + '/' + station.totalDocks 
    + 'bikes</p>';
  L.circle(station.latlng, stationMarkerOptions)
    .bindPopup(popupContent)
    .addTo(map);
}

function mapColor(ratio){
  const amount = Math.floor(255.0 * ratio);
  return `rgb(${255 - amount}, ${amount}, 0)`;
}

populateMap();
setInterval(populateMap, 5000);
