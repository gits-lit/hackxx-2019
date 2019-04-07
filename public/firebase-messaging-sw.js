importScripts("https://www.gstatic.com/firebasejs/5.9.3/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.9.3/firebase-messaging.js");

socket = io();

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
messaging.setBackgroundMessageHandler(function(payload) {
  let title = 'Hello World';
  const options = {
  }
  return self.registration.showNotification(title, options);
  socket.emit('reload');
});
