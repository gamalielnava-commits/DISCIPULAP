import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, LogOut } from 'lucide-react-native';

import ChurchLogo from '@/components/ChurchLogo';


import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { signIn: firebaseSignIn, signOut: firebaseSignOut } = useFirebaseAuth();

  const handleLogin = async () => {
    const id = identifier?.trim() ?? '';
    const pass = password?.trim() ?? '';
    if (!id || !pass) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await firebaseSignIn(id, pass);
      if (result.success) {
        router.replace('/home');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut();
      // The auth state change will handle the redirect
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  // Invitado deshabilitado a solicitud: solo login con correo/usuario + contraseña

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <ChurchLogo size={80} />
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo o usuario"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                testID="identifier-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="password-input"
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} accessibilityRole="button" testID="toggle-password-visibility">
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              testID="login-button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <LogIn size={20} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => router.push('/register')}
            >
              <UserPlus size={20} color="#7C3AED" />
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            </TouchableOpacity>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C3AED',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#E9D5FF',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  registerButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestButtonText: {
    color: '#6B7280',
    fontSize: 16,
    textDecorationLine: 'underline',
  },

});