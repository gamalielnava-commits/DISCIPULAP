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
    if (IS_FIREBASE_CONFIGURED) {
      console.log('Firebase configured: skipping automatic default admin creation');
    } else {
      console.warn('Firebase not configured. Using local auth only.');
    }

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
  }, [setUser, setIsAuthenticated]);

  const signIn = async (identifier: string, password: string) => {
    try {
      if (!IS_FIREBASE_CONFIGURED) {
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
          return { success: true };
        }
        return { success: false, error: 'Credenciales incorrectas. Usuario: admin, Contraseña: Admin123' };
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
        const newUser: User = {
          id: Date.now().toString(),
          email,
          nombre: userData.nombre ?? 'Usuario',
          apellido: userData.apellido ?? '',
          role: 'miembro',
          status: 'activo',
          telefono: userData.telefono ?? '',
          fechaNacimiento: userData.fechaNacimiento ?? '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        setUser(newUser);
        setIsAuthenticated(true);
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
      await AuthService.signOut();
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