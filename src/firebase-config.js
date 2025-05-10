import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAtKPLZ_JaqzP3roUa5DTVyKEW_O2XLUC8",
  authDomain: "employee-management-edc6a.firebaseapp.com",
  projectId: "employee-management-edc6a",
  storageBucket: "employee-management-edc6a.appspot.app",
  messagingSenderId: "167978278666",
  appId: "1:167978278666:web:3734171836d176c03124f3",
  measurementId: "G-ZBQE38WBD8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
