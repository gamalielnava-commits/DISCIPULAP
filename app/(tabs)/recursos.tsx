import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Upload, 
  Trash2,
  Eye,
  FolderOpen,
  File,
  Lock,
  Search,
  Filter,
  Plus
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import AppHeader from '@/components/AppHeader';

interface Recurso {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  fechaSubida: string;
  subidoPor: string;
  uri: string;
  categoria: string;
}

export default function RecursosScreen() {
  const { user, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todos');
  const [cargando, setCargando] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const esAdmin = user?.role === 'admin';
  const esLider = user?.role === 'lider' || user?.role === 'supervisor';
  const tieneAcceso = true;

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: FolderOpen },
    { id: 'documentos', nombre: 'Documentos', icono: FileText },
    { id: 'videos', nombre: 'Videos', icono: Video },
    { id: 'imagenes', nombre: 'Imágenes', icono: ImageIcon },
    { id: 'audio', nombre: 'Audio', icono: Music },
  ];

  useEffect(() => {
    cargarRecursos();
  }, []);

  const cargarRecursos = async () => {
    try {
      setCargando(true);
      const recursosGuardados = await AsyncStorage.getItem('recursos_iglesia');
      if (recursosGuardados) {
        setRecursos(JSON.parse(recursosGuardados));
      }
    } catch (error) {
      console.error('Error cargando recursos:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarRecursos = async (nuevosRecursos: Recurso[]) => {
    try {
      await AsyncStorage.setItem('recursos_iglesia', JSON.stringify(nuevosRecursos));
    } catch (error) {
      console.error('Error guardando recursos:', error);
    }
  };

  const subirRecurso = async () => {
    if (!esAdmin && !esLider) {
      Alert.alert('Sin permisos', 'No tienes permisos para subir recursos');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Primero intentar con currentUser (usado por AppProvider)
        let userData = await AsyncStorage.getItem('currentUser');
        if (!userData) {
          // Fallback a userData por compatibilidad
          userData = await AsyncStorage.getItem('userData');
        }
        const user = userData ? JSON.parse(userData) : { nombre: 'Usuario' };
        
        const extension = asset.name.split('.').pop()?.toLowerCase() || '';
        let categoria = 'documentos';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
          categoria = 'imagenes';
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
          categoria = 'videos';
        } else if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(extension)) {
          categoria = 'audio';
        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
          categoria = 'documentos';
        }

        const nuevoRecurso: Recurso = {
          id: Date.now().toString(),
          nombre: asset.name,
          tipo: extension,
          tamano: asset.size || 0,
          fechaSubida: new Date().toISOString(),
          subidoPor: user.nombre || user.name || 'Usuario',
          uri: asset.uri,
          categoria: categoria,
        };

        const nuevosRecursos = [...recursos, nuevoRecurso];
        setRecursos(nuevosRecursos);
        await guardarRecursos(nuevosRecursos);
        
        Alert.alert('Éxito', 'Recurso subido correctamente');
      }
    } catch (error) {
      console.error('Error subiendo recurso:', error);
      Alert.alert('Error', 'No se pudo subir el recurso');
    }
  };

  const eliminarRecurso = async (id: string) => {
    if (!esAdmin) {
      Alert.alert('Sin permisos', 'Solo los administradores pueden eliminar recursos');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este recurso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const nuevosRecursos = recursos.filter(r => r.id !== id);
            setRecursos(nuevosRecursos);
            await guardarRecursos(nuevosRecursos);
            Alert.alert('Éxito', 'Recurso eliminado');
          },
        },
      ]
    );
  };

  const verRecurso = async (recurso: Recurso) => {
    try {
      if (Platform.OS === 'web') {
        window.open(recurso.uri, '_blank');
      } else {
        const supported = await Linking.canOpenURL(recurso.uri);
        if (supported) {
          await Linking.openURL(recurso.uri);
        } else {
          Alert.alert('Error', 'No se puede abrir este tipo de archivo');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el recurso');
    }
  };

  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getIconoTipo = (tipo: string) => {
    const extension = tipo.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return ImageIcon;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
      return Video;
    } else if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(extension)) {
      return Music;
    } else {
      return FileText;
    }
  };

  const recursosFiltrados = recursos.filter(r => {
    const matchesCategory = categoriaActiva === 'todos' || r.categoria === categoriaActiva;
    const matchesSearch = !searchText || 
      r.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      r.tipo.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Removed access restriction check

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Recursos" 
        subtitle="Materiales para tu crecimiento espiritual"
        rightActions={
          (esAdmin || esLider) ? (
            <TouchableOpacity
              style={styles.uploadButtonHeader}
              onPress={subirRecurso}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar recursos..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriasContainer}
          contentContainerStyle={styles.categoriasContent}
        >
          {categorias.map((categoria) => {
            const Icono = categoria.icono;
            return (
              <TouchableOpacity
                key={categoria.id}
                style={[
                  styles.categoriaChip,
                  { backgroundColor: categoriaActiva === categoria.id ? colors.primary : colors.surface }
                ]}
                onPress={() => setCategoriaActiva(categoria.id)}
              >
                <Icono 
                  size={16} 
                  color={categoriaActiva === categoria.id ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.categoriaTexto,
                    { color: categoriaActiva === categoria.id ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {categoria.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Removed duplicate upload button since it's now in the header */}

        {/* Lista de recursos */}
        <View style={styles.recursosContainer}>
          {cargando ? (
            <View style={styles.cargandoContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : recursosFiltrados.length === 0 ? (
            <View style={styles.sinRecursos}>
              <File size={48} color={colors.textSecondary} />
              <Text style={[styles.sinRecursosTexto, { color: colors.textSecondary }]}>
                {searchText ? 'No se encontraron recursos' : 'No hay recursos en esta categoría'}
              </Text>
              {(esAdmin || esLider) && !searchText && (
                <Text style={[styles.sinRecursosSubtexto, { color: colors.textSecondary }]}>
                  Presiona el botón + para agregar archivos
                </Text>
              )}
            </View>
        ) : (
          <View style={styles.recursosLista}>
            {recursosFiltrados.map((recurso) => {
              const Icono = getIconoTipo(recurso.tipo);
              return (
                  <View
                    key={recurso.id}
                    style={[styles.recursoCard, { backgroundColor: colors.surface }]}
                  >
                    <View style={[styles.recursoIcono, { backgroundColor: colors.primary + '10' }]}>
                      <Icono size={32} color={colors.primary} />
                    </View>
                    <View style={styles.recursoInfo}>
                      <Text style={[styles.recursoNombre, { color: colors.text }]} numberOfLines={1}>
                        {recurso.nombre}
                      </Text>
                      <View style={styles.recursoMeta}>
                        <Text style={[styles.recursoMetaTexto, { color: colors.textSecondary }]}>
                          {formatearTamano(recurso.tamano)}
                        </Text>
                        <Text style={[styles.recursoMetaTexto, { color: colors.textSecondary }]}>
                          • {formatearFecha(recurso.fechaSubida)}
                        </Text>
                      </View>
                      <Text style={[styles.recursoSubidoPor, { color: colors.textSecondary }]}>
                        Por: {recurso.subidoPor}
                      </Text>
                    </View>
                    <View style={styles.recursoAcciones}>
                      <TouchableOpacity
                        style={styles.accionBoton}
                        onPress={() => verRecurso(recurso)}
                      >
                        <Eye size={20} color={colors.primary} />
                      </TouchableOpacity>
                      {esAdmin && (
                        <TouchableOpacity
                          style={styles.accionBoton}
                          onPress={() => eliminarRecurso(recurso.id)}
                        >
                          <Trash2 size={20} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
              );
            })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  uploadButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriasContainer: {
    marginBottom: 20,
    maxHeight: 50,
  },
  categoriasContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  recursosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoriaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoriaChipDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  categoriaChipActiva: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoriaChipActivaDark: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoriaTexto: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500' as const,
  },
  categoriaTextoDark: {
    color: '#9ca3af',
  },
  categoriaTextoActivo: {
    color: '#fff',
  },
  botonSubir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  botonSubirDark: {
    backgroundColor: '#2563eb',
  },
  botonSubirTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  recursosLista: {
    marginBottom: 20,
  },
  recursoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recursoCardDark: {
    backgroundColor: '#1f2937',
  },
  recursoIcono: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recursoIconoDark: {
    backgroundColor: '#1e3a8a',
  },
  recursoInfo: {
    flex: 1,
  },
  recursoNombre: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  recursoNombreDark: {
    color: '#f9fafb',
  },
  recursoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  recursoMetaTexto: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  recursoMetaTextoDark: {
    color: '#9ca3af',
  },
  recursoSubidoPor: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  recursoSubidoPorDark: {
    color: '#6b7280',
  },
  recursoAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accionBoton: {
    padding: 8,
    marginLeft: 8,
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  sinRecursos: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  sinRecursosTexto: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  sinRecursosTextoDark: {
    color: '#6b7280',
  },
  sinRecursosSubtexto: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  sinRecursosSubtextoDark: {
    color: '#6b7280',
  },
  sinAcceso: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  sinAccesoTitulo: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  sinAccesoTituloDark: {
    color: '#f9fafb',
  },
  sinAccesoTexto: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  sinAccesoTextoDark: {
    color: '#9ca3af',
  },
});