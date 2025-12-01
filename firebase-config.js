// Import Firebase (for modules setup)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxumrn9nlOFUzYP1hCmG-LG7iosW24NhY",
  authDomain: "femi-couture-store.firebaseapp.com",
  projectId: "femi-couture-store",
  storageBucket: "femi-couture-store.firebasestorage.app",
  messagingSenderId: "961038217728",
  appId: "1:961038217728:web:e9042f535055c42b3a5ee5",
  measurementId: "G-B8ZN4L8KGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firestore db so you can use it in other JS files
export { db, collection, addDoc };
