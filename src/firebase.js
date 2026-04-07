import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Added this

const firebaseConfig = {
  apiKey: "AIzaSyBU-umS1TGNWR1FSFmD_V4Xdsb-DuQTrGU",
  authDomain: "mindspace-69b7a.firebaseapp.com",
  projectId: "mindspace-69b7a",
  storageBucket: "mindspace-69b7a.firebasestorage.app",
  messagingSenderId: "595322232331",
  appId: "1:595322232331:web:ec692fd3cfd3695ca2710e",
  measurementId: "G-FFE9LNJ6J4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and EXPORT it so your Tracker can use it
export const db = getFirestore(app);