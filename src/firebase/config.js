// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ99xbfC55qbCWyYnc7Vwxg9pdl7NmMq4",
  authDomain: "cursos-inova-cine.firebaseapp.com",
  projectId: "cursos-inova-cine",
  storageBucket: "cursos-inova-cine.firebasestorage.app",
  messagingSenderId: "726889734057",
  appId: "1:726889734057:web:ffbd3b480eb4b92724eeb8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

