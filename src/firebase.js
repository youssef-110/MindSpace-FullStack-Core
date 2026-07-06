import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Values come from .env (VITE_FIREBASE_*); the fallbacks keep the existing
// demo project working out of the box. Firestore is only used as best-effort
// cloud sync — the app works fully offline without it.
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBU-umS1TGNWR1FSFmD_V4Xdsb-DuQTrGU",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "mindspace-69b7a.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "mindspace-69b7a",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "mindspace-69b7a.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "595322232331",
  appId: env.VITE_FIREBASE_APP_ID || "1:595322232331:web:ec692fd3cfd3695ca2710e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
