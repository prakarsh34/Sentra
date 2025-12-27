import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDquH5IAEC8qb7PIiG_IyPpLL1VNqHXEiA",
  authDomain: "sentra-a2919.firebaseapp.com",
  projectId: "sentra-a2919",
  storageBucket: "sentra-a2919.appspot.com",
  messagingSenderId: "958263476508",
  appId: "1:958263476508:web:d3f69b33d59aa74b6f7ad9",
  measurementId: "G-43S0EJFQJK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
