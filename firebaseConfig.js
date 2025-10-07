import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU",
  authDomain: "discipulapp-8d99c.firebaseapp.com",
  projectId: "discipulapp-8d99c",
  storageBucket: "discipulapp-8d99c.appspot.com",
  messagingSenderId: "14467379651",
  appId: "1:14467379651:web:9cd9e632474fb9dedcc412",
  measurementId: "G-65VZ57LGFH"
};

const app = initializeApp(firebaseConfig);

console.log('✅ Firebase conectado:', app.name);
console.log('📦 Proyecto:', firebaseConfig.projectId);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
