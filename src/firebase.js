import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyC2Z-N0hcBPKKYlLVPrOlz1X-siH1J56cw",
    authDomain: "domino-app-6bce9.firebaseapp.com",
    projectId: "domino-app-6bce9",
    storageBucket: "domino-app-6bce9.appspot.com",
    messagingSenderId: "912717527360",
    appId: "1:912717527360:web:a57b42fa7099e3047e22a5",
    measurementId: "G-SW98942WYQ"
  };  

let firebaseApp;

if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  firebaseApp = firebase.app(); // Usa la instancia ya inicializada
}

const database = firebaseApp.database();

export { database };
