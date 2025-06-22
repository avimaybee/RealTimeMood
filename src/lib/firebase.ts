// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let analytics;
// Check if window is defined (i.e., we're on the client-side) before checking for analytics support
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, analytics };
