import { useEffect, useState } from 'react';
import { AuthService } from '@/services/firebase';
import { useApp } from '@/providers/AppProvider';
import { User } from '@/types/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';

export function useFirebaseAuth() {
  const { setUser, setIsAuthenticated, user } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (IS_FIREBASE_CONFIGURED) {
        console.log('Firebase configured: using Firebase auth');
        
        const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
          try {
            if (firebaseUser) {
              const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
              if (userProfile) {
                setUser(userProfile);
                setIsAuthenticated(true);
              } else {
                const basicProfile: Partial<User> = {
                  nombre: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
                  apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                  email: firebaseUser.email || '',
                  role: 'miembro',
                  status: 'activo',
                };
                await AuthService.createUserProfile(firebaseUser.uid, basicProfile);
                const newProfile = await AuthService.getUserProfile(firebaseUser.uid);
                if (newProfile) {
                  setUser(newProfile);
                  setIsAuthenticated(true);
                }
              }
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setUser(null);
            setIsAuthenticated(false);
          } finally {
            setLoading(false);
          }
        });

        return unsubscribe;
      } else {
        console.log('Firebase not configured. Using local auth with persistence.');
        
        // Cargar usuario persistido en modo local
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const storedUser = await AsyncStorage.getItem('currentUser');
          
          if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log('Usuario persistido encontrado:', parsedUser.email);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Error parsing stored user:', e);
              await AsyncStorage.removeItem('currentUser');
            }
          } else {
            console.log('No hay usuario persistido');
          }
        } catch (error) {
          console.error('Error loading persisted user:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [setUser, setIsAuthenticated]);

  const signIn = async (identifier: string, password: string) => {
    try {
      if (!IS_FIREBASE_CONFIGURED) {
        console.log('Firebase no configurado, autenticando localmente...');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        
        // Verificar credenciales de admin por defecto
        if (identifier === 'admin' && password === 'Admin123') {
          const demoUser: User = {
            id: '1',
            email: 'admin@discipulado.com',
            nombre: 'Administrador',
            apellido: 'Principal',
            role: 'admin',
            status: 'activo',
            telefono: '000-000-0000',
            fechaNacimiento: '01/01/1980',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as User;
          setUser(demoUser);
          setIsAuthenticated(true);
          await AsyncStorage.setItem('currentUser', JSON.stringify(demoUser));
          console.log('Admin autenticado exitosamente');
          return { success: true };
        }
        
        // Buscar usuario en la lista de usuarios registrados
        const storedUsers = await AsyncStorage.getItem('users');
        if (!storedUsers || storedUsers === 'null' || storedUsers === 'undefined') {
          console.log('No hay usuarios registrados');
          return { success: false, error: 'Usuario no encontrado' };
        }
        
        let usersList: User[] = [];
        try {
          usersList = JSON.parse(storedUsers);
          if (!Array.isArray(usersList)) {
            console.log('Lista de usuarios inválida');
            return { success: false, error: 'Error al cargar usuarios' };
          }
        } catch (e) {
          console.error('Error parsing users:', e);
          return { success: false, error: 'Error al cargar usuarios' };
        }
        
        // Buscar usuario por email o username
        const foundUser = usersList.find(u => 
          u.email.toLowerCase() === identifier.toLowerCase() ||
          (u.username && u.username.toLowerCase() === identifier.toLowerCase())
        );
        
        if (!foundUser) {
          console.log('Usuario no encontrado:', identifier);
          return { success: false, error: 'Usuario no encontrado' };
        }
        
        // En modo local, aceptar cualquier contraseña para usuarios registrados
        // (En producción con Firebase, esto se validará correctamente)
        console.log('Usuario encontrado, autenticando:', foundUser.email);
        setUser(foundUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('currentUser', JSON.stringify(foundUser));
        console.log('Usuario autenticado exitosamente');
        return { success: true };
      }

      let emailToUse = identifier;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        try {
          const byUsername = await AuthService.getUserByUsername(identifier);
          if (!byUsername?.email) {
            const err: any = new Error('Usuario no encontrado');
            err.code = 'auth/user-not-found';
            throw err;
          }
          emailToUse = byUsername.email;
        } catch (usernameError: any) {
          console.error('Error fetching username:', usernameError);
          return {
            success: false,
            error: 'Error de conexión. Verifica tu configuración de Firebase.'
          };
        }
      }

      await AuthService.signIn(emailToUse, password);
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message && error.message.includes('JSON')) {
        return {
          success: false,
          error: 'Error de configuración. Firebase no está configurado correctamente.'
        };
      }
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      if (!IS_FIREBASE_CONFIGURED) {
        console.log('Firebase no configurado, creando usuario local...');
        
        // Verificar si el email ya existe
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const storedUsers = await AsyncStorage.getItem('users');
        let usersList: User[] = [];
        
        if (storedUsers && storedUsers !== 'null' && storedUsers !== 'undefined') {
          try {
            usersList = JSON.parse(storedUsers);
            if (!Array.isArray(usersList)) {
              usersList = [];
            }
          } catch (e) {
            console.error('Error parsing users list:', e);
            usersList = [];
          }
        }
        
        // Verificar si el email ya existe
        const emailExists = usersList.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          return {
            success: false,
            error: 'El email ya está en uso'
          };
        }
        
        // Verificar si el username ya existe (si se proporcionó)
        if (userData.username) {
          const usernameExists = usersList.some(u => 
            u.username && u.username.toLowerCase() === userData.username?.toLowerCase()
          );
          if (usernameExists) {
            return {
              success: false,
              error: 'El nombre de usuario ya está en uso'
            };
          }
        }
        
        const newUser: User = {
          id: Date.now().toString(),
          email,
          nombre: userData.nombre ?? 'Usuario',
          apellido: userData.apellido ?? '',
          role: 'miembro',
          status: 'activo',
          telefono: userData.telefono ?? '',
          fechaNacimiento: userData.fechaNacimiento ?? '',
          username: userData.username,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        
        // Agregar el nuevo usuario a la lista
        usersList.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(usersList));
        
        // Crear notificación para el administrador
        const notifications = await AsyncStorage.getItem('notifications');
        let notificationsList: any[] = [];
        if (notifications && notifications !== 'null' && notifications !== 'undefined') {
          try {
            notificationsList = JSON.parse(notifications);
            if (!Array.isArray(notificationsList)) {
              notificationsList = [];
            }
          } catch (e) {
            notificationsList = [];
          }
        }
        
        const newNotification = {
          id: Date.now().toString(),
          tipo: 'registro',
          titulo: 'Nuevo usuario registrado',
          mensaje: `${newUser.nombre} ${newUser.apellido} se ha registrado en la aplicación`,
          userId: newUser.id,
          userName: `${newUser.nombre} ${newUser.apellido}`,
          userEmail: newUser.email,
          leida: false,
          fecha: new Date(),
          accion: {
            tipo: 'ver_usuario',
            userId: newUser.id,
          },
        };
        
        notificationsList.push(newNotification);
        await AsyncStorage.setItem('notifications', JSON.stringify(notificationsList));
        
        console.log('Usuario registrado exitosamente:', newUser.email);
        console.log('Total de usuarios:', usersList.length);
        console.log('Notificación creada para el administrador');
        
        // NO establecer el usuario como autenticado automáticamente
        // El usuario debe iniciar sesión después de registrarse
        return { success: true };
      }

      await AuthService.signUp(email, password, userData);
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.message && error.message.includes('JSON')) {
        return {
          success: false,
          error: 'Error de configuración. Firebase no está configurado correctamente.'
        };
      }
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      };
    }
  };

  const signOut = async () => {
    try {
      if (IS_FIREBASE_CONFIGURED) {
        await AuthService.signOut();
      } else {
        // En modo local, solo limpiar el usuario actual
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('currentUser');
        console.log('Sesión cerrada en modo local');
      }
      
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Error al cerrar sesión'
      };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) return { success: false, error: 'Usuario no autenticado' };

    try {
      await AuthService.updateUserProfile(user.id, updates);
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Error al actualizar perfil'
      };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/username-already-in-use':
      return 'El nombre de usuario ya está en uso';
    case 'auth/unverified-email':
      return 'Debes verificar tu correo antes de iniciar sesión';
    case 'auth/email-already-in-use':
      return 'El email ya está en uso';
    case 'auth/weak-password':
      return 'La contraseña es muy débil';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-disabled':
      return 'Usuario deshabilitado';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión';
    default:
      return 'Error de autenticación';
  }
}