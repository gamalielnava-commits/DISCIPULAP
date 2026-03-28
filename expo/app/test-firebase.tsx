import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { db, storage, IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

type TestResult = {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message?: string;
};

export default function TestFirebaseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Configuración de Firebase', status: 'pending' },
    { name: 'Conexión a Firestore', status: 'pending' },
    { name: 'Escritura en Firestore', status: 'pending' },
    { name: 'Lectura de Firestore', status: 'pending' },
    { name: 'Autenticación (Registro)', status: 'pending' },
    { name: 'Autenticación (Login)', status: 'pending' },
    { name: 'Storage disponible', status: 'pending' },
  ]);
  const [running, setRunning] = useState(false);

  const updateTest = (index: number, status: TestResult['status'], message?: string) => {
    setTests(prev => {
      const newTests = [...prev];
      newTests[index] = { ...newTests[index], status, message };
      return newTests;
    });
  };

  const runTests = async () => {
    setRunning(true);
    
    // Test 1: Configuración
    updateTest(0, 'running');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (IS_FIREBASE_CONFIGURED) {
      updateTest(0, 'success', 'Firebase está configurado correctamente');
    } else {
      updateTest(0, 'error', 'Firebase NO está configurado');
      setRunning(false);
      return;
    }

    // Test 2: Conexión a Firestore
    updateTest(1, 'running');
    try {
      const testCollection = collection(db, 'test_connection');
      await getDocs(testCollection);
      updateTest(1, 'success', 'Conexión a Firestore exitosa');
    } catch (error: any) {
      updateTest(1, 'error', `Error: ${error.message}`);
    }

    // Test 3: Escritura en Firestore
    updateTest(2, 'running');
    let testDocId: string | null = null;
    try {
      const testCollection = collection(db, 'test_write');
      const docRef = await addDoc(testCollection, {
        test: true,
        timestamp: new Date(),
        message: 'Test de escritura'
      });
      testDocId = docRef.id;
      updateTest(2, 'success', `Documento creado: ${docRef.id}`);
    } catch (error: any) {
      updateTest(2, 'error', `Error: ${error.message}`);
    }

    // Test 4: Lectura de Firestore
    updateTest(3, 'running');
    try {
      const testCollection = collection(db, 'test_write');
      const snapshot = await getDocs(testCollection);
      updateTest(3, 'success', `${snapshot.size} documentos leídos`);
      
      // Limpiar documento de prueba
      if (testDocId) {
        try {
          await deleteDoc(doc(db, 'test_write', testDocId));
        } catch (_e) {
          console.log('No se pudo eliminar documento de prueba');
        }
      }
    } catch (error: any) {
      updateTest(3, 'error', `Error: ${error.message}`);
    }

    // Test 5: Registro de usuario
    updateTest(4, 'running');
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'Test123456';
    try {
      const authInstance = getAuth();
      const userCredential = await createUserWithEmailAndPassword(authInstance, testEmail, testPassword);
      console.log('Usuario creado:', userCredential.user.uid);
      updateTest(4, 'success', 'Usuario de prueba creado');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        updateTest(4, 'success', 'Autenticación funcional (email ya existe)');
      } else {
        updateTest(4, 'error', `Error: ${error.message}`);
      }
    }

    // Test 6: Login
    updateTest(5, 'running');
    try {
      const authInstance = getAuth();
      await signInWithEmailAndPassword(authInstance, testEmail, testPassword);
      updateTest(5, 'success', 'Login exitoso');
      
      await signOut(authInstance);
    } catch (error: any) {
      updateTest(5, 'error', `Error: ${error.message}`);
    }

    // Test 7: Storage
    updateTest(6, 'running');
    try {
      if (storage) {
        updateTest(6, 'success', 'Storage está disponible');
      } else {
        updateTest(6, 'error', 'Storage no está disponible');
      }
    } catch (error: any) {
      updateTest(6, 'error', `Error: ${error.message}`);
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <XCircle size={24} color="#EF4444" />;
      case 'running':
        return <ActivityIndicator size={24} color="#3B82F6" />;
      default:
        return <AlertCircle size={24} color="#9CA3AF" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'running':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  };

  const allSuccess = tests.every(t => t.status === 'success');
  const hasErrors = tests.some(t => t.status === 'error');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prueba de Firebase</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Estado de la Conexión</Text>
          <Text style={styles.infoText}>
            Esta prueba verificará que Firebase esté correctamente configurado y funcionando.
          </Text>
        </View>

        {tests.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <Text style={styles.testName}>{test.name}</Text>
            </View>
            {test.message && (
              <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                {test.message}
              </Text>
            )}
          </View>
        ))}

        {!running && allSuccess && (
          <View style={styles.successCard}>
            <CheckCircle size={48} color="#10B981" />
            <Text style={styles.successTitle}>¡Todo funciona correctamente!</Text>
            <Text style={styles.successText}>
              Firebase está configurado y todas las funciones están operativas.
              Los usuarios pueden registrarse e iniciar sesión sin problemas.
            </Text>
          </View>
        )}

        {!running && hasErrors && (
          <View style={styles.errorCard}>
            <XCircle size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Se encontraron errores</Text>
            <Text style={styles.errorText}>
              Revisa los mensajes de error arriba para identificar el problema.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.runButton, running && styles.runButtonDisabled]}
          onPress={runTests}
          disabled={running}
        >
          {running ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.runButtonText}>Ejecutando pruebas...</Text>
            </>
          ) : (
            <Text style={styles.runButtonText}>
              {tests.some(t => t.status !== 'pending') ? 'Ejecutar de nuevo' : 'Iniciar pruebas'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  testMessage: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 36,
  },
  successCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 12,
  },
  successText: {
    fontSize: 14,
    color: '#047857',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  runButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
