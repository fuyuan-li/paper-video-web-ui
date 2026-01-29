// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAncmopKUnstJlCrVgPPAzsOnDA34SRGis",
  authDomain: "research-explainer.firebaseapp.com",
  projectId: "research-explainer",
  storageBucket: "research-explainer.firebasestorage.app",
  messagingSenderId: "820391859400",
  appId: "1:820391859400:web:da3531ea5d1c94c748c1fd",
  measurementId: "G-ZNPG4KM4YY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
