import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { Platform } from 'react-native';

const env = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'discipulapp-8d99c.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'discipulapp-8d99c',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'discipulapp-8d99c.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '14467379651',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:14467379651:web:9cd9e632474fb9dedcc412',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-65VZ57LGFH',
};

function looksValidFirebaseConfig(e) {
  const isPlaceholder = (v) => typeof v === 'string' && /your-actual|invalid|^0(?::|$)/i.test(v);
  const apiOk = typeof e.apiKey === 'string' && e.apiKey.startsWith('AIza') && !isPlaceholder(e.apiKey);
  const authOk = typeof e.authDomain === 'string' && e.authDomain.includes('firebaseapp.com') && !isPlaceholder(e.authDomain);
  const projOk = typeof e.projectId === 'string' && e.projectId.length > 3 && !isPlaceholder(e.projectId);
  const bucketOk = typeof e.storageBucket === 'string' && e.storageBucket.includes('.appspot.com') && !isPlaceholder(e.storageBucket);
  const msgOk = typeof e.messagingSenderId === 'string' && /\d+/.test(e.messagingSenderId || '') && !isPlaceholder(e.messagingSenderId);
  const appOk = typeof e.appId === 'string' && e.appId.includes(':') && !isPlaceholder(e.appId);
  return apiOk && authOk && projOk && bucketOk && msgOk && appOk;
}

export const IS_FIREBASE_CONFIGURED = looksValidFirebaseConfig(env);

// Firebase configuration
const firebaseConfig = IS_FIREBASE_CONFIGURED
  ? {
      apiKey: env.apiKey,
      authDomain: env.authDomain,
      projectId: env.projectId,
      storageBucket: env.storageBucket,
      messagingSenderId: env.messagingSenderId,
      appId: env.appId,
      measurementId: env.measurementId,
    }
  : {
      apiKey: 'invalid',
      authDomain: 'invalid',
      projectId: 'invalid',
      storageBucket: 'invalid',
      messagingSenderId: '0',
      appId: '0:0:web:invalid',
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Log Firebase connection status
if (IS_FIREBASE_CONFIGURED) {
  console.log('Firebase conectado:', app.name);
  console.log('Proyecto:', firebaseConfig.projectId);
} else {
  console.warn('Firebase no está configurado correctamente. Verifica las variables de entorno.');
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (__DEV__ && Platform.OS !== 'web') {
  // Uncomment these lines if you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;