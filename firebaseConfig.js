import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBxLxVLxqJxqJxqJxqJxqJxqJxqJxqJxqJ",
  authDomain: "discipulapp-90166008.firebaseapp.com",
  projectId: "discipulapp-90166008",
  storageBucket: "discipulapp-90166008.firebasestorage.app",
  messagingSenderId: "90166008",
  appId: "1:90166008:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);

console.log('✅ Firebase conectado:', app.name);
console.log('📦 Proyecto:', firebaseConfig.projectId);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const IS_FIREBASE_CONFIGURED = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);

export default app;
