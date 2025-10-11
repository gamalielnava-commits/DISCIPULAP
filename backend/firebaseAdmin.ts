import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'discipulapp-8d99c';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    const config: any = {
      projectId,
      storageBucket: `${projectId}.appspot.com`,
    };

    if (privateKey && clientEmail) {
      config.credential = cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      });
    }
    
    adminApp = initializeApp(config);
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
