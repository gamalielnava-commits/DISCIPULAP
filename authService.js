import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const register = async (email, password, displayName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    console.log('Usuario registrado exitosamente:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error.code, error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario autenticado exitosamente:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.code, error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('Usuario cerró sesión exitosamente');
  } catch (error) {
    console.error('Error al cerrar sesión:', error.code, error.message);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Correo de restablecimiento enviado a:', email);
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento:', error.code, error.message);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Usuario autenticado:', user.email);
      callback(user);
    } else {
      console.log('No hay usuario autenticado');
      callback(null);
    }
  });
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
