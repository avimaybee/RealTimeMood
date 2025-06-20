
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
if (typeof window !== 'undefined' && isSupported()) {
  analytics = getAnalytics(app);
}

export { app, analytics };
