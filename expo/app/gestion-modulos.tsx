import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, BookOpen, Edit, Trash2, Upload, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';
import { Modulo } from '@/constants/modulo-santidad';

export default function GestionModulosScreen() {
  const { isDarkMode, user } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    loadModulos();
  }, []);

  const loadModulos = async () => {
    try {
      const stored = await AsyncStorage.getItem('custom_modulos');
      if (stored) {
        setModulos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error cargando módulos:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        Alert.alert(
          'Archivo seleccionado',
          `${file.name} está listo para procesar. Presiona "Crear Módulo con IA" para continuar.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error seleccionando documento:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };



  const createModuloWithAI = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Por favor, selecciona un archivo primero');
      return;
    }

    setIsCreating(true);
    setIsProcessingFile(true);

    try {
      let fileContent = '';
      let fileBase64 = '';

      if (selectedFile.mimeType === 'text/plain' && selectedFile.uri) {
        fileContent = await FileSystem.readAsStringAsync(selectedFile.uri);
      } else if (selectedFile.uri) {
        fileBase64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const result = await trpcClient.modulos.create.mutate({
        fileName: selectedFile.name,
        fileContent: fileContent || undefined,
        fileBase64: fileBase64 || undefined,
        fileMimeType: selectedFile.mimeType,
        userId: user?.id || 'admin',
      });

      if (result.success && result.modulo) {
        const updatedModulos = [...modulos, result.modulo];
        setModulos(updatedModulos);
        await AsyncStorage.setItem('custom_modulos', JSON.stringify(updatedModulos));

        Alert.alert(
          '¡Éxito!',
          result.message || 'Módulo creado exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCreateForm(false);
                setSelectedFile(null);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo crear el módulo');
      }
    } catch (error) {
      console.error('Error creando módulo:', error);
      Alert.alert('Error', 'Ocurrió un error al crear el módulo');
    } finally {
      setIsCreating(false);
      setIsProcessingFile(false);
    }
  };

  const deleteModulo = async (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este módulo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedModulos = modulos.filter(m => m.id !== id);
              setModulos(updatedModulos);
              await AsyncStorage.setItem('custom_modulos', JSON.stringify(updatedModulos));
              Alert.alert('Éxito', 'Módulo eliminado exitosamente');
            } catch (error) {
              console.error('Error eliminando módulo:', error);
              Alert.alert('Error', 'No se pudo eliminar el módulo');
            }
          },
        },
      ]
    );
  };

  if (showCreateForm) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader
          title="Crear Módulo"
          subtitle="Sube una guía y la IA creará el módulo"
          showBackButton
          onBackPress={() => {
            setShowCreateForm(false);
            setSelectedFile(null);
          }}
        />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
              📄 Sube la guía del módulo
            </Text>
            <Text style={[styles.sectionDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
              Selecciona un archivo (PDF, Word, imagen o texto) con la guía de discipulado. La IA extraerá automáticamente todo el contenido.
            </Text>

            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb' }]}
              onPress={pickDocument}
              disabled={isCreating}
            >
              <Upload size={20} color="#ffffff" />
              <Text style={styles.uploadButtonText}>
                {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <View style={[styles.fileInfo, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
                <FileText size={20} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
                <Text style={[styles.fileName, { color: isDarkMode ? '#e2e8f0' : '#1e293b' }]}>
                  {selectedFile.name}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)' }]}>
            <Text style={[styles.infoTitle, { color: '#22c55e' }]}>
              🤖 La IA procesará automáticamente:
            </Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#86efac' : '#16a34a' }]}>
              • Extracción de texto de PDFs, imágenes y documentos{'\n'}
              • Todas las preguntas de la guía{'\n'}
              • Estructura de lecciones y secciones{'\n'}
              • Versículos y referencias bíblicas{'\n'}
              • Objetivos, desafíos y principios{'\n'}
              • Formato idéntico a los módulos existentes
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: isCreating ? '#94a3b8' : '#22c55e',
                opacity: isCreating || !selectedFile ? 0.5 : 1,
              },
            ]}
            onPress={createModuloWithAI}
            disabled={isCreating || !selectedFile}
          >
            {isCreating ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.createButtonText}>
                  {isProcessingFile ? 'Procesando archivo...' : 'Creando módulo...'}
                </Text>
              </>
            ) : (
              <>
                <Plus size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Crear Módulo con IA</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Gestión de Módulos" subtitle="Administra los módulos de discipulado" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb' }]}
          onPress={() => setShowCreateForm(true)}
        >
          <Plus size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Crear Nuevo Módulo</Text>
        </TouchableOpacity>

        {modulos.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <BookOpen size={64} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            <Text style={[styles.emptyTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
              No hay módulos personalizados
            </Text>
            <Text style={[styles.emptyDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
              Crea tu primer módulo subiendo una guía de discipulado
            </Text>
          </View>
        ) : (
          modulos.map((modulo) => (
            <View
              key={modulo.id}
              style={[styles.moduloCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}
            >
              <View style={styles.moduloHeader}>
                <View style={[styles.moduloIcon, { backgroundColor: '#8b5cf6' }]}>
                  <BookOpen size={24} color="#ffffff" />
                </View>
                <View style={styles.moduloInfo}>
                  <Text style={[styles.moduloTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
                    {modulo.titulo}
                  </Text>
                  <Text style={[styles.moduloDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                    {modulo.descripcion}
                  </Text>
                  <Text style={[styles.moduloMeta, { color: isDarkMode ? '#a78bfa' : '#7c3aed' }]}>
                    {modulo.lecciones.length} lección(es)
                  </Text>
                </View>
              </View>

              <View style={styles.moduloActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}
                  onPress={() => Alert.alert('Editar', 'Función de edición próximamente')}
                >
                  <Edit size={18} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}
                  onPress={() => deleteModulo(modulo.id)}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 32,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  moduloCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduloHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduloIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduloInfo: {
    flex: 1,
  },
  moduloTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduloDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  moduloMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  moduloActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 200,
    maxHeight: 400,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
