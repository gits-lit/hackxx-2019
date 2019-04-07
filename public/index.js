const mymap = L.map('mapid').setView([34.0522, -118.2437], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW50b255bmd1eWVuOTgiLCJhIjoiY2p1NjYwNDFxMGY4bzN5azlzYWQxeGdyeiJ9.U9uKZ05qdywdHj8-TMuPog', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

let markers = []

// Declare Socket.io
socket = io();

let soundScore = -1;
let pictureScore = -1;

/* When the function receives a new series of maps, update all the markers */
socket.on('map', (data) => {
  L.geoJSON(data).addTo(mymap).on('click', function(e) {
    console.log(e);
    socket.emit('case', e.layer.feature.properties.id);
  });
});

/* When the function receives profile information, update the cards */
socket.on('profile', (data) => {
  console.log(data);
  $("#name").fadeOut('fast', function() {
    $(this).html(data.name).fadeIn("fast");
  });
  $("#phone").fadeOut('fast', function() {
    $(this).html(data.phone).fadeIn("fast");
  });
  $("#address").fadeOut('fast', function() {
    $(this).html(data.address).fadeIn("fast");
  });
  $("#audio").fadeOut('fast', function() {
    $(this).html(
      '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>')
      .fadeIn("fast");
  });
  $("#photo").fadeOut('fast', function() {
    $(this).html(
      '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>')
      .fadeIn("fast");
  });
  $("#danger").fadeOut('fast', function() {
    $(this).html(
      '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>')
      .fadeIn("fast");
  });
});

socket.on('picture', (data) => {
  let safety = data.safety;
  if(soundScore != -1) {

  }
  document.getElementById("image").src=data.filename;
  $("#photo").fadeOut('fast', function() {
    if(safety == 3 ) {
      $(this).html(
        '<i class="big red circle icon"></i> Picture shows signs of danger')
        .fadeIn("fast");
        pictureScore = 3;
    }
    else if(safety == 2) {
      $(this).html(
        '<i class="big yellow circle icon"></i> Picture might show danger')
        .fadeIn("fast");
        pictureScore = 2;
    }
    else {
      $(this).html(
        '<i class="big green circle icon"></i> Picture seems okay')
        .fadeIn("fast");
        pictureScore = 1;
    }
  });
  if(soundScore != -1) {
    overall();
  }
});

socket.on('audio', (data) => {
  let safety = data.safety;
  document.getElementById("sound").src=data.filename;
  $("#textbox").fadeOut('fast', function() {
      $(this).html(
        `<b class="info">Transcription</b> <br> ${data.content}`)
        .fadeIn("fast");
    });

  $("#audio").fadeOut('fast', function() {
    if(safety < 0.1 ) {
      $(this).html(
        '<i class="big red circle icon"></i> Audio shows signs of danger')
        .fadeIn("fast");
        soundScore = 3;
    }
    else if(safety <= 0) {
      $(this).html(
        '<i class="big yellow circle icon"></i> Audio might show danger')
        .fadeIn("fast");
        soundScore = 2;
    }
    else {
      $(this).html(
        '<i class="big green circle icon"></i> Audio seems okay')
        .fadeIn("fast");
        soundScore = 1;
    }
  });
  if(pictureScore != -1) {
    overall();
  }
});

function overall() {
  $("#danger").fadeOut('fast', function() {
    let safety = soundScore + pictureScore;
    if(safety >= 5 ) {
      $(this).html(
        '<i class="big red circle icon"></i> Person is likely in danger')
        .fadeIn("fast");
    }
    else if(safety <= 2) {
      $(this).html(
        '<i class="big green circle icon"></i> Person seems okay')
        .fadeIn("fast");
    }
    else {
      $(this).html(
        '<i class="big yellow circle icon"></i> Person might be in danger')
        .fadeIn("fast");
    }
  });
}

/*
let markers = [{
    "type": "Feature",
    "properties": {
      "id": 1590175,
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
      "id": 115185,
      "name": "Busch Field",
      "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [34.0522, -118.2437]
    }
}];*/
