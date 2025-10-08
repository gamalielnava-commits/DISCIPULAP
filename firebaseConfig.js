import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Autenticación deshabilitada. Mantén sólo Firestore y Storage.

const firebaseConfig = {
  apiKey: 'AIzaSyATOSjjO73YgRz80bBUPa4OK0rEBov0mCU',
  authDomain: 'discipulapp-8d99c.firebaseapp.com',
  projectId: 'discipulapp-8d99c',
  storageBucket: 'discipulapp-8d99c.firebasestorage.app',
  messagingSenderId: '144673796951',
  appId: '1:144673796951:web:9cd9e632474fb9dedcc412',
  measurementId: 'G-65VZ57LGFH',
};

const app = initializeApp(firebaseConfig);

console.log('✅ Firebase conectado:', app.name);
console.log('📦 Proyecto:', firebaseConfig.projectId);

// auth removido intencionalmente
export const auth = undefined;
export const db = getFirestore(app);
export const storage = getStorage(app);

export const IS_FIREBASE_CONFIGURED = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);

export default app;
