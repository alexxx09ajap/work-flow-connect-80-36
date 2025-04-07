
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with the provided keys
const firebaseConfig = {
  apiKey: "AIzaSyCuTytohBtCOaWbuQYXgZXMsbKat_7h354",
  authDomain: "workflowconnect-4c8b9.firebaseapp.com",
  projectId: "workflowconnect-4c8b9",
  storageBucket: "workflowconnect-4c8b9.firebasestorage.app",
  messagingSenderId: "514049551440",
  appId: "1:514049551440:web:7d1ed70aac7766e74cb555"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
