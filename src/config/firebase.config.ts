// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcY-75lTQDYMNUTWvOPiO9-eF99rrwr5Y",
  authDomain: "dating-app-7580c.firebaseapp.com",
  projectId: "dating-app-7580c",
  storageBucket: "dating-app-7580c.firebasestorage.app",
  messagingSenderId: "877269138805",
  appId: "1:877269138805:web:257fac5ef36da9c9caa73c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app };
