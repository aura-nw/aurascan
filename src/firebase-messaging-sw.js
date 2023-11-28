importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: 'AIzaSyAQnkadQ0_7z3O4D53UNInv5H7LpJbgY9g',
  authDomain: 'fir-notification-5e9fd.firebaseapp.com',
  projectId: 'fir-notification-5e9fd',
  storageBucket: 'fir-notification-5e9fd.appspot.com',
  messagingSenderId: '96547384537',
  appId: '1:96547384537:web:0a185392dc49fbb189a2c8',
  measurementId: 'G-QFGE6B9LET',
});
const messaging = firebase.messaging();