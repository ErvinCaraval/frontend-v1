// Firebase configuration with fallback to mock
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnCIzqQLr7VA3K07EyHr7HSikqKEv-aXA",
  authDomain: "preguntas-ac738.firebaseapp.com",
  projectId: "preguntas-ac738",
  storageBucket: "preguntas-ac738.firebasestorage.app",
  messagingSenderId: "676890183785",
  appId: "1:676890183785:web:13f915fafb3d9d776e3af8",
  measurementId: "G-97D4SHDWX0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Try to initialize auth, fallback to mock if it fails
let auth, db;
let useFirebase = true;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.log('⚠️ Firebase initialization failed, using mock services');
  console.log('Error:', error.message);
  useFirebase = false;
  
  // Import mock services
  const mockAuth = require('./mockAuth').default;
  const mockDb = require('./mockDb').default;
  
  auth = mockAuth;
  db = mockDb;
}

export { auth, db, useFirebase };

