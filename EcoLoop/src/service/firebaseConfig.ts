// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGl0cgsIuzi7K53lLNZg_wKoX6anC7iqw",
  authDomain: "ecoloop-5eaec.firebaseapp.com",
  projectId: "ecoloop-5eaec",
  storageBucket: "ecoloop-5eaec.firebasestorage.app",
  messagingSenderId: "805318585727",
  appId: "1:805318585727:web:70ad23b1e1124d78debe4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);          //inicializa el servicio de autenticación de firebase en la app, sin esto no se pueden llamar funciones de autenticación como login, registro, etc.
export const googleProvider = new GoogleAuthProvider();