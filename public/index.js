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

  $("#danger").fadeOut('fast', function() {
    if(data.content.includes('potato')) {
      $(this).html(
        '<i class="big red circle icon"></i> Sayfe Word detected')
        .fadeIn("fast");
    }
    else {
      $(this).html(
        '<i class="big green circle icon"></i>Sayfe Word not detected')
        .fadeIn("fast");
    }
  });
});

var config = {
  apiKey: "AIzaSyBHQPvrRZa5IGCutgUfQkyuz60BbqF2D04",
  authDomain: "safeword-c0979.firebaseapp.com",
  databaseURL: "https://safeword-c0979.firebaseio.com",
  projectId: "safeword-c0979",
  storageBucket: "safeword-c0979.appspot.com",
  messagingSenderId: "824428448933"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();
//messaging.usePublicVapidKey('BNb2c5LH81YZe-JBTikbz0CxbQeXrsXlya_Epirnq68mQiJwpxG0NQPQ7lVqZGr0mhGaLo4ILP0Jw66b9OP-8hY');

messaging.requestPermission().then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
  // ...
  return messaging.getToken();
}).then(function(token){
  console.log(token);
}).catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
messaging.onMessage(function(payload) {
  console.log('Message received. ' + payload.data.ok);
  // ...
  socket.emit('reload');
});


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
