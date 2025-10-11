import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Auth, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyATOSjjO73YgRz80bBUPa4OK0rEBov0mCU',
  authDomain: 'discipulapp-8d99c.firebaseapp.com',
  projectId: 'discipulapp-8d99c',
  storageBucket: 'discipulapp-8d99c.appspot.com',
  messagingSenderId: '144673796951',
  appId: '1:144673796951:web:9cd9e632474fb9dedcc412',
  measurementId: 'G-65VZ57LGFH',
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

console.log('✅ Firebase conectado:', app.name);
console.log('📦 Proyecto:', firebaseConfig.projectId);

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export const auth: Auth = getAuth(app);

export const IS_FIREBASE_CONFIGURED = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);

export default app;
