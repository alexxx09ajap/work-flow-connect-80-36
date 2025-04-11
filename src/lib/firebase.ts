
/**
 * Firebase Configuration File
 * 
 * This file initializes the Firebase services used throughout the app.
 * It exports the initialized Firebase instances for auth, firestore database,
 * and storage that other parts of the application can import and use.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with API keys
const firebaseConfig = {
  apiKey: "AIzaSyBMIiGervn7yGFctTZaO1Xjhrtw7_MX6_g",
  authDomain: "workflow-connect-cefbd.firebaseapp.com",
  projectId: "workflow-connect-cefbd",
  storageBucket: "workflow-connect-cefbd.firebasestorage.app",
  messagingSenderId: "796741870082",
  appId: "1:796741870082:web:1c02dead4f29df44fa3d1b"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);    // Authentication service
const db = getFirestore(app); // Firestore database service
const storage = getStorage(app); // Storage service for files/images

export { auth, db, storage };
