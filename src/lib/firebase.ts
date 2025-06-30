
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  linkWithCredential, 
  onAuthStateChanged,
  signOut,
  type User 
} from "firebase/auth";

// Your web app's Firebase configuration is hardcoded here to resolve
// an environment-specific issue with loading .env files.
// For production deployments, it is highly recommended to move these
// back into environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyA19PhoRcoQq8QaNl-qiqwEextRP31AOzU",
  authDomain: "realtimemood.firebaseapp.com",
  projectId: "realtimemood",
  storageBucket: "realtimemood.firebasestorage.app",
  messagingSenderId: "420032056630",
  appId: "1:420032056630:web:00142dbb47b01b9eec7797",
  measurementId: "G-0G8FXXYM2H"
};


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let analytics: Analytics | undefined;

/**
 * Initializes Firebase Analytics if it hasn't been already and is supported.
 * This function is safe to call multiple times and is deferred to avoid
 * blocking the initial page load.
 */
export function initializeAnalytics() {
  if (typeof window !== 'undefined' && !analytics) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
}

const db = getFirestore(app);
const auth = getAuth(app);

export { 
  app, 
  db, 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  linkWithCredential, 
  onAuthStateChanged,
  signOut,
  type User
};
