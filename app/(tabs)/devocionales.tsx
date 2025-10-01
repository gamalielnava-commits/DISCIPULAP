import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Check,
  Upload,
  ChevronRight,
  X,

  Share2,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

import AppHeader from '@/components/AppHeader';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';



import AsyncStorage from '@react-native-async-storage/async-storage';

interface Devocional {
  id: string;
  titulo: string;
  textoBase: string;
  versiculos: string[];
  desarrollo: string[];
  preguntas: Pregunta[];
  practicaSemanal: string[];
  oracion: string;
  planLectura?: string[];
  tema: string[];
  autor: string;
  fechaPublicacion: Date;
  visibilidad: 'todos' | 'tema' | 'autor';
  lecturas: number;
  escuchas: number;
  completados: number;
  coverImage?: string;
  imagePrompt?: string;
  audioUrl?: string;
  youtubeUrl?: string;
  isPersonal?: boolean;
}

interface DevocionalPersonal {
  id: string;
  fecha: Date;
  titulo: string;
  textoBase: string;
  ensenanzaBiblica: string;
  aplicacion: string;
  oracion: string;
  versiculos?: string[];
  autor: string;
  fechaCreacion: Date;
}

interface Pregunta {
  id: string;
  texto: string;
  respuesta?: string;
}

interface ProgresoDevocional {
  devocionalId: string;
  completado: boolean;
  respuestas: { [preguntaId: string]: string };
  practicaCompletada: boolean[];
  fechaInicio: Date;
  fechaCompletado?: Date;
}

type VozTipo = 'masculina' | 'femenina';
type AcentoTipo = 'neutral' | 'es-MX' | 'es-ES' | 'es-US' | 'es-AR' | 'es-CO' | 'es-VE';

export default function DevocionalesScreen() {
  const { user, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const isAdmin = user?.role === 'admin';

  const [devocionales, setDevocionales] = useState<Devocional[]>([]);
  const [devocionalesPersonales, setDevocionalesPersonales] = useState<DevocionalPersonal[]>([]);
  const [filteredDevocionales, setFilteredDevocionales] = useState<Devocional[]>([]);
  const [selectedDevocional, setSelectedDevocional] = useState<Devocional | null>(null);
  const [selectedTab, setSelectedTab] = useState<'general' | 'personal'>('general');
  const [searchText, setSearchText] = useState('');
  const [selectedTema, setSelectedTema] = useState<string>('todos');
  const [selectedAutor, setSelectedAutor] = useState<string>('todos');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [progreso, setProgreso] = useState<ProgresoDevocional[]>([]);

  const [borrador, setBorrador] = useState<Partial<Devocional> | null>(null);
  const [borradorPersonal, setBorradorPersonal] = useState<Partial<DevocionalPersonal> | null>(null);
  const [uploadedText, setUploadedText] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);



  const temas = ['Todos', 'Juventud', 'Familia', 'Matrimonios', 'Fe', 'Oración', 'Esperanza', 'Amor', 'Perdón'];
  const autores = useMemo(() => {
    const uniqueAuthors = ['Todos', ...new Set(devocionales.map(d => d.autor))];
    return uniqueAuthors;
  }, [devocionales]);

  useEffect(() => {
    loadDevocionales();
    loadDevocionalesPersonales();
    loadProgreso();
  }, []);

  useEffect(() => {
    filterDevocionales();
  }, [devocionales, searchText, selectedTema, selectedAutor]);

  const loadDevocionalesPersonales = async () => {
    try {
      const stored = await AsyncStorage.getItem(`devocionales_personales_${user?.id}`);
      if (stored) {
        setDevocionalesPersonales(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading devocionales personales:', error);
    }
  };

  const loadDevocionales = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('devocionales');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDevocionales(parsed);
      } else {
        // Datos de ejemplo
        const ejemplos: Devocional[] = [
          {
            id: '1',
            titulo: 'El Poder de la Oración',
            textoBase: 'La oración es nuestra conexión directa con Dios, un momento íntimo donde podemos expresar nuestras alegrías, preocupaciones y agradecimientos.',
            versiculos: [
              'Filipenses 4:6-7 - No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios y denle gracias. Y la paz de Dios, que sobrepasa todo entendimiento, cuidará sus corazones y sus pensamientos en Cristo Jesús.',
              '1 Tesalonicenses 5:17 - Oren sin cesar.',
              'Mateo 6:9-13 - Ustedes deben orar así: Padre nuestro que estás en el cielo, santificado sea tu nombre...'
            ],
            desarrollo: [
              'La oración no es simplemente una lista de peticiones que presentamos a Dios. Es una conversación bidireccional donde también escuchamos Su voz a través de Su Palabra y el Espíritu Santo.',
              'Cuando oramos con fe, reconocemos nuestra dependencia de Dios y Su soberanía sobre todas las circunstancias de nuestra vida.',
              'La oración persistente transforma nuestro corazón, alineando nuestros deseos con la voluntad de Dios y fortaleciéndonos en medio de las pruebas.',
            ],
            preguntas: [
              { id: 'p1', texto: '¿Cuánto tiempo dedicas diariamente a la oración?' },
              { id: 'p2', texto: '¿Qué obstáculos encuentras para mantener una vida de oración constante?' },
              { id: 'p3', texto: '¿Cómo has visto la respuesta de Dios a tus oraciones?' },
              { id: 'p4', texto: '¿Qué aspectos de tu vida de oración te gustaría mejorar?' },
            ],
            practicaSemanal: [
              'Establece un horario fijo de oración cada día',
              'Lleva un diario de oración para registrar peticiones y respuestas',
              'Practica 5 minutos de silencio después de orar para escuchar a Dios',
            ],
            oracion: 'Padre celestial, enséñame a orar como Jesús oró. Ayúdame a buscar tu rostro cada día y a confiar en que escuchas cada una de mis palabras. Fortalece mi fe y dame perseverancia en la oración. En el nombre de Jesús, Amén.',
            planLectura: ['Salmo 5', 'Lucas 11:1-13', 'Santiago 5:13-18'],
            tema: ['Fe', 'Oración'],
            autor: 'Pastor Juan Carlos',
            fechaPublicacion: new Date(),
            visibilidad: 'todos',
            lecturas: 45,
            escuchas: 23,
            completados: 15,
          },
        ];
        setDevocionales(ejemplos);
        await AsyncStorage.setItem('devocionales', JSON.stringify(ejemplos));
      }
    } catch (error) {
      console.error('Error loading devocionales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgreso = async () => {
    try {
      const stored = await AsyncStorage.getItem(`progreso_devocionales_${user?.id}`);
      if (stored) {
        setProgreso(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading progreso:', error);
    }
  };



  const filterDevocionales = () => {
    let filtered = [...devocionales];

    // Only apply filters if user has actively selected them
    if (searchText) {
      filtered = filtered.filter(
        d =>
          d.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
          d.textoBase.toLowerCase().includes(searchText.toLowerCase()) ||
          d.versiculos.some(v => v.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Only filter by theme if not 'todos' (default shows all)
    if (selectedTema !== 'todos') {
      filtered = filtered.filter(d => d.tema.includes(selectedTema));
    }

    // Only filter by author if not 'todos' (default shows all)
    if (selectedAutor !== 'todos') {
      filtered = filtered.filter(d => d.autor === selectedAutor);
    }

    setFilteredDevocionales(filtered);
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        // Aquí normalmente leerías el contenido del archivo
        // Por ahora simulamos con texto de ejemplo
        setUploadedText('Contenido del documento cargado...\n\nEste es un ejemplo de texto que sería extraído del documento.');
        setShowUploadModal(false);
        Alert.alert('Éxito', 'Documento cargado correctamente');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'No se pudo cargar el documento');
    }
  };

  const generateWithAI = async () => {
    if (!uploadedText) {
      Alert.alert('Error', 'Por favor carga un documento o pega texto primero');
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente que genera devocionales cristianos estructurados. Debes crear contenido inspirador y bíblicamente sólido.',
            },
            {
              role: 'user',
              content: `Basándote en el siguiente texto, genera un devocional con esta estructura:
              1. Título atractivo
              2. Texto base (resumen de 300-500 palabras)
              3. 3-4 versículos bíblicos clave
              4. Desarrollo/Reflexión (3-5 párrafos)
              5. 4-6 preguntas de reflexión
              6. 2-3 acciones prácticas para la semana
              7. Una oración de cierre
              8. Plan de lectura opcional (3-5 pasajes bíblicos)
              
              Texto fuente: ${uploadedText}
              
              Responde en formato JSON con las siguientes claves: titulo, textoBase, versiculos (array), desarrollo (array de párrafos), preguntas (array de objetos con id y texto), practicaSemanal (array), oracion, planLectura (array).`,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.completion) {
        try {
          const devocionalGenerado = JSON.parse(data.completion);
          setBorrador({
            ...devocionalGenerado,
            id: Date.now().toString(),
            tema: ['General'],
            autor: user?.nombre || 'Anónimo',
            fechaPublicacion: new Date(),
            visibilidad: 'todos',
            lecturas: 0,
            escuchas: 0,
            completados: 0,
          });
          setShowEditorModal(true);
        } catch (parseError) {
          // Si no es JSON válido, crear estructura manual
          setBorrador({
            id: Date.now().toString(),
            titulo: 'Nuevo Devocional',
            textoBase: data.completion.substring(0, 500),
            versiculos: ['Juan 3:16'],
            desarrollo: [data.completion],
            preguntas: [
              { id: 'p1', texto: '¿Qué te enseña este pasaje sobre Dios?' },
              { id: 'p2', texto: '¿Cómo puedes aplicar esto a tu vida?' },
            ],
            practicaSemanal: ['Medita en este pasaje cada día', 'Comparte esta enseñanza con alguien'],
            oracion: 'Señor, ayúdame a vivir según tu Palabra. Amén.',
            tema: ['General'],
            autor: user?.nombre || 'Anónimo',
            fechaPublicacion: new Date(),
            visibilidad: 'todos',
            lecturas: 0,
            escuchas: 0,
            completados: 0,
          });
          setShowEditorModal(true);
        }
      }
    } catch (error) {
      console.error('Error generating with AI:', error);
      Alert.alert('Error', 'No se pudo generar el devocional con IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  const saveDevocional = async () => {
    if (!borrador?.titulo || !borrador?.textoBase) {
      Alert.alert('Error', 'Por favor completa al menos el título y texto base');
      return;
    }

    try {
      const nuevoDevocional: Devocional = {
        id: borrador.id || Date.now().toString(),
        titulo: borrador.titulo,
        textoBase: borrador.textoBase,
        versiculos: borrador.versiculos || [],
        desarrollo: borrador.desarrollo || [],
        preguntas: borrador.preguntas || [],
        practicaSemanal: borrador.practicaSemanal || [],
        oracion: borrador.oracion || '',
        planLectura: borrador.planLectura,
        tema: borrador.tema || ['General'],
        autor: borrador.autor || user?.nombre || 'Anónimo',
        fechaPublicacion: borrador.fechaPublicacion || new Date(),
        visibilidad: borrador.visibilidad || 'todos',
        lecturas: borrador.lecturas || 0,
        escuchas: borrador.escuchas || 0,
        completados: borrador.completados || 0,
        coverImage: borrador.coverImage,
        imagePrompt: borrador.imagePrompt,
        audioUrl: borrador.audioUrl,
        youtubeUrl: borrador.youtubeUrl,
      };

      const updated = [...devocionales, nuevoDevocional];
      setDevocionales(updated);
      await AsyncStorage.setItem('devocionales', JSON.stringify(updated));
      
      setShowEditorModal(false);
      setBorrador(null);
      setUploadedText('');
      Alert.alert('Éxito', 'Devocional publicado correctamente');
    } catch (error) {
      console.error('Error saving devocional:', error);
      Alert.alert('Error', 'No se pudo guardar el devocional');
    }
  };



  const renderDevocionalCard = ({ item }: { item: Devocional }) => {
    const progresoItem = progreso.find(p => p.devocionalId === item.id);
    const isCompleted = progresoItem?.completado;

    return (
      <TouchableOpacity
        style={[
          styles.devocionalCard,
          { backgroundColor: colors.surface },
          isCompleted && styles.completedCard,
        ]}
        onPress={() => setSelectedDevocional(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.titulo}
            </Text>
            {isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
                <Check size={12} color="white" />
              </View>
            )}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>

        <Text style={[styles.cardText, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.textoBase}
        </Text>

        <View style={styles.cardTags}>
          {item.tema.slice(0, 2).map((tema, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tema}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <BookOpen size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.lecturas}</Text>
            </View>

          </View>
          <Text style={[styles.cardAuthor, { color: colors.textSecondary }]}>
            {item.autor}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDevocionalDetail = () => {
    if (!selectedDevocional) return null;

    return (
      <Modal
        visible={!!selectedDevocional}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDevocional(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => {
              setSelectedDevocional(null);
            }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Devocional</Text>
            <View />
          </View>



          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.devocionalTitle, { color: colors.text }]}>
              {selectedDevocional.titulo}
            </Text>

            <View style={styles.devocionalMeta}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Por {selectedDevocional.autor}
              </Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {new Date(selectedDevocional.fechaPublicacion).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Texto Base</Text>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {selectedDevocional.textoBase}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Versículos Clave</Text>
              {selectedDevocional.versiculos.map((versiculo, index) => {
                const [reference, ...textParts] = versiculo.split(' - ');
                const text = textParts.join(' - ');
                return (
                  <View key={index} style={[styles.versiculoCard, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={[styles.versiculoReference, { color: colors.primary }]}>
                      {reference}
                    </Text>
                    {text && (
                      <Text style={[styles.versiculoText, { color: colors.text }]}>
                        {text}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reflexión</Text>
              {selectedDevocional.desarrollo.map((parrafo, index) => (
                <Text key={index} style={[styles.paragraph, { color: colors.textSecondary }]}>
                  {parrafo}
                </Text>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Preguntas de Reflexión</Text>
              {selectedDevocional.preguntas.map((pregunta, index) => (
                <View key={pregunta.id} style={[styles.preguntaCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.preguntaNumero, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.preguntaText, { color: colors.text }]}>
                    {pregunta.texto}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Práctica de la Semana</Text>
              {selectedDevocional.practicaSemanal.map((practica, index) => (
                <View key={index} style={styles.practicaItem}>
                  <View style={[styles.practicaBullet, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.practicaText, { color: colors.textSecondary }]}>
                    {practica}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Oración</Text>
              <View style={[styles.oracionCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.oracionText, { color: colors.text }]}>
                  {selectedDevocional.oracion}
                </Text>
              </View>
            </View>

            {selectedDevocional.planLectura && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Plan de Lectura</Text>
                {selectedDevocional.planLectura.map((lectura, index) => (
                  <View key={index} style={styles.lecturaItem}>
                    <BookOpen size={16} color={colors.primary} />
                    <Text style={[styles.lecturaText, { color: colors.textSecondary }]}>
                      {lectura}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={async () => {
                  try {
                    const shareContent = `📖 *${selectedDevocional.titulo}*\n\n${selectedDevocional.textoBase}\n\n🙏 _${selectedDevocional.oracion}_\n\nCompartido desde la App de Discipulado`;
                    
                    await Share.share({
                      message: shareContent,
                      title: selectedDevocional.titulo,
                    });
                  } catch (error) {
                    console.error('Error sharing:', error);
                  }
                }}
              >
                <Share2 size={20} color="white" />
                <Text style={styles.actionButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Alert.alert('Completado', 'Has marcado este devocional como completado');
                  setSelectedDevocional(null);
                }}
              >
                <Check size={20} color="white" />
                <Text style={styles.actionButtonText}>Completar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderUploadModal = () => (
    <Modal
      visible={showUploadModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowUploadModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.uploadModalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.uploadModalTitle, { color: colors.text }]}>Subir Devocional</Text>
          
          <TouchableOpacity
            style={[styles.uploadOption, { backgroundColor: colors.background }]}
            onPress={handleUploadDocument}
          >
            <Upload size={24} color={colors.primary} />
            <Text style={[styles.uploadOptionText, { color: colors.text }]}>Subir Documento</Text>
            <Text style={[styles.uploadOptionDesc, { color: colors.textSecondary }]}>
              PDF, Word o texto plano
            </Text>
          </TouchableOpacity>

          <Text style={[styles.orText, { color: colors.textSecondary }]}>O</Text>

          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Pegar o escribir texto aquí..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            value={uploadedText}
            onChangeText={setUploadedText}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.background }]}
              onPress={() => setShowUploadModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={generateWithAI}
              disabled={generatingAI}
            >
              {generatingAI ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Generar con IA</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPersonalModal = () => (
    <Modal
      visible={showPersonalModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPersonalModal(false)}
    >
      <View style={[styles.editorContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.editorHeader, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => {
            setShowPersonalModal(false);
            setBorradorPersonal(null);

          }}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.editorTitle, { color: colors.text }]}>Mi Devocional Personal</Text>
          <TouchableOpacity onPress={async () => {
            if (!borradorPersonal?.titulo || !borradorPersonal?.textoBase) {
              Alert.alert('Error', 'Por favor completa al menos el título y texto base');
              return;
            }

            const nuevoPersonal: DevocionalPersonal = {
              id: Date.now().toString(),
              fecha: borradorPersonal.fecha || new Date(),
              titulo: borradorPersonal.titulo,
              textoBase: borradorPersonal.textoBase,
              ensenanzaBiblica: borradorPersonal.ensenanzaBiblica || '',
              aplicacion: borradorPersonal.aplicacion || '',
              oracion: borradorPersonal.oracion || '',
              versiculos: [],
              autor: user?.nombre || 'Anónimo',
              fechaCreacion: new Date(),
            };

            const updated = [...devocionalesPersonales, nuevoPersonal];
            setDevocionalesPersonales(updated);
            await AsyncStorage.setItem(`devocionales_personales_${user?.id}`, JSON.stringify(updated));
            
            setShowPersonalModal(false);
            setBorradorPersonal(null);

            Alert.alert('Éxito', 'Devocional personal guardado');
          }}>
            <Check size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editorContent} showsVerticalScrollIndicator={false}>
          <View style={styles.editorSection}>
            <Text style={[styles.editorLabel, { color: colors.text }]}>Fecha</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePickerContainer}>
              {Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 15 + i);
                const isSelected = borradorPersonal?.fecha && 
                  new Date(borradorPersonal.fecha).toDateString() === date.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dateItem,
                      { backgroundColor: colors.surface },
                      isSelected && { backgroundColor: colors.primary },
                      isToday && !isSelected && { borderColor: colors.primary, borderWidth: 2 }
                    ]}
                    onPress={() => setBorradorPersonal({ ...borradorPersonal, fecha: date })}
                  >
                    <Text style={[
                      styles.dateDay,
                      { color: isSelected ? 'white' : colors.textSecondary }
                    ]}>
                      {date.toLocaleDateString('es', { weekday: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={[
                      styles.dateNumber,
                      { color: isSelected ? 'white' : colors.text }
                    ]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[
                      styles.dateMonth,
                      { color: isSelected ? 'white' : colors.textSecondary }
                    ]}>
                      {date.toLocaleDateString('es', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.editorSection}>
            <Text style={[styles.editorLabel, { color: colors.text }]}>Título</Text>
            <TextInput
              style={[styles.editorInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={borradorPersonal?.titulo || ''}
              onChangeText={(text) => setBorradorPersonal({ ...borradorPersonal, titulo: text })}
              placeholder="Título de tu devocional"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.editorSection}>
            <Text style={[styles.editorLabel, { color: colors.text }]}>Texto Principal</Text>
            

            
            <TextInput
              style={[styles.editorTextArea, { backgroundColor: colors.surface, color: colors.text, marginTop: 12 }]}
              value={borradorPersonal?.textoBase || ''}
              onChangeText={(text) => setBorradorPersonal({ ...borradorPersonal, textoBase: text })}
              placeholder="Escribe el texto o reflexión sobre el pasaje"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.editorSection}>
            <Text style={[styles.editorLabel, { color: colors.text }]}>¿Qué enseña de la Biblia?</Text>
            <TextInput
              style={[styles.editorTextArea, { backgroundColor: colors.surface, color: colors.text }]}
              value={borradorPersonal?.ensenanzaBiblica || ''}
              onChangeText={(text) => setBorradorPersonal({ ...borradorPersonal, ensenanzaBiblica: text })}
              placeholder="¿Qué aprendiste de este pasaje? ¿Qué te está enseñando Dios?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.editorSection}>
            <Text style={[styles.editorLabel, { color: colors.text }]}>Aplicación Personal</Text>
            <TextInput
              style={[styles.editorTextArea, { backgroundColor: colors.surface, color: colors.text }]}
              value={borradorPersonal?.aplicacion || ''}
              onChangeText={(text) => setBorradorPersonal({ ...borradorPersonal, aplicacion: text })}
              placeholder="¿Cómo puedes aplicar esto a tu vida diaria? ¿Qué cambios necesitas hacer?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.editorSection}>
            <Text style={[styles.editorLabel, { color: colors.text }]}>Oración</Text>
            <TextInput
              style={[styles.editorTextArea, { backgroundColor: colors.surface, color: colors.text }]}
              value={borradorPersonal?.oracion || ''}
              onChangeText={(text) => setBorradorPersonal({ ...borradorPersonal, oracion: text })}
              placeholder="Escribe tu oración basada en lo que has aprendido"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>


        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditorModal = () => {
    if (!borrador) return null;

    return (
      <Modal
        visible={showEditorModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowEditorModal(false)}
      >
        <View style={[styles.editorContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.editorHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowEditorModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.editorTitle, { color: colors.text }]}>Editar Devocional</Text>
            <TouchableOpacity onPress={saveDevocional}>
              <Check size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editorContent} showsVerticalScrollIndicator={false}>
            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>Título</Text>
              <TextInput
                style={[styles.editorInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={borrador.titulo}
                onChangeText={(text) => setBorrador({ ...borrador, titulo: text })}
                placeholder="Título del devocional"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>Texto Base</Text>
              <TextInput
                style={[styles.editorTextArea, { backgroundColor: colors.surface, color: colors.text }]}
                value={borrador.textoBase}
                onChangeText={(text) => setBorrador({ ...borrador, textoBase: text })}
                placeholder="Resumen del devocional"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>Tema</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {temas.filter(t => t !== 'Todos').map((tema) => (
                  <TouchableOpacity
                    key={tema}
                    style={[
                      styles.themeChip,
                      { backgroundColor: colors.surface },
                      borrador.tema?.includes(tema) && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => {
                      const currentTemas = borrador.tema || [];
                      if (currentTemas.includes(tema)) {
                        setBorrador({
                          ...borrador,
                          tema: currentTemas.filter(t => t !== tema),
                        });
                      } else {
                        setBorrador({
                          ...borrador,
                          tema: [...currentTemas, tema],
                        });
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.themeChipText,
                        { color: borrador.tema?.includes(tema) ? 'white' : colors.text },
                      ]}
                    >
                      {tema}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>URL de Audio (opcional)</Text>
              <TextInput
                style={[styles.editorInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={borrador.audioUrl}
                onChangeText={(text) => setBorrador({ ...borrador, audioUrl: text })}
                placeholder="https://ejemplo.com/audio.mp3"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>URL de YouTube (opcional)</Text>
              <TextInput
                style={[styles.editorInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={borrador.youtubeUrl}
                onChangeText={(text) => setBorrador({ ...borrador, youtubeUrl: text })}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>Imagen de Portada (opcional)</Text>
              <TextInput
                style={[styles.editorInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={borrador.coverImage}
                onChangeText={(text) => setBorrador({ ...borrador, coverImage: text })}
                placeholder="https://ejemplo.com/imagen.jpg"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>Prompt para Imagen (opcional)</Text>
              <TextInput
                style={[styles.editorTextArea, { backgroundColor: colors.surface, color: colors.text }]}
                value={borrador.imagePrompt}
                onChangeText={(text) => setBorrador({ ...borrador, imagePrompt: text })}
                placeholder="Descripción para generar imagen con IA"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.editorSection}>
              <Text style={[styles.editorLabel, { color: colors.text }]}>Visibilidad</Text>
              <View style={styles.visibilityOptions}>
                {['todos', 'tema', 'autor'].map((vis) => (
                  <TouchableOpacity
                    key={vis}
                    style={[
                      styles.visibilityOption,
                      { backgroundColor: colors.surface },
                      borrador.visibilidad === vis && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setBorrador({ ...borrador, visibilidad: vis as any })}
                  >
                    <Text
                      style={[
                        styles.visibilityText,
                        { color: borrador.visibilidad === vis ? 'white' : colors.text },
                      ]}
                    >
                      {vis.charAt(0).toUpperCase() + vis.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderPersonalDevocionalCard = ({ item }: { item: DevocionalPersonal }) => (
    <TouchableOpacity
      style={[
        styles.devocionalCard,
        { backgroundColor: colors.surface },
      ]}
      onPress={() => {
        Alert.alert(
          item.titulo,
          `Fecha: ${new Date(item.fecha).toLocaleDateString()}\n\n${item.textoBase}\n\nEnseñanza: ${item.ensenanzaBiblica}\n\nAplicación: ${item.aplicacion}\n\nOración: ${item.oracion}`,
          [{ text: 'Cerrar' }]
        );
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.titulo}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>

      <Text style={[styles.cardText, { color: colors.textSecondary }]} numberOfLines={3}>
        {item.textoBase}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.cardAuthor, { color: colors.textSecondary }]}>
          {new Date(item.fecha).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Devocionales" 
        subtitle="Crecimiento espiritual"
        rightActions={
          isAdmin ? (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowUploadModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Tabs para cambiar entre devocionales generales y personales */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'general' && { backgroundColor: colors.primary },
            { borderColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('general')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'general' ? 'white' : colors.primary }
          ]}>Devocionales</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'personal' && { backgroundColor: colors.primary },
            { borderColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('personal')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'personal' ? 'white' : colors.primary }
          ]}>Mis Notas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar devocionales..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {selectedTab === 'general' ? (
        <FlatList
          data={filteredDevocionales}
          renderItem={renderDevocionalCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadDevocionales();
                setRefreshing(false);
              }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay devocionales disponibles
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowUploadModal(true)}
                >
                  <Text style={styles.emptyButtonText}>Crear Devocional</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      ) : (
        <>
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setBorradorPersonal({ fecha: new Date() });
              setShowPersonalModal(true);
            }}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
          <FlatList
            data={devocionalesPersonales}
            renderItem={renderPersonalDevocionalCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await loadDevocionalesPersonales();
                  setRefreshing(false);
                }}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <BookOpen size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No tienes devocionales personales aún
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Crea tu primer devocional personal para guardar tus reflexiones y oraciones
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setBorradorPersonal({ fecha: new Date() });
                    setShowPersonalModal(true);
                  }}
                >
                  <Text style={styles.emptyButtonText}>Crear Mi Primer Devocional</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      {renderDevocionalDetail()}
      {renderUploadModal()}
      {renderEditorModal()}
      {renderPersonalModal()}
      

    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 24,
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    marginBottom: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
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
  filterChips: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterChipsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  devocionalCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  completedCard: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  cardAuthor: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  devocionalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  devocionalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  versiculoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  versiculoReference: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  versiculoText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  preguntaCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  },
  preguntaNumero: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  preguntaText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  practicaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  practicaBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  practicaText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  oracionCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  },
  oracionText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  lecturaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  lecturaText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadModalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
  },
  uploadModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadOption: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadOptionDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editorContent: {
    flex: 1,
    padding: 20,
  },
  editorSection: {
    marginBottom: 24,
  },
  editorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  editorInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  editorTextArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  themeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  audioControlsBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  audioControlsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioInfo: {
    flex: 1,
  },
  audioStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  audioTitleText: {
    fontSize: 14,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  datePickerContainer: {
    maxHeight: 90,
  },
  dateItem: {
    width: 70,
    height: 80,
    marginRight: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateDay: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  shareModalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareImageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  shareImage: {
    width: '100%',
    height: 300,
  },
  shareOptions: {
    gap: 12,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  customTextContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  customTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  customTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customTextHint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },

});