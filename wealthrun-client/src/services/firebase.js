// src/services/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCI4biQ9Mgu6jnFA7_hjLPQdvqyK-k2uG4",
  authDomain: "wealthrun-6a002.firebaseapp.com",
  projectId: "wealthrun-6a002",
  storageBucket: "wealthrun-6a002.appspot.com",
  messagingSenderId: "779013990816",
  appId: "1:779013990816:web:2f30f3d1d5d832e9cd1cc5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
