import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArV71MV34tIOcm7MVy1i3LeHtw-FyoTO0",
  authDomain: "cwla-52a1d.firebaseapp.com",
  projectId: "cwla-52a1d",
  storageBucket: "cwla-52a1d.firebasestorage.app",
  messagingSenderId: "20284050257",
  appId: "1:20284050257:web:a955e5af6b703d86c46170",
  measurementId: "G-89T8B4DPMZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();