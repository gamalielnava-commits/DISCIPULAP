import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  User as FirebaseUser,
  updatePassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { Platform } from 'react-native';
import { auth, db, storage, IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { User } from '@/types/auth';

export { db, auth, storage, IS_FIREBASE_CONFIGURED };

export const REQUIRE_EMAIL_VERIFICATION = false as const;

// Auth Service
export class AuthService {
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (REQUIRE_EMAIL_VERIFICATION && !user.emailVerified) {
      await signOut(auth);
      const err: any = new Error('Email no verificado');
      err.code = 'auth/unverified-email';
      throw err;
    }
    return user;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const usersCol = collection(db, 'users');
    const qRef = query(usersCol, where('username', '==', username), limit(1));
    const snap = await getDocs(qRef);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...(d.data() as any) } as User;
    }
    return null;
  }

  static async hasAnyUser(): Promise<boolean> {
    const colRef = collection(db, 'users');
    const qRef = query(colRef, limit(1));
    const snap = await getDocs(qRef);
    return !snap.empty;
  }

  static async signUp(email: string, password: string, userData: Partial<User>): Promise<FirebaseUser> {
    if (userData.username) {
      const existing = await this.getUserByUsername(userData.username);
      if (existing) {
        const err: any = new Error('Nombre de usuario ya está en uso');
        err.code = 'auth/username-already-in-use';
        throw err;
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const firstUser = !(await this.hasAnyUser());
    // Check if this is the default admin user
    const isDefaultAdmin = email === 'admin@gmail.com';
    const roleToSave = isDefaultAdmin ? 'admin' : (firstUser ? 'admin' : (userData.role ?? 'miembro'));

    await this.createUserProfile(userCredential.user.uid, {
      ...userData,
      role: roleToSave,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (REQUIRE_EMAIL_VERIFICATION && userCredential.user.email) {
      try {
        await sendEmailVerification(userCredential.user);
      } catch (e) {
        console.warn('No se pudo enviar verificación de correo:', e);
      }
    }
    
    return userCredential.user;
  }

  static async createDefaultAdminUser(): Promise<void> {
    if (!IS_FIREBASE_CONFIGURED) {
      console.warn('Firebase not configured. Skipping default admin creation.');
      return;
    }
    try {
      const usersCol = collection(db, 'users');
      const qRef = query(usersCol, where('email', '==', 'admin@gmail.com'), limit(1));
      const snap = await getDocs(qRef);
      if (!snap.empty) {
        console.log('Default admin user already exists');
        return;
      }
      const adminData: Partial<User> = {
        nombre: 'Administrador',
        apellido: 'Principal',
        role: 'admin',
        status: 'activo',
        telefono: '000-000-0000',
        fechaNacimiento: '01/01/1980',
      };
      await this.signUp('admin@gmail.com', '123456', adminData);
      console.log('Default admin user created successfully');
    } catch (error) {
      console.error('Error creating default admin user:', error);
    }
  }

  static async signInWithGoogle(): Promise<FirebaseUser | null> {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        const existingProfile = await this.getUserProfile(result.user.uid);
        if (!existingProfile) {
          const basicProfile: Partial<User> = {
            nombre: result.user.displayName?.split(' ')[0] || 'Usuario',
            apellido: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            email: result.user.email || '',
            role: 'miembro',
            status: 'activo',
          };
          await this.createUserProfile(result.user.uid, basicProfile);
        }
      }
      
      return result.user;
    } else {
      const { makeRedirectUri } = await import('expo-auth-session');
      const { maybeCompleteAuthSession } = await import('expo-web-browser');
      const { exchangeCodeAsync, AuthRequest } = await import('expo-auth-session');
      
      maybeCompleteAuthSession();
      
      const redirectUri = makeRedirectUri({
        scheme: 'discipuladoapp',
        path: 'redirect'
      });
      
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };
      
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
      
      const request = new AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
      });
      
      const result = await request.promptAsync(discovery);
      
      if (result.type === 'success') {
        const { code } = result.params;
        const tokenResult = await exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery
        );
        
        const credential = GoogleAuthProvider.credential(
          tokenResult.idToken,
          tokenResult.accessToken
        );
        
        const userCredential = await signInWithCredential(auth, credential);
        
        if (userCredential.user) {
          const existingProfile = await this.getUserProfile(userCredential.user.uid);
          if (!existingProfile) {
            const basicProfile: Partial<User> = {
              nombre: userCredential.user.displayName?.split(' ')[0] || 'Usuario',
              apellido: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
              email: userCredential.user.email || '',
              role: 'miembro',
              status: 'activo',
            };
            await this.createUserProfile(userCredential.user.uid, basicProfile);
          }
        }
        
        return userCredential.user;
      }
      
      return null;
    }
  }

  static async signInWithApple(): Promise<FirebaseUser | null> {
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      const { signInAsync } = await import('expo-apple-authentication');
      const crypto = await import('expo-crypto');
      
      try {
        const nonce = crypto.randomUUID();
        const hashedNonce = await crypto.digestStringAsync(
          crypto.CryptoDigestAlgorithm.SHA256,
          nonce
        );
        
        const appleCredential = await signInAsync({
          requestedScopes: [
            (await import('expo-apple-authentication')).AppleAuthenticationScope.FULL_NAME,
            (await import('expo-apple-authentication')).AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        });
        
        const { identityToken } = appleCredential;
        if (!identityToken) {
          throw new Error('No se pudo obtener el token de identidad');
        }
        
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
          idToken: identityToken,
          rawNonce: nonce,
        });
        
        const userCredential = await signInWithCredential(auth, credential);
        
        if (userCredential.user) {
          const existingProfile = await this.getUserProfile(userCredential.user.uid);
          if (!existingProfile) {
            const basicProfile: Partial<User> = {
              nombre: appleCredential.fullName?.givenName || userCredential.user.displayName?.split(' ')[0] || 'Usuario',
              apellido: appleCredential.fullName?.familyName || userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
              email: appleCredential.email || userCredential.user.email || '',
              role: 'miembro',
              status: 'activo',
            };
            await this.createUserProfile(userCredential.user.uid, basicProfile);
          }
        }
        
        return userCredential.user;
      } catch (e: any) {
        if (e.code === 'ERR_REQUEST_CANCELED') {
          return null;
        }
        throw e;
      }
    }
    
    throw new Error('Apple Sign-In solo está disponible en iOS y web');
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Usuario no autenticado');

    try {
      await signInWithEmailAndPassword(auth, user.email, currentPassword);
    } catch (_e) {
      throw new Error('Contraseña actual incorrecta');
    }

    await updatePassword(user, newPassword);
  }

  static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static async createUserProfile(uid: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userData);
  }

  static async getUserProfile(uid: string): Promise<User | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: uid, ...userSnap.data() } as User;
    }
    return null;
  }

  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...updates, updatedAt: new Date() });
  }
}

// Firestore Service
export class FirestoreService {
  static async create(collectionName: string, data: any): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  static async read(collectionName: string, docId: string): Promise<any | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docId, ...docSnap.data() };
    }
    return null;
  }

  static async update(collectionName: string, docId: string, updates: any): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date() });
  }

  static async delete(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }

  static async getAll(collectionName: string, orderByField?: string): Promise<any[]> {
    const collectionRef = collection(db, collectionName);
    
    if (orderByField) {
      const q = query(collectionRef, orderBy(orderByField, 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getWhere(collectionName: string, field: string, operator: any, value: any): Promise<any[]> {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// Storage Service
export class StorageService {
  static async uploadFile(path: string, file: Blob | Uint8Array | ArrayBuffer): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  static async uploadImage(path: string, imageUri: string): Promise<string> {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return this.uploadFile(path, blob);
  }

  static async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  static getDownloadURL(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  }
}

// Example usage functions for your app
export class ChurchDataService {
  static async resetAll(): Promise<void> {
    const collections = [
      'users',
      'members',
      'groups',
      'attendance',
      'resources',
      'announcements',
      'zones',
      'groupMemberRoles',
      'sermons',
      'sermonSeries',
      'customPermissions',
      'userProgress',
      'discipleship',
      'analytics',
      'stats'
    ];
    for (const col of collections) {
      const docs = await FirestoreService.getAll(col);
      for (const d of docs) {
        try {
          await FirestoreService.delete(col, d.id);
        } catch (e) {
          console.error(`Error deleting ${col}/${d.id}`, e);
        }
      }
    }
  }

  // Members
  static async createMember(memberData: any): Promise<string> {
    return FirestoreService.create('members', memberData);
  }

  static async getMembers(): Promise<any[]> {
    return FirestoreService.getAll('members', 'createdAt');
  }

  static async updateMember(memberId: string, updates: any): Promise<void> {
    return FirestoreService.update('members', memberId, updates);
  }

  static async deleteMember(memberId: string): Promise<void> {
    return FirestoreService.delete('members', memberId);
  }

  // Groups
  static async createGroup(groupData: any): Promise<string> {
    return FirestoreService.create('groups', groupData);
  }

  static async getGroups(): Promise<any[]> {
    return FirestoreService.getAll('groups', 'createdAt');
  }

  static async updateGroup(groupId: string, updates: any): Promise<void> {
    return FirestoreService.update('groups', groupId, updates);
  }

  static async deleteGroup(groupId: string): Promise<void> {
    return FirestoreService.delete('groups', groupId);
  }

  // Attendance
  static async createAttendance(attendanceData: any): Promise<string> {
    return FirestoreService.create('attendance', attendanceData);
  }

  static async getAttendance(groupId?: string): Promise<any[]> {
    if (groupId) {
      return FirestoreService.getWhere('attendance', 'grupoId', '==', groupId);
    }
    return FirestoreService.getAll('attendance', 'fecha');
  }

  // Resources
  static async createResource(resourceData: any): Promise<string> {
    return FirestoreService.create('resources', resourceData);
  }

  static async getResources(): Promise<any[]> {
    return FirestoreService.getAll('resources', 'createdAt');
  }

  // Announcements
  static async createAnnouncement(announcementData: any): Promise<string> {
    return FirestoreService.create('announcements', announcementData);
  }

  static async getAnnouncements(): Promise<any[]> {
    return FirestoreService.getAll('announcements', 'fecha');
  }

  // File uploads
  static async uploadMemberPhoto(memberId: string, imageUri: string): Promise<string> {
    const path = `members/${memberId}/profile.jpg`;
    return StorageService.uploadImage(path, imageUri);
  }

  static async uploadResourceFile(resourceId: string, fileUri: string, fileName: string): Promise<string> {
    const path = `resources/${resourceId}/${fileName}`;
    return StorageService.uploadImage(path, fileUri);
  }

  // Progress backup
  static async upsertUserProgress(params: {
    userId: string;
    moduleId: string;
    lessonId: string;
    status: 'iniciado' | 'completado' | 'pendiente';
    score?: number;
    answers?: Record<string, any>;
    completedAt?: Date | null;
  }): Promise<string> {
    const { userId, moduleId, lessonId, ...rest } = params;
    const existing = await FirestoreService.getWhere(
      'userProgress',
      'key',
      '==',
      `${userId}:${moduleId}:${lessonId}`
    );

    const payload = {
      userId,
      moduleId,
      lessonId,
      key: `${userId}:${moduleId}:${lessonId}`,
      ...rest,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await FirestoreService.update('userProgress', existing[0].id, payload);
      return existing[0].id as string;
    }
    return FirestoreService.create('userProgress', {
      ...payload,
      createdAt: new Date(),
    });
  }

  static async getUserProgress(userId: string): Promise<any[]> {
    return FirestoreService.getWhere('userProgress', 'userId', '==', userId);
  }

  static async getUserModuleProgress(userId: string, moduleId: string): Promise<any[]> {
    const all = await FirestoreService.getWhere('userProgress', 'userId', '==', userId);
    return all.filter(p => p?.moduleId === moduleId);
  }

  // Discipleship backup (notes, checkpoints)
  static async addDiscipleshipEntry(entry: {
    userId: string;
    moduleId: string;
    lessonId?: string;
    note?: string;
    checkpoint?: 'inicio' | 'medio' | 'fin';
    extra?: Record<string, any>;
  }): Promise<string> {
    return FirestoreService.create('discipleship', {
      ...entry,
      timestamp: new Date(),
    });
  }

  static async listDiscipleshipEntries(userId: string, moduleId?: string): Promise<any[]> {
    if (moduleId) {
      const byUser = await FirestoreService.getWhere('discipleship', 'userId', '==', userId);
      return byUser.filter(e => e?.moduleId === moduleId);
    }
    return FirestoreService.getWhere('discipleship', 'userId', '==', userId);
  }

  // Sermons backup
  static async createSermon(sermon: {
    title: string;
    speaker: string;
    date: string;
    seriesId?: string;
    description?: string;
    coverUrl?: string;
    audioUrl?: string;
    durationSec?: number;
    tags?: string[];
  }): Promise<string> {
    return FirestoreService.create('sermons', sermon);
  }

  static async updateSermon(id: string, updates: Partial<{
    title: string; speaker: string; date: string; description: string; coverUrl: string; audioUrl: string; durationSec: number; tags: string[];
  }>): Promise<void> {
    return FirestoreService.update('sermons', id, updates);
  }

  static async listSermons(): Promise<any[]> {
    return FirestoreService.getAll('sermons', 'date');
  }

  static async deleteSermon(id: string): Promise<void> {
    return FirestoreService.delete('sermons', id);
  }

  static async uploadSermonAudio(sermonId: string, fileUri: string, fileName: string): Promise<string> {
    const path = `sermons/${sermonId}/${fileName}`;
    return StorageService.uploadImage(path, fileUri);
  }

  static async uploadSermonCover(sermonId: string, imageUri: string): Promise<string> {
    const path = `sermons/${sermonId}/cover.jpg`;
    return StorageService.uploadImage(path, imageUri);
  }

  // Statistics backup (event log)
  static async logStat(event: {
    type: 'sermon_play' | 'sermon_complete' | 'lesson_open' | 'lesson_complete' | 'app_open' | string;
    userId?: string;
    payload?: Record<string, any>;
  }): Promise<string> {
    return FirestoreService.create('analytics', {
      ...event,
      createdAt: new Date(),
    });
  }

  static async getStatsByType(type: string, since?: Date): Promise<any[]> {
    const all = await FirestoreService.getWhere('analytics', 'type', '==', type);
    if (!since) return all;
    return all.filter(e => {
      const d = (e?.createdAt as any) as Date | { seconds?: number } | undefined;
      if (!d) return false;
      const date = (d as any)?.seconds ? new Date((d as any).seconds * 1000) : new Date(String(d));
      return date.getTime() >= since.getTime();
    });
  }
}