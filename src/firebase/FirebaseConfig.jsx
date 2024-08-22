// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaeIELkNDDXpYUghWoonGp1Su5Wt5jxAw",
  authDomain: "campus-app-98785.firebaseapp.com",
  projectId: "campus-app-98785",
  storageBucket: "campus-app-98785.appspot.com",
  messagingSenderId: "1077160024474",
  appId: "1:1077160024474:web:2fffd81ac9997067ae0223",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
