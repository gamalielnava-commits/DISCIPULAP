import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  updatePassword,
  sendEmailVerification
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
      return result.user;
    }
    // For mobile, you would need to implement Google Sign-In with expo-auth-session
    // This is a placeholder for mobile implementation
    throw new Error('Google Sign-In not implemented for mobile yet');
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Usuario no autenticado');

    try {
      // Reauthenticate on web/mobile by signing in again
      await signInWithEmailAndPassword(auth, user.email, currentPassword);
    } catch (e) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Update password
    await updatePassword(user, newPassword);
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
    const collections = ['users','members','groups','attendance','resources','announcements','zones','groupMemberRoles','sermons','sermonSeries','customPermissions'];
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
}