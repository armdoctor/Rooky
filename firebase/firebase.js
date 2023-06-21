// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOSsBFh2G9lX6TpWO1oDQkxzdLP-t47Cs",
  authDomain: "coachbarmarket.firebaseapp.com",
  projectId: "coachbarmarket",
  storageBucket: "coachbarmarket.appspot.com",
  messagingSenderId: "824737553751",
  appId: "1:824737553751:web:d99d3ccab3f606e5e4f212",
  measurementId: "G-EVTQDE61NK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app);

export { auth, db, storage, getDownloadURL };