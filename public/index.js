const mymap = L.map('mapid').setView([34.0522, -118.2437], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW50b255bmd1eWVuOTgiLCJhIjoiY2p1NjYwNDFxMGY4bzN5azlzYWQxeGdyeiJ9.U9uKZ05qdywdHj8-TMuPog', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

let markers = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-118.2437, 34.0522]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [34.0522, -118.2437]
    }
}];

L.geoJSON(markers).addTo(mymap).on('click', function(e) {
    console.log(e.latlng);
});
