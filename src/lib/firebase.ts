
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with the updated keys
const firebaseConfig = {
  apiKey: "AIzaSyBMIiGervn7yGFctTZaO1Xjhrtw7_MX6_g",
  authDomain: "workflow-connect-cefbd.firebaseapp.com",
  projectId: "workflow-connect-cefbd",
  storageBucket: "workflow-connect-cefbd.firebasestorage.app",
  messagingSenderId: "796741870082",
  appId: "1:796741870082:web:1c02dead4f29df44fa3d1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
