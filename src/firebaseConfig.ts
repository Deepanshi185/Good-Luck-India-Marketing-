// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these values with your actual project keys from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBQ4QH2c5A-OXUHemoRPhO9u82u193uA4M",
  authDomain: "goodluckindia.firebaseapp.com",
  projectId: "goodluckindia",
  storageBucket: "goodluckindia.firebasestorage.app",
  messagingSenderId: "281456164958",
  appId: "1:281456164958:web:520e5d9e87d25a18f774cf",
  measurementId: "G-7TJREP9VZJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);