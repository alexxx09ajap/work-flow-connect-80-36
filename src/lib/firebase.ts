
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with the provided keys
const firebaseConfig = {
  apiKey: "AIzaSyDGghUreQ4_M4S8N-wyq0WKQlNZZrP1HGE",
  authDomain: "workflow-connect.firebaseapp.com",
  projectId: "workflow-connect",
  storageBucket: "workflow-connect.firebasestorage.app",
  messagingSenderId: "716001366128",
  appId: "1:716001366128:web:3062bfa117e1862c0d64b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
