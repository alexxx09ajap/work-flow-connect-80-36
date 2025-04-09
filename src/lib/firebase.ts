
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with the updated keys
const firebaseConfig = {
  apiKey: "AIzaSyCLbrnzHU72CoJXOnht9AhlLJKUrqbtlaY",
  authDomain: "freelancer-555a9.firebaseapp.com",
  projectId: "freelancer-555a9",
  storageBucket: "freelancer-555a9.firebasestorage.app",
  messagingSenderId: "680164060170",
  appId: "1:680164060170:web:e9931bae80370ffd03c3f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
