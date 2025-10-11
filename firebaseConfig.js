import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyATOSjjO73YgRz80bBUPa4OK0rEBov0mCU',
  authDomain: 'discipulapp-8d99c.firebaseapp.com',
  projectId: 'discipulapp-8d99c',
  storageBucket: 'discipulapp-8d99c.appspot.com',
  messagingSenderId: '144673796951',
  appId: '1:144673796951:web:9cd9e632474fb9dedcc412',
  measurementId: 'G-65VZ57LGFH',
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

console.log('✅ Firebase conectado:', app.name);
console.log('📦 Proyecto:', firebaseConfig.projectId);

export const db = getFirestore(app);
export const storage = getStorage(app);

let auth;
if (Platform.OS === 'web') {
  const { getAuth, setPersistence, browserLocalPersistence } = require('firebase/auth');
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((e) => {
    console.warn('No se pudo establecer persistencia del auth en web:', e?.message || e);
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };

export const IS_FIREBASE_CONFIGURED = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);

export default app;
