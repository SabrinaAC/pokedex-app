// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAv9bdXcEhfQ9Ndr6EAcWWBMoCDdCdZxlM",
  authDomain: "pokedex-app-68c4b.firebaseapp.com",
  projectId: "pokedex-app-68c4b",
  storageBucket: "pokedex-app-68c4b.firebasestorage.app",
  messagingSenderId: "433338361787",
  appId: "1:433338361787:web:fe4eead984198ee132069e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);