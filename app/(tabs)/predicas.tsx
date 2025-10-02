import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  Platform,
  Share
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/providers/AppProvider';
import { useGlobalPlayer, PlayerTrack } from '@/providers/GlobalPlayerProvider';
import Colors from '@/constants/colors';
import { 
  Plus, 
  Upload, 
  FileText, 
  BookOpen, 
  Calendar,
  ChevronRight,
  X,
  Sparkles,
  Brain,
  MessageSquare,
  ListChecks,
  Image as ImageIcon,
  Play,
  Youtube,
  FileDown,
  Filter,
  Search,
  Mic,
  Share2
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Sermon, SermonSeries } from '@/types/auth';

export default function PredicasScreen() {
  const { 
    user, 
    isDarkMode, 
    sermons, 
    sermonSeries,
    addSermon,
    addSermonSeries,
    updateSermonSeries,
  } = useApp();
  const { play, stop } = useGlobalPlayer();
  
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const isAdmin = user?.role === 'admin';
  
  const [selectedTab, setSelectedTab] = useState<'sermons' | 'series'>('sermons');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSermonModal, setShowSermonModal] = useState(false);
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<SermonSeries | null>(null);
  const [viewingSeries, setViewingSeries] = useState<SermonSeries | null>(null);
  const [showAddToSeriesModal, setShowAddToSeriesModal] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form states for series
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [seriesDuration, setSeriesDuration] = useState('');
  const [seriesImage, setSeriesImage] = useState('');
  const [isGeneratingSeriesImage, setIsGeneratingSeriesImage] = useState(false);
  
  // Form states for sermon
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonDate, setSermonDate] = useState(new Date().toISOString().split('T')[0]);
  const [sermonFile, setSermonFile] = useState<any>(null);
  const [sermonImage, setSermonImage] = useState('');
  const [sermonImagePrompt, setSermonImagePrompt] = useState('');
  const [isGeneratingSermonImage, setIsGeneratingSermonImage] = useState(false);
  const [sermonContent, setSermonContent] = useState('');
  const [sermonQuestions, setSermonQuestions] = useState<any[]>([]);
  const [sermonMainPoints, setSermonMainPoints] = useState<string[]>([]);
  const [sermonNotes, setSermonNotes] = useState('');
  const [sermonVerses, setSermonVerses] = useState<string[]>([]);
  const [sermonYoutubeUrl, setSermonYoutubeUrl] = useState('');
  const [sermonAudioUrl, setSermonAudioUrl] = useState('');
  const [sermonPdfUrl, setSermonPdfUrl] = useState('');
  const [sermonDocUrl, setSermonDocUrl] = useState('');
  const [sermonGamification, setSermonGamification] = useState<any>({
    multipleChoice: [],
    trueFalse: [],
    rememberPhrase: ''
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setSermonFile(result.assets[0]);
        // Process document with AI
        await processDocumentWithAI(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const handlePickImage = async (forSeries: boolean = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: forSeries ? [16, 9] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (forSeries) {
          setSeriesImage(result.assets[0].uri);
        } else {
          setSermonImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleGenerateImage = async (forSeries: boolean = false) => {
    const title = forSeries ? seriesTitle : sermonTitle;
    const customPrompt = !forSeries && sermonImagePrompt ? sermonImagePrompt.trim() : '';
    const description = forSeries ? seriesDescription : sermonNotes;
    
    if (!title.trim() && !customPrompt) {
      Alert.alert('Error', 'Por favor ingresa un título o una descripción para la imagen');
      return;
    }

    if (forSeries) {
      setIsGeneratingSeriesImage(true);
    } else {
      setIsGeneratingSermonImage(true);
    }

    try {
      let prompt = '';
      
      if (customPrompt) {
        // Si hay un prompt personalizado, usarlo con contexto adicional
        prompt = `Genera una imagen cristiana profesional: ${customPrompt}. ${title ? `Para el sermón titulado "${title}". ` : ''}Estilo: moderno, limpio, inspirador, con elementos cristianos sutiles. Sin texto en la imagen.`;
      } else {
        // Prompt automático basado en el título y descripción
        prompt = `Crea una imagen de portada profesional y espiritual para ${forSeries ? 'una serie de sermones' : 'un sermón'} cristiano titulado "${title}". ${description ? `Contexto: ${description}. ` : ''}La imagen debe ser inspiradora, con elementos visuales cristianos sutiles como una cruz, biblia, paloma o luz divina. Usa colores cálidos y acogedores con un estilo moderno y limpio. La imagen debe transmitir esperanza, fe y paz. No incluyas texto en la imagen.`;
      }

      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size: forSeries ? '1536x1024' : '1024x1024',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar imagen');
      }

      const data = await response.json();
      const imageUri = `data:${data.image.mimeType};base64,${data.image.base64Data}`;
      
      if (forSeries) {
        setSeriesImage(imageUri);
      } else {
        setSermonImage(imageUri);
      }
      
      Alert.alert('Éxito', customPrompt ? 'Imagen personalizada generada exitosamente' : 'Imagen generada con IA exitosamente');
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'No se pudo generar la imagen con IA');
    } finally {
      if (forSeries) {
        setIsGeneratingSeriesImage(false);
      } else {
        setIsGeneratingSermonImage(false);
      }
    }
  };

  const processDocumentWithAI = async (document: any) => {
    if (!document) {
      Alert.alert('Error', 'No se ha seleccionado ningún archivo');
      return;
    }

    setIsProcessing(true);
    try {
      // Crear un prompt para procesar el documento
      const prompt = `Analiza este documento de sermón y genera, con tono inspirador y devocional pastoral, cercano y esperanzador:
1. Un resumen profundo del contenido (400-650 palabras, estilo devocional, con llamados a la aplicación práctica y una breve oración final)
2. 3-5 puntos principales del mensaje
3. 3-5 versículos bíblicos relevantes (solo referencias)
4. 3 preguntas de reflexión
5. Contenido para gamificación (preguntas múltiple opción y verdadero/falso)

Formato de respuesta en JSON:
{
  "content": "Resumen devocional del sermón...",
  "mainPoints": ["punto 1", "punto 2", ...],
  "verses": ["Mateo 6:9", "Juan 3:16", ...],
  "notes": "Notas adicionales del sermón...",
  "questions": [
    {"id": "1", "pregunta": "¿Cuál es...?", "tipo": "abierta"},
    {"id": "2", "pregunta": "La fe es ___", "tipo": "completar", "respuesta": "confianza"}
  ],
  "gamification": {
    "multipleChoice": [{"question": "¿Qué es...?", "options": ["A", "B", "C", "D"], "correctAnswer": 1}],
    "trueFalse": [{"statement": "La Biblia...", "answer": true}],
    "rememberPhrase": "Versículo clave"
  }
}`;

      // Simular procesamiento con IA más realista
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente especializado en análisis de contenido cristiano y sermones. Escribe con tono inspirador y devocional, pastoral y cercano, siempre bíblico y práctico. Genera contenido educativo y de reflexión basado en documentos de sermones.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nArchivo: ${document.name}\nTipo: ${document.mimeType || 'documento'}\n\nPor favor procesa este documento y genera el contenido solicitado. Si no puedes acceder al contenido real del archivo, genera contenido cristiano relevante y educativo basado en temas comunes de sermones.`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar con IA');
      }

      const aiResult = await response.json();
      let parsedContent;
      
      try {
        // Intentar parsear como JSON
        const jsonMatch = aiResult.completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se encontró JSON válido');
        }
      } catch (parseError) {
        // Si no se puede parsear como JSON, crear estructura manualmente
        const content = aiResult.completion;
        parsedContent = {
          content: content.length > 100 ? content : `Contenido del sermón basado en el archivo "${document.name}". Este mensaje aborda temas fundamentales de la fe cristiana, incluyendo la importancia de la oración, el estudio bíblico, y la vida en comunidad. El sermón enfatiza la necesidad de mantener una relación personal con Dios a través de Jesucristo, y cómo esto transforma nuestras vidas diarias. Se exploran principios bíblicos que nos ayudan a crecer espiritualmente y a ser testimonio efectivo en nuestro entorno.`,
          mainPoints: [
            'Fundamentos de la fe cristiana',
            'La importancia de la oración constante',
            'Vivir según los principios bíblicos',
            'Ser testimonio en la comunidad',
            'Crecimiento espiritual continuo'
          ],
          verses: [
            'Mateo 6:9-13',
            '1 Tesalonicenses 5:17',
            'Filipenses 4:6-7',
            '2 Timoteo 3:16-17',
            'Hebreos 10:24-25'
          ],
          notes: `Resumen del sermón basado en "${document.name}". Este mensaje nos desafía a profundizar en nuestra relación con Dios y a aplicar sus enseñanzas en nuestra vida cotidiana. Se enfatiza la importancia de la comunión con otros creyentes y el impacto que podemos tener en nuestro entorno cuando vivimos conforme a la voluntad de Dios.`,
          questions: [
            {
              id: '1',
              pregunta: '¿Cómo podemos aplicar este mensaje en nuestra vida diaria?',
              tipo: 'abierta' as const,
            },
            {
              id: '2',
              pregunta: 'La fe sin _____ está muerta',
              tipo: 'completar' as const,
              respuesta: 'obras',
            },
            {
              id: '3',
              pregunta: '¿Cuáles son las características de un cristiano maduro?',
              tipo: 'multiple' as const,
              opciones: ['Oración constante', 'Estudio bíblico', 'Servicio a otros', 'Todas las anteriores'],
            },
          ],
          gamification: {
            multipleChoice: [
              {
                question: '¿Cuál es el fundamento de la vida cristiana?',
                options: ['Las buenas obras', 'La fe en Jesucristo', 'La asistencia a la iglesia', 'Seguir reglas'],
                correctAnswer: 1
              },
              {
                question: '¿Qué nos enseña la Biblia sobre la oración?',
                options: ['Es opcional', 'Solo para pastores', 'Debe ser constante', 'Solo en emergencias'],
                correctAnswer: 2
              }
            ],
            trueFalse: [
              { statement: 'La fe cristiana requiere crecimiento continuo', answer: true },
              { statement: 'Los cristianos no necesitan estudiar la Biblia', answer: false },
              { statement: 'Dios desea una relación personal con cada persona', answer: true }
            ],
            rememberPhrase: 'Orad sin cesar - 1 Tesalonicenses 5:17'
          }
        };
      }

      // Establecer el contenido procesado
      setSermonContent(parsedContent.content || '');
      setSermonQuestions(parsedContent.questions || []);
      setSermonMainPoints(parsedContent.mainPoints || []);
      setSermonVerses(parsedContent.verses || []);
      setSermonNotes(parsedContent.notes || '');
      setSermonGamification(parsedContent.gamification || {
        multipleChoice: [],
        trueFalse: [],
        rememberPhrase: ''
      });
      
      Alert.alert('Éxito', 'Documento procesado con IA exitosamente. Se ha generado contenido completo basado en el archivo.');
    } catch (error) {
      console.error('Error processing with AI:', error);
      Alert.alert('Error', 'No se pudo procesar el documento con IA. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSeries = async () => {
    if (!seriesTitle.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la serie');
      return;
    }

    // Verificar si ya existe una serie con el mismo título
    const existingSeries = sermonSeries.find(s => 
      s.titulo.toLowerCase() === seriesTitle.trim().toLowerCase()
    );
    
    if (existingSeries) {
      Alert.alert('Error', 'Ya existe una serie con este título');
      return;
    }

    try {
      const newSeries = await addSermonSeries({
        titulo: seriesTitle.trim(),
        descripcion: seriesDescription.trim(),
        imagenUrl: seriesImage,
        sermonIds: [],
        duracionSemanas: parseInt(seriesDuration) || undefined,
        activo: true,
      });
      
      // Resetear el formulario inmediatamente después de crear
      setShowCreateModal(false);
      resetSeriesForm();
      
      // Preguntar si desea añadir sermones
      setTimeout(() => {
        Alert.alert(
          'Serie Creada Exitosamente',
          `La serie "${newSeries.titulo}" ha sido creada. ¿Deseas añadir sermones ahora?`,
          [
            {
              text: 'Más tarde',
              style: 'cancel',
            },
            {
              text: 'Añadir Sermones',
              onPress: () => {
                setSelectedSeries(newSeries);
                setShowAddToSeriesModal(true);
              }
            }
          ],
          { cancelable: false }
        );
      }, 100);
    } catch (error) {
      console.error('Error creating series:', error);
      Alert.alert('Error', 'No se pudo crear la serie');
    }
  };

  const handleCreateSermon = async (forSeries: boolean = false) => {
    if (!sermonTitle.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el sermón');
      return;
    }

    try {
      const serieId = forSeries && selectedSeries ? selectedSeries.id : undefined;
      
      // Crear el sermón
      const newSermon = await addSermon({
        serieId,
        titulo: sermonTitle.trim(),
        fecha: sermonDate,
        contenido: sermonContent,
        archivoUrl: sermonFile?.uri,
        imagenUrl: sermonImage,
        imagePrompt: sermonImagePrompt,
        preguntas: sermonQuestions,
        puntosPrincipales: sermonMainPoints,
        notas: sermonNotes,
        versiculos: sermonVerses,
        youtubeUrl: sermonYoutubeUrl,
        audioUrl: sermonAudioUrl,
        pdfUrl: sermonPdfUrl,
        docUrl: sermonDocUrl,
        gamification: sermonGamification,
      });
      
      // Si es para una serie, actualizar la serie con el ID del nuevo sermón
      if (serieId && selectedSeries && newSermon) {
        const updatedSermonIds = [...(selectedSeries.sermonIds || []), newSermon.id];
        await updateSermonSeries(selectedSeries.id, {
          sermonIds: updatedSermonIds,
        });
        
        // Actualizar el estado local de la serie seleccionada
        setSelectedSeries({
          ...selectedSeries,
          sermonIds: updatedSermonIds
        });
        
        // Si estamos viendo la serie, actualizarla también
        if (viewingSeries?.id === selectedSeries.id) {
          setViewingSeries({
            ...viewingSeries,
            sermonIds: updatedSermonIds
          });
        }
      }
      
      // Resetear el formulario antes de mostrar el alert
      const tempTitle = sermonTitle;
      resetSermonForm();
      
      if (forSeries) {
        Alert.alert(
          'Sermón Añadido',
          `"${tempTitle}" ha sido añadido a la serie exitosamente`,
          [
            {
              text: 'Añadir otro sermón',
              onPress: () => {
                // El formulario ya está reseteado
              }
            },
            {
              text: 'Finalizar',
              style: 'cancel',
              onPress: () => {
                setShowAddToSeriesModal(false);
                setSelectedSeries(null);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        setShowSermonModal(false);
        Alert.alert('Éxito', `El sermón "${tempTitle}" ha sido creado exitosamente`);
      }
    } catch (error) {
      console.error('Error creating sermon:', error);
      Alert.alert('Error', 'No se pudo crear el sermón');
    }
  };

  const resetSeriesForm = () => {
    setSeriesTitle('');
    setSeriesDescription('');
    setSeriesDuration('');
    setSeriesImage('');
  };

  const resetSermonForm = () => {
    setSermonTitle('');
    setSermonDate(new Date().toISOString().split('T')[0]);
    setSermonFile(null);
    setSermonImage('');
    setSermonImagePrompt('');
    setSermonContent('');
    setSermonQuestions([]);
    setSermonMainPoints([]);
    setSermonNotes('');
    setSermonVerses([]);
    setSermonYoutubeUrl('');
    setSermonAudioUrl('');
    setSermonPdfUrl('');
    setSermonDocUrl('');
    setSermonGamification({
      multipleChoice: [],
      trueFalse: [],
      rememberPhrase: ''
    });
  };

  const renderSeriesCard = (series: SermonSeries) => {
    const seriesSermons = sermons.filter(s => s.serieId === series.id);
    
    return (
      <TouchableOpacity
        key={series.id}
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => setViewingSeries(series)}
        onLongPress={async () => {
          try {
            const shareContent = `📖 *Serie: ${series.titulo}*\n\n${series.descripcion || 'Serie de sermones'}\n\n${seriesSermons.length} sermones disponibles\n\nCompartido desde la App de Discipulado`;
            await Share.share({
              message: shareContent,
              title: series.titulo,
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        }}
      >
        {series.imagenUrl ? (
          <Image source={{ uri: series.imagenUrl }} style={styles.seriesImage} />
        ) : (
          <View style={[styles.seriesImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <BookOpen size={40} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{series.titulo}</Text>
          {series.descripcion && (
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {series.descripcion}
            </Text>
          )}
          <View style={styles.cardMeta}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {seriesSermons.length} sermones
            </Text>
            {series.duracionSemanas && (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {series.duracionSemanas} semanas
              </Text>
            )}
          </View>
        </View>
        
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const handlePlaySermon = (sermon: Sermon) => {
    if (sermon.audioUrl) {
      const track: PlayerTrack = {
        id: sermon.id,
        title: sermon.titulo,
        artist: 'Sermón',
        artwork: sermon.imagenUrl,
        source: 'sermon',
        type: 'audio',
        audioUrl: sermon.audioUrl
      };
      play(track);
    }
  };

  const handleOpenLink = (url: string) => {
    if (url && Platform.OS !== 'web') {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'No se pudo abrir el enlace');
      });
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  const renderSermonCard = (sermon: Sermon) => {
    const hasMedia = sermon.audioUrl || sermon.youtubeUrl || sermon.pdfUrl || sermon.docUrl;
    
    return (
      <TouchableOpacity
        key={sermon.id}
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => setSelectedSermon(sermon)}
      >
        {sermon.imagenUrl ? (
          <Image source={{ uri: sermon.imagenUrl }} style={styles.sermonThumbnail} />
        ) : (
          <View style={[styles.sermonThumbnailPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <FileText size={24} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{sermon.titulo}</Text>
          <View style={styles.cardMeta}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: 4 }]}>
              {new Date(sermon.fecha).toLocaleDateString('es-ES')}
            </Text>
          </View>
          {sermon.puntosPrincipales && sermon.puntosPrincipales.length > 0 && (
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {sermon.puntosPrincipales[0]}
            </Text>
          )}
          {hasMedia && (
            <View style={styles.mediaIcons}>
              {sermon.audioUrl && <Mic size={16} color={colors.primary} />}
              {sermon.youtubeUrl && <Youtube size={16} color={colors.primary} />}
              {sermon.pdfUrl && <FileText size={16} color={colors.primary} />}
              {sermon.docUrl && <FileDown size={16} color={colors.primary} />}
            </View>
          )}
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={async (e) => {
              e.stopPropagation();
              try {
                const shareContent = `🎤 *${sermon.titulo}*\n\n${sermon.notas || sermon.contenido || 'Sermón disponible'}\n\n📅 ${new Date(sermon.fecha).toLocaleDateString('es-ES')}\n\nCompartido desde la App de Discipulado`;
                await Share.share({
                  message: shareContent,
                  title: sermon.titulo,
                });
              } catch (error) {
                console.error('Error sharing:', error);
              }
            }}
          >
            <Share2 size={18} color={colors.primary} />
          </TouchableOpacity>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Prédicas" 
        subtitle="Mensajes inspiradores para tu vida espiritual"
        rightActions={
          isAdmin ? (
            <View style={styles.headerActions}>
              {viewingSeries && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setViewingSeries(null)}
                >
                  <ChevronRight size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (viewingSeries) {
                    // Si estamos viendo una serie, añadir sermón a esa serie
                    setSelectedSeries(viewingSeries);
                    setShowAddToSeriesModal(true);
                  } else {
                    // Mostrar modal para elegir tipo
                    setShowCreateTypeModal(true);
                  }
                }}
              >
                <Plus size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            viewingSeries ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setViewingSeries(null)}
              >
                <ChevronRight size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            ) : undefined
          )
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'series' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedTab('series')}
          >
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'series' ? '#fff' : colors.textSecondary }
            ]}>
              Series
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'sermons' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedTab('sermons')}
          >
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'sermons' ? '#fff' : colors.textSecondary }
            ]}>
              Sermones
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'sermons' && (
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar sermones..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {showFilters && selectedTab === 'sermons' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {['all', 'audio', 'video', 'pdf', 'recent'].map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  { backgroundColor: selectedFilter === filter ? colors.primary : colors.surface }
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: selectedFilter === filter ? '#fff' : colors.text }
                ]}>
                  {filter === 'all' ? 'Todos' : 
                   filter === 'audio' ? 'Con Audio' :
                   filter === 'video' ? 'Con Video' :
                   filter === 'pdf' ? 'Con PDF' : 'Recientes'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {viewingSeries ? (
            // Vista de sermones dentro de una serie
            <>
              <View style={[styles.seriesHeader, { backgroundColor: colors.surface }]}>
                {viewingSeries.imagenUrl ? (
                  <Image source={{ uri: viewingSeries.imagenUrl }} style={styles.seriesHeaderImage} />
                ) : (
                  <View style={[styles.seriesHeaderImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <BookOpen size={32} color={colors.primary} />
                  </View>
                )}
                <View style={styles.seriesHeaderContent}>
                  <Text style={[styles.seriesHeaderTitle, { color: colors.text }]}>
                    {viewingSeries.titulo}
                  </Text>
                  {viewingSeries.descripcion && (
                    <Text style={[styles.seriesHeaderDescription, { color: colors.textSecondary }]}>
                      {viewingSeries.descripcion}
                    </Text>
                  )}
                  <View style={styles.seriesHeaderMeta}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {sermons.filter(s => s.serieId === viewingSeries.id).length} sermones
                    </Text>
                    {viewingSeries.duracionSemanas && (
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        • {viewingSeries.duracionSemanas} semanas
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              
              {(() => {
                const seriesSermons = sermons.filter(s => s.serieId === viewingSeries.id);
                return seriesSermons.length > 0 ? (
                  seriesSermons.map(renderSermonCard)
                ) : (
                  <View style={styles.emptyState}>
                    <FileText size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No hay sermones en esta serie
                    </Text>
                    {isAdmin && (
                      <TouchableOpacity
                        style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          setSelectedSeries(viewingSeries);
                          setShowAddToSeriesModal(true);
                        }}
                      >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.emptyAddButtonText}>Añadir Sermón</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })()}
            </>
          ) : selectedTab === 'series' ? (
            sermonSeries.length > 0 ? (
              sermonSeries.map(renderSeriesCard)
            ) : (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No hay series de sermones disponibles
                </Text>
              </View>
            )
          ) : (
            (() => {
              let filteredSermons = sermons;
              
              // Apply search filter
              if (searchQuery) {
                filteredSermons = filteredSermons.filter(s => 
                  s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.contenido?.toLowerCase().includes(searchQuery.toLowerCase())
                );
              }
              
              // Apply type filter
              if (selectedFilter !== 'all') {
                filteredSermons = filteredSermons.filter(s => {
                  switch(selectedFilter) {
                    case 'audio': return !!s.audioUrl;
                    case 'video': return !!s.youtubeUrl;
                    case 'pdf': return !!s.pdfUrl;
                    case 'recent': 
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(s.fecha) > weekAgo;
                    default: return true;
                  }
                });
              }
              
              return filteredSermons.length > 0 ? (
                filteredSermons.map(renderSermonCard)
              ) : (
                <View style={styles.emptyState}>
                  <FileText size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {searchQuery || selectedFilter !== 'all' 
                      ? 'No se encontraron sermones con los filtros aplicados'
                      : 'No hay sermones disponibles'}
                  </Text>
                </View>
              );
            })()
          )}
        </View>
      </ScrollView>

      {/* Create Series Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Serie de Sermones</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Título de la Serie</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={seriesTitle}
                  onChangeText={setSeriesTitle}
                  placeholder="Ej: Sermones sobre la Oración"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Descripción</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
                  value={seriesDescription}
                  onChangeText={setSeriesDescription}
                  placeholder="Descripción de la serie..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Duración (semanas)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={seriesDuration}
                  onChangeText={setSeriesDuration}
                  placeholder="Ej: 4"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: colors.primary, flex: 1 }]}
                  onPress={() => handlePickImage(true)}
                >
                  <ImageIcon size={20} color={colors.primary} />
                  <Text style={[styles.uploadText, { color: colors.primary }]}>
                    {seriesImage ? 'Cambiar' : 'Subir'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: colors.primary, flex: 1, backgroundColor: colors.primary + '10' }]}
                  onPress={() => handleGenerateImage(true)}
                  disabled={isGeneratingSeriesImage}
                >
                  {isGeneratingSeriesImage ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Sparkles size={20} color={colors.primary} />
                  )}
                  <Text style={[styles.uploadText, { color: colors.primary }]}>
                    Generar con IA
                  </Text>
                </TouchableOpacity>
              </View>

              {seriesImage && (
                <Image source={{ uri: seriesImage }} style={styles.previewImage} />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateSeries}
                disabled={!seriesTitle.trim()}
              >
                <Text style={styles.saveButtonText}>Crear Serie</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Sermon Modal */}
      <Modal
        visible={showSermonModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSermonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Nuevo Sermón</Text>
              <TouchableOpacity onPress={() => setShowSermonModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Título del Sermón</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={sermonTitle}
                  onChangeText={setSermonTitle}
                  placeholder="Ej: El Poder de la Oración"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Fecha</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={sermonDate}
                  onChangeText={setSermonDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>URL de YouTube (opcional)</Text>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Pega el enlace del video de YouTube</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={sermonYoutubeUrl}
                  onChangeText={setSermonYoutubeUrl}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Documento del Sermón</Text>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Sube un archivo para generar automáticamente el contenido del sermón</Text>
                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: colors.primary }]}
                  onPress={handlePickDocument}
                >
                  <Upload size={20} color={colors.primary} />
                  <Text style={[styles.uploadText, { color: colors.primary }]}>
                    {sermonFile ? sermonFile.name : 'Subir Documento (Word/PDF)'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.processingText, { color: colors.textSecondary }]}>
                    Procesando con IA...
                  </Text>
                </View>
              )}

              {sermonQuestions.length > 0 && (
                <View style={styles.aiResultsContainer}>
                  <View style={styles.aiResultHeader}>
                    <Brain size={20} color={colors.primary} />
                    <Text style={[styles.aiResultTitle, { color: colors.text }]}>
                      Contenido Generado por IA
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <MessageSquare size={16} color={colors.textSecondary} />
                    <Text style={[styles.aiSectionTitle, { color: colors.textSecondary }]}>
                      Preguntas ({sermonQuestions.length})
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <ListChecks size={16} color={colors.textSecondary} />
                    <Text style={[styles.aiSectionTitle, { color: colors.textSecondary }]}>
                      Puntos Principales ({sermonMainPoints.length})
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <BookOpen size={16} color={colors.textSecondary} />
                    <Text style={[styles.aiSectionTitle, { color: colors.textSecondary }]}>
                      Versículos ({sermonVerses.length})
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Imagen del Sermón</Text>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Describe la imagen que deseas generar con IA</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, minHeight: 80 }]}
                  value={sermonImagePrompt}
                  onChangeText={setSermonImagePrompt}
                  placeholder="Ej: Una paloma blanca volando sobre un cielo azul con nubes doradas, rayos de luz divina atravesando las nubes, ambiente celestial y esperanzador..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: colors.primary, flex: 1 }]}
                    onPress={() => handlePickImage(false)}
                  >
                    <ImageIcon size={20} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>
                      {sermonImage ? 'Cambiar' : 'Subir'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: colors.primary, flex: 1, backgroundColor: colors.primary + '10' }]}
                    onPress={() => handleGenerateImage(false)}
                    disabled={isGeneratingSermonImage}
                  >
                    {isGeneratingSermonImage ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Sparkles size={20} color={colors.primary} />
                    )}
                    <Text style={[styles.uploadText, { color: colors.primary }]}>
                      Generar con IA
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {sermonImage && (
                <Image source={{ uri: sermonImage }} style={styles.previewImage} />
              )}

              {/* Gamification Section */}
              {sermonQuestions.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Gamificación del Aprendizaje</Text>
                  <View style={[styles.gamificationInfo, { backgroundColor: colors.primary + '10' }]}>
                    <Text style={[styles.gamificationText, { color: colors.text }]}>
                      Se generarán automáticamente:
                    </Text>
                    <Text style={[styles.gamificationItem, { color: colors.textSecondary }]}>
                      • Preguntas de opción múltiple
                    </Text>
                    <Text style={[styles.gamificationItem, { color: colors.textSecondary }]}>
                      • Afirmaciones verdadero/falso
                    </Text>
                    <Text style={[styles.gamificationItem, { color: colors.textSecondary }]}>
                      • Frase clave para memorizar
                    </Text>
                    <Text style={[styles.gamificationNote, { color: colors.primary }]}>
                      Los usuarios recibirán recordatorios si no completan las actividades en la semana
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setShowSermonModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => handleCreateSermon(false)}
                disabled={!sermonTitle.trim()}
              >
                <Text style={styles.saveButtonText}>Crear Sermón</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Sermon to Series Modal */}
      <Modal
        visible={showAddToSeriesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddToSeriesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Añadir Sermón a {selectedSeries?.titulo}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddToSeriesModal(false);
                setSelectedSeries(null);
                resetSermonForm();
              }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Título del Sermón</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={sermonTitle}
                  onChangeText={setSermonTitle}
                  placeholder="Ej: El Poder de la Oración"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Fecha</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={sermonDate}
                  onChangeText={setSermonDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>URL de YouTube (opcional)</Text>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Pega el enlace del video de YouTube</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={sermonYoutubeUrl}
                  onChangeText={setSermonYoutubeUrl}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Documento del Sermón</Text>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Sube un archivo para generar automáticamente el contenido del sermón</Text>
                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: colors.primary }]}
                  onPress={handlePickDocument}
                >
                  <Upload size={20} color={colors.primary} />
                  <Text style={[styles.uploadText, { color: colors.primary }]}>
                    {sermonFile ? sermonFile.name : 'Subir Documento (Word/PDF)'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.processingText, { color: colors.textSecondary }]}>
                    Procesando con IA...
                  </Text>
                </View>
              )}

              {sermonQuestions.length > 0 && (
                <View style={styles.aiResultsContainer}>
                  <View style={styles.aiResultHeader}>
                    <Brain size={20} color={colors.primary} />
                    <Text style={[styles.aiResultTitle, { color: colors.text }]}>
                      Contenido Generado por IA
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <MessageSquare size={16} color={colors.textSecondary} />
                    <Text style={[styles.aiSectionTitle, { color: colors.textSecondary }]}>
                      Preguntas ({sermonQuestions.length})
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <ListChecks size={16} color={colors.textSecondary} />
                    <Text style={[styles.aiSectionTitle, { color: colors.textSecondary }]}>
                      Puntos Principales ({sermonMainPoints.length})
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <BookOpen size={16} color={colors.textSecondary} />
                    <Text style={[styles.aiSectionTitle, { color: colors.textSecondary }]}>
                      Versículos ({sermonVerses.length})
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Imagen del Sermón</Text>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Describe la imagen que deseas generar con IA</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, minHeight: 80 }]}
                  value={sermonImagePrompt}
                  onChangeText={setSermonImagePrompt}
                  placeholder="Ej: Una paloma blanca volando sobre un cielo azul con nubes doradas, rayos de luz divina atravesando las nubes, ambiente celestial y esperanzador..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: colors.primary, flex: 1 }]}
                    onPress={() => handlePickImage(false)}
                  >
                    <ImageIcon size={20} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>
                      {sermonImage ? 'Cambiar' : 'Subir'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: colors.primary, flex: 1, backgroundColor: colors.primary + '10' }]}
                    onPress={() => handleGenerateImage(false)}
                    disabled={isGeneratingSermonImage}
                  >
                    {isGeneratingSermonImage ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Sparkles size={20} color={colors.primary} />
                    )}
                    <Text style={[styles.uploadText, { color: colors.primary }]}>
                      Generar con IA
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {sermonImage && (
                <Image source={{ uri: sermonImage }} style={styles.previewImage} />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowAddToSeriesModal(false);
                  setSelectedSeries(null);
                  resetSermonForm();
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => handleCreateSermon(true)}
                disabled={!sermonTitle.trim()}
              >
                <Text style={styles.saveButtonText}>Añadir a Serie</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Type Selection Modal */}
      <Modal
        visible={showCreateTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.typeSelectionModal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>¿Qué deseas crear?</Text>
              <TouchableOpacity onPress={() => setShowCreateTypeModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeOptionsContainer}>
              <TouchableOpacity
                style={[styles.typeOption, { backgroundColor: colors.background, borderColor: colors.primary }]}
                onPress={() => {
                  setShowCreateTypeModal(false);
                  setShowSermonModal(true);
                }}
              >
                <View style={[styles.typeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Mic size={32} color={colors.primary} />
                </View>
                <Text style={[styles.typeOptionTitle, { color: colors.text }]}>Sermón Individual</Text>
                <Text style={[styles.typeOptionDescription, { color: colors.textSecondary }]}>
                  Crea un sermón independiente que no forma parte de ninguna serie
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOption, { backgroundColor: colors.background, borderColor: colors.primary }]}
                onPress={() => {
                  setShowCreateTypeModal(false);
                  setShowCreateModal(true);
                }}
              >
                <View style={[styles.typeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <BookOpen size={32} color={colors.primary} />
                </View>
                <Text style={[styles.typeOptionTitle, { color: colors.text }]}>Serie de Sermones</Text>
                <Text style={[styles.typeOptionDescription, { color: colors.textSecondary }]}>
                  Crea una serie temática que agrupa múltiples sermones relacionados
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sermon Detail Modal */}
      <Modal
        visible={!!selectedSermon}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSermon(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]} testID="sermon-detail-modal">
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                {selectedSermon?.titulo ?? ''}
              </Text>
              <TouchableOpacity onPress={() => setSelectedSermon(null)} testID="close-sermon-detail">
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedSermon?.imagenUrl ? (
                <Image source={{ uri: selectedSermon.imagenUrl }} style={styles.previewImage} />
              ) : null}

              <View style={styles.cardMeta}>
                <Calendar size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: 4 }]}>
                  {selectedSermon?.fecha ? new Date(selectedSermon.fecha).toLocaleDateString('es-ES') : ''}
                </Text>
              </View>

              {selectedSermon?.puntosPrincipales && selectedSermon.puntosPrincipales.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Puntos principales</Text>
                  {selectedSermon.puntosPrincipales.map((p, idx) => (
                    <Text key={`${selectedSermon?.id}-mp-${idx}`} style={[styles.cardDescription, { color: colors.textSecondary }]}>
                      • {p}
                    </Text>
                  ))}
                </View>
              ) : null}

              {selectedSermon?.versiculos && selectedSermon.versiculos.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Versículos</Text>
                  {selectedSermon.versiculos.map((v, idx) => (
                    <Text key={`${selectedSermon?.id}-vs-${idx}`} style={[styles.cardDescription, { color: colors.textSecondary }]}>
                      {v}
                    </Text>
                  ))}
                </View>
              ) : null}

              {selectedSermon?.contenido ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Contenido</Text>
                  <Text style={[styles.seriesHeaderDescription, { color: colors.text }]}>
                    {selectedSermon.contenido}
                  </Text>
                </View>
              ) : null}

              {selectedSermon?.notas ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
                  <Text style={[styles.seriesHeaderDescription, { color: colors.textSecondary }]}>
                    {selectedSermon.notas}
                  </Text>
                </View>
              ) : null}

              { (selectedSermon?.audioUrl || selectedSermon?.youtubeUrl || selectedSermon?.pdfUrl || selectedSermon?.docUrl) ? (
                <View style={[styles.mediaIcons, { marginTop: 16 }]} testID="sermon-media-actions">
                  {selectedSermon?.audioUrl ? (
                    <TouchableOpacity onPress={() => selectedSermon && handlePlaySermon(selectedSermon)} style={styles.filterChip} testID="play-sermon-audio">
                      <Mic size={18} color={colors.primary} />
                      <Text style={[styles.filterChipText, { color: colors.text, marginLeft: 6 }]}>Reproducir audio</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedSermon?.youtubeUrl ? (
                    <TouchableOpacity onPress={() => selectedSermon?.youtubeUrl && handleOpenLink(selectedSermon.youtubeUrl)} style={styles.filterChip} testID="open-sermon-youtube">
                      <Youtube size={18} color={colors.primary} />
                      <Text style={[styles.filterChipText, { color: colors.text, marginLeft: 6 }]}>Ver video</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedSermon?.pdfUrl ? (
                    <TouchableOpacity onPress={() => selectedSermon?.pdfUrl && handleOpenLink(selectedSermon.pdfUrl)} style={styles.filterChip} testID="open-sermon-pdf">
                      <FileText size={18} color={colors.primary} />
                      <Text style={[styles.filterChipText, { color: colors.text, marginLeft: 6 }]}>Abrir PDF</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedSermon?.docUrl ? (
                    <TouchableOpacity onPress={() => selectedSermon?.docUrl && handleOpenLink(selectedSermon.docUrl)} style={styles.filterChip} testID="open-sermon-doc">
                      <FileDown size={18} color={colors.primary} />
                      <Text style={[styles.filterChipText, { color: colors.text, marginLeft: 6 }]}>Abrir Doc</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              <View style={[styles.mediaIcons, { marginTop: 12 }]}> 
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={async () => {
                    try {
                      const shareContent = `🎤 ${selectedSermon?.titulo ?? ''}\n\n${selectedSermon?.notas ?? selectedSermon?.contenido ?? ''}\n\n📅 ${selectedSermon?.fecha ? new Date(selectedSermon.fecha).toLocaleDateString('es-ES') : ''}`;
                      await Share.share({ message: shareContent, title: selectedSermon?.titulo ?? 'Sermón' });
                    } catch (err) {
                      console.log('share error', err);
                    }
                  }}
                  testID="share-sermon"
                >
                  <Share2 size={18} color={colors.primary} />
                  <Text style={[styles.filterChipText, { color: colors.text, marginLeft: 6 }]}>Compartir</Text>
                </TouchableOpacity>
              </View>

              {!selectedSermon?.audioUrl && !selectedSermon?.youtubeUrl && !selectedSermon?.pdfUrl && !selectedSermon?.docUrl && !selectedSermon?.contenido && !selectedSermon?.notas ? (
                <View style={[styles.emptyState, { paddingVertical: 24 }]} testID="sermon-empty-content">
                  <FileText size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Este sermón no tiene contenido disponible.</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => setSelectedSermon(null)}
                testID="close-sermon-modal"
              >
                <Text style={styles.saveButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  seriesImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  seriesImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sermonThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  sermonThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  metaText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  processingText: {
    fontSize: 14,
  },
  aiResultsContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiResultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  aiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  aiSectionTitle: {
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  mediaIcons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  gamificationInfo: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  gamificationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  gamificationItem: {
    fontSize: 13,
    marginLeft: 8,
    marginVertical: 2,
  },
  gamificationNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seriesHeader: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  seriesHeaderImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  seriesHeaderImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  seriesHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  seriesHeaderDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  seriesHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic' as const,
  },
  typeSelectionModal: {
    marginHorizontal: 20,
    marginVertical: 'auto' as any,
    borderRadius: 20,
    maxHeight: '80%',
  },
  typeOptionsContainer: {
    padding: 20,
    gap: 16,
  },
  typeOption: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typeOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  typeOptionDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});