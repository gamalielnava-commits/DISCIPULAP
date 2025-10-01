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
import { Mail, Lock, User, Phone, ArrowLeft, UserPlus, Calendar, AtSign } from 'lucide-react-native';
import ChurchLogo from '@/components/ChurchLogo';
import { User as UserType } from '@/types/auth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    telefono: '',
    fechaNacimiento: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp } = useFirebaseAuth();

  const handleRegister = async () => {
    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.fechaNacimiento) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validar formato de fecha
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
    if (!dateRegex.test(formData.fechaNacimiento)) {
      setError('Por favor ingrese una fecha válida (DD/MM/AAAA)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData: Partial<UserType> = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        username: formData.username ? formData.username.trim().toLowerCase() : undefined,
        role: 'miembro',
        status: 'activo',
      };

      const result = await signUp(formData.email, formData.password, userData);
      
      if (result.success) {
        setSuccess(true);
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
        <View style={styles.successContainer}>
          <ChurchLogo size={80} />
          <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
          <Text style={styles.successText}>
            Tu cuenta ha sido creada. Ya puedes iniciar sesión.
          </Text>
          <Text style={styles.successSubtext}>
            Serás redirigido al inicio de sesión.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <ChurchLogo size={60} />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre *"
                placeholderTextColor="#9CA3AF"
                value={formData.nombre}
                onChangeText={(text) => setFormData({...formData, nombre: text})}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Apellido *"
                placeholderTextColor="#9CA3AF"
                value={formData.apellido}
                onChangeText={(text) => setFormData({...formData, apellido: text})}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico *"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <AtSign size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario (opcional)"
                placeholderTextColor="#9CA3AF"
                value={formData.username}
                onChangeText={(text) => setFormData({...formData, username: text})}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Teléfono (opcional)"
                placeholderTextColor="#9CA3AF"
                value={formData.telefono}
                onChangeText={(text) => setFormData({...formData, telefono: text})}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Fecha de nacimiento (DD/MM/AAAA) *"
                placeholderTextColor="#9CA3AF"
                value={formData.fechaNacimiento}
                onChangeText={(text) => {
                  // Auto-format date as user types
                  let formatted = text.replace(/[^0-9]/g, '');
                  if (formatted.length >= 3 && formatted.length <= 4) {
                    formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                  } else if (formatted.length >= 5) {
                    formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
                  }
                  setFormData({...formData, fechaNacimiento: formatted});
                }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña *"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña *"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <UserPlus size={20} color="#FFFFFF" />
                  <Text style={styles.registerButtonText}>Registrarse</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginLinkButton}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLinkButton: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
  },
  successText: {
    fontSize: 16,
    color: '#E9D5FF',
    marginTop: 12,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: '#E9D5FF',
    marginTop: 8,
    textAlign: 'center',
  },
});