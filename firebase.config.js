import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuKxDktLqA7ch9wfkV4SZsrP9LwEZQxbM",
  authDomain: "medtime-f8c50.firebaseapp.com",
  projectId: "medtime-f8c50",
  storageBucket: "medtime-f8c50.firebasestorage.app",
  messagingSenderId: "984319704325",
  appId: "1:984319704325:web:eb41910654c4da68738b6c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);