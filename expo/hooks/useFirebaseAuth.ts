import { useEffect, useState } from 'react';
import { AuthService } from '@/services/firebase';
import { useApp } from '@/providers/AppProvider';
import { User } from '@/types/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';

export function useFirebaseAuth() {
  const { setUser, setIsAuthenticated, user, isAuthenticated, isLoading: appIsLoading } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        if (IS_FIREBASE_CONFIGURED) {
          console.log('Firebase configured: using Firebase auth');
          
          unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
            if (!mounted) return;
            
            try {
              if (firebaseUser) {
                const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
                if (userProfile && mounted) {
                  setUser(userProfile);
                  setIsAuthenticated(true);
                } else if (mounted) {
                  // Determinar el rol basado en el email
                  const isDefaultAdmin = firebaseUser.email === 'admin@gmail.com' || firebaseUser.email === 'admin@discipulapp.com';
                  const basicProfile: Partial<User> = {
                    nombre: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
                    apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                    email: firebaseUser.email || '',
                    role: isDefaultAdmin ? 'admin' : 'miembro',
                    status: 'activo',
                  };
                  try {
                    await AuthService.createUserProfile(firebaseUser.uid, basicProfile);
                  } catch (e: any) {
                    console.warn('No se pudo crear perfil de usuario:', e?.code || String(e));
                  } finally {
                    let newProfile: User | null = null;
                    try {
                      newProfile = await AuthService.getUserProfile(firebaseUser.uid);
                    } catch (_err) {
                      newProfile = null;
                    }
                    // Determinar el rol basado en el email
                    const isDefaultAdmin = firebaseUser.email === 'admin@gmail.com' || firebaseUser.email === 'admin@discipulapp.com';
                    const fallbackProfile: User = {
                      id: firebaseUser.uid,
                      email: firebaseUser.email ?? '',
                      nombre: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
                      apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                      role: isDefaultAdmin ? 'admin' : 'miembro',
                      status: 'activo',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    } as User;
                    const profileToUse = (newProfile ?? fallbackProfile) as User;
                    if (mounted) {
                      setUser(profileToUse);
                      setIsAuthenticated(true);
                    }
                  }
                }
              } else if (mounted) {
                setUser(null);
                setIsAuthenticated(false);
              }
            } catch (error: any) {
              console.error('Error in auth state change:', error);
              if (mounted) {
                if (firebaseUser && (error?.code === 'permission-denied' || error?.code === 'failed-precondition')) {
                  console.warn('Permisos insuficientes para leer/escribir perfil, continuando como autenticado.');
                  // Determinar el rol basado en el email
                  const isDefaultAdmin = firebaseUser.email === 'admin@gmail.com' || firebaseUser.email === 'admin@discipulapp.com';
                  const fallbackProfile: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    nombre: firebaseUser.displayName?.split(' ')[0] || 'Usuario',
                    apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                    role: isDefaultAdmin ? 'admin' : 'miembro',
                    status: 'activo',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  } as User;
                  setUser(fallbackProfile);
                  setIsAuthenticated(true);
                } else {
                  setUser(null);
                  setIsAuthenticated(false);
                }
              }
            } finally {
              if (mounted) {
                setLoading(false);
              }
            }
          });
        } else {
          console.log('Firebase not configured. Using local auth with persistence.');
          
          // En modo local, el AppProvider ya carga el usuario desde AsyncStorage
          // Esperamos a que AppProvider termine de cargar antes de marcar loading como false
          if (!appIsLoading && mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUser, setIsAuthenticated, appIsLoading]);

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

      console.log('🔥 Registrando usuario en Firebase:', email);
      console.log('📋 Datos del usuario:', { ...userData, password: '***' });
      
      await AuthService.signUp(email, password, userData);
      
      console.log('✅ Usuario registrado exitosamente en Firebase');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      console.error('📝 Error code:', error?.code);
      console.error('📝 Error message:', error?.message);
      console.error('📝 Error stack:', error?.stack);
      
      const errorCode = error?.code ?? '';
      
      // Manejar errores específicos de configuración
      if (error.message && error.message.includes('JSON')) {
        return {
          success: false,
          error: 'Error de configuración. Firebase no está configurado correctamente.'
        };
      }
      
      // Manejar error de método de autenticación deshabilitado
      if (errorCode === 'auth/operation-not-allowed') {
        console.error('⚠️ Email/Password no está habilitado en Firebase Console');
        return {
          success: false,
          error: 'El registro está deshabilitado. Por favor, contacta al administrador para habilitar Email/Password en Firebase Console.'
        };
      }
      
      // Manejar error de email ya en uso
      if (errorCode === 'auth/email-already-in-use') {
        return {
          success: false,
          error: 'Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.'
        };
      }
      
      // Manejar error de contraseña débil
      if (errorCode === 'auth/weak-password') {
        return {
          success: false,
          error: 'La contraseña es muy débil. Debe tener al menos 6 caracteres.'
        };
      }
      
      // Manejar error de email inválido
      if (errorCode === 'auth/invalid-email') {
        return {
          success: false,
          error: 'El correo electrónico no es válido. Verifica el formato.'
        };
      }
      
      // Manejar error de red
      if (errorCode === 'auth/network-request-failed') {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
        };
      }
      
      // Manejar error de dominio no autorizado
      if (errorCode === 'auth/unauthorized-domain') {
        console.error('⚠️ Dominio no autorizado en Firebase Console');
        return {
          success: false,
          error: 'Dominio no autorizado. El administrador debe agregar este dominio en Firebase Console → Authentication → Settings → Authorized domains.'
        };
      }
      
      return {
        success: false,
        error: getAuthErrorMessage(errorCode)
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

  const resetPassword = async (email: string) => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Ingresa un correo válido' };
      }
      if (!IS_FIREBASE_CONFIGURED) {
        console.log('Firebase no configurado, simulando envío de restablecimiento...');
        return { success: true };
      }
      await AuthService.resetPassword(email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: getAuthErrorMessage(error.code) };
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
    resetPassword,
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
    case 'auth/operation-not-allowed':
      return 'Método de autenticación deshabilitado. Activa Email/Password en Firebase.';
    case 'auth/unauthorized-domain':
      return 'Dominio no autorizado. Agrega tu dominio (discipulapp.org) en Firebase > Authentication > Settings > Authorized domains.';
    case 'auth/configuration-not-found':
      return 'Configuración de autenticación faltante en Firebase.';
    case 'auth/admin-restricted-operation':
      return 'Operación restringida por configuración de Firebase.';
    default:
      return 'Error de autenticación';
  }
}