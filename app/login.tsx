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
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import ChurchLogo from '@/components/ChurchLogo';


import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { signIn: firebaseSignIn, signInWithGoogle, signInWithApple } = useFirebaseAuth();

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.replace('/home');
      } else {
        setError(result.error || 'Error al iniciar sesión con Google');
      }
    } catch (err) {
      console.error('Error en Google sign in:', err);
      setError('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithApple();
      if (result.success) {
        router.replace('/home');
      } else {
        setError(result.error || 'Error al iniciar sesión con Apple');
      }
    } catch (err) {
      console.error('Error en Apple sign in:', err);
      setError('Error al iniciar sesión con Apple');
    } finally {
      setLoading(false);
    }
  };

  const LogoContainer = Platform.OS !== 'web' || isDesktop ? BlurView : View;
  const FormContainer = Platform.OS !== 'web' || isDesktop ? BlurView : View;
  const DesktopWrapper = (Platform.OS !== 'web' || isDesktop) ? BlurView : View;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <ImageBackground
        source={{ uri: 'https://r2-pub.rork.com/generated-images/035ea3e7-932e-4497-a7e6-8c848edf1244.png' }}
        style={[styles.backgroundImage, { paddingTop: insets.top }]}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
          style={styles.keyboardView}
          enabled={Platform.OS !== 'web'}
        >
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
            showsVerticalScrollIndicator={false}
          >
            <DesktopWrapper 
              {...((Platform.OS !== 'web' || isDesktop) ? { intensity: Platform.OS === 'ios' ? 50 : 60, tint: 'light' as const } : {})}
              style={[styles.contentWrapper, isDesktop && styles.contentWrapperDesktop]}
            >
            <LogoContainer 
              {...((Platform.OS !== 'web' || isDesktop) ? { intensity: Platform.OS === 'ios' ? 50 : 60, tint: 'light' as const } : {})}
              style={styles.logoContainer}
            >
              <ChurchLogo size={isDesktop ? 120 : 100} />
              <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Bienvenido</Text>
              <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>Inicia sesión en tu cuenta</Text>
            </LogoContainer>

            <FormContainer 
              {...((Platform.OS !== 'web' || isDesktop) ? { intensity: Platform.OS === 'ios' ? 50 : 60, tint: 'light' as const } : {})}
              style={[styles.formContainer, isDesktop && styles.formContainerDesktop]}
            >
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Correo o usuario</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu correo o usuario"
                  placeholderTextColor="#9CA3AF"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="identifier-input"
                  accessibilityLabel="Campo de correo o usuario"
                  accessibilityHint="Ingresa tu correo electrónico o nombre de usuario"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  testID="password-input"
                  accessibilityLabel="Campo de contraseña"
                  accessibilityHint="Ingresa tu contraseña"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(prev => !prev)} 
                  accessibilityRole="button" 
                  testID="toggle-password-visibility"
                  accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              testID="login-button"
              accessibilityRole="button"
              accessibilityLabel="Botón de iniciar sesión"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Autenticación con Google y Apple - Deshabilitada temporalmente */}
            {/* Para habilitar, descomenta este bloque y configura Firebase correctamente */}
            {/*
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continuar con</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={loading}
                testID="google-signin-button"
                accessibilityRole="button"
                accessibilityLabel="Iniciar sesión con Google"
              >
                <Image 
                  source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              {(Platform.OS === 'ios' || Platform.OS === 'web') && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={handleAppleSignIn}
                  disabled={loading}
                  testID="apple-signin-button"
                  accessibilityRole="button"
                  accessibilityLabel="Iniciar sesión con Apple"
                >
                  <Image 
                    source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/apple.svg' }}
                    style={styles.appleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              )}
            </View>
            */}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => router.push('/register')}
              accessibilityRole="button"
              accessibilityLabel="Crear una cuenta nueva"
            >
              <Text style={styles.registerButtonText}>Crear una cuenta</Text>
            </TouchableOpacity>

            </FormContainer>
            </DesktopWrapper>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  scrollContentDesktop: {
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  contentWrapper: {
    width: '100%',
  },
  contentWrapperDesktop: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 28,
    padding: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  titleDesktop: {
    fontSize: 36,
    marginTop: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#F3F4F6',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  subtitleDesktop: {
    fontSize: 18,
    marginTop: 12,
    color: '#F3F4F6',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 28,
    padding: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  formContainerDesktop: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    padding: 0,
    marginTop: 0,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  registerButtonText: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
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
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    gap: 10,
  },
  socialButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  appleIcon: {
    width: 20,
    height: 20,
  },
});
