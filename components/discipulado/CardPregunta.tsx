import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  CheckSquare,
  Square,
  Clock,
  Star,
  MessageSquare,
  Users,
  BookOpen,
  AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CardPreguntaProps {
  pregunta: {
    id: string;
    tipo: 'multiple' | 'verdadero-falso' | 'abierta' | 'reflexion';
    texto: string;
    opciones?: string[];
    respuestaCorrecta?: string | number;
    explicacion?: string;
    puntos: number;
    notasLider?: string;
    tiempoSugerido?: number;
    numeroOriginal?: number;
    seccionCrea?: 'C' | 'R' | 'E' | 'A';
  };
  numero: number;
  respuesta?: any;
  onRespuestaChange: (respuesta: any) => void;
  modoLider?: boolean;
  mostrarRespuesta?: boolean;
  autoGuardado?: boolean;
  leccionId: string;
}

export default function CardPregunta({
  pregunta,
  numero,
  respuesta,
  onRespuestaChange,
  modoLider = false,
  mostrarRespuesta = false,
  autoGuardado = true,
  leccionId,
}: CardPreguntaProps) {
  const colors = Colors.dark;
  const [respuestaLocal, setRespuestaLocal] = useState(respuesta);
  const [marcadaComoRespondida, setMarcadaComoRespondida] = useState(false);
  const [mostrarNotasLider, setMostrarNotasLider] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarEstadoPregunta = useCallback(async () => {
    try {
      const key = `pregunta_${leccionId}_${pregunta.id}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        setRespuestaLocal(data.respuesta);
        setMarcadaComoRespondida(data.marcada || false);
      }
    } catch (error) {
      console.error('Error cargando estado de pregunta:', error);
    }
  }, [leccionId, pregunta.id]);

  useEffect(() => {
    setRespuestaLocal(respuesta);
    cargarEstadoPregunta();
  }, [pregunta.id, respuesta, cargarEstadoPregunta]);



  const guardarRespuesta = async (nuevaRespuesta: any) => {
    if (!autoGuardado) return;
    
    setGuardando(true);
    try {
      const key = `pregunta_${leccionId}_${pregunta.id}`;
      const data = {
        respuesta: nuevaRespuesta,
        marcada: marcadaComoRespondida,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando respuesta:', error);
    } finally {
      setGuardando(false);
    }
  };

  const handleRespuestaChange = (nuevaRespuesta: any) => {
    setRespuestaLocal(nuevaRespuesta);
    onRespuestaChange(nuevaRespuesta);
    guardarRespuesta(nuevaRespuesta);
  };

  const toggleMarcarRespondida = async () => {
    const nuevoEstado = !marcadaComoRespondida;
    setMarcadaComoRespondida(nuevoEstado);
    
    if (autoGuardado) {
      try {
        const key = `pregunta_${leccionId}_${pregunta.id}`;
        const data = {
          respuesta: respuestaLocal,
          marcada: nuevoEstado,
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Error guardando estado:', error);
      }
    }
  };

  const getSeccionIcon = () => {
    switch (pregunta.seccionCrea) {
      case 'C': return <BookOpen size={16} color={colors.primary} />;
      case 'R': return <MessageSquare size={16} color={colors.danger} />;
      case 'E': return <Users size={16} color={colors.success} />;
      case 'A': return <Star size={16} color={colors.warning} />;
      default: return <MessageSquare size={16} color={colors.primary} />;
    }
  };

  const getSeccionColor = () => {
    switch (pregunta.seccionCrea) {
      case 'C': return colors.primary;
      case 'R': return colors.danger;
      case 'E': return colors.success;
      case 'A': return colors.warning;
      default: return colors.primary;
    }
  };

  const getSeccionNombre = () => {
    switch (pregunta.seccionCrea) {
      case 'C': return 'Conocimiento';
      case 'R': return 'Reflexión';
      case 'E': return 'Experiencia';
      case 'A': return 'Aplicación';
      default: return 'Pregunta';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header de la pregunta */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.numeroBadge, { backgroundColor: getSeccionColor() + '20' }]}>
            <Text style={[styles.numeroText, { color: getSeccionColor() }]}>
              #{numero}
            </Text>
          </View>
          
          {pregunta.seccionCrea && (
            <View style={[styles.seccionBadge, { backgroundColor: getSeccionColor() + '10' }]}>
              {getSeccionIcon()}
              <Text style={[styles.seccionText, { color: getSeccionColor() }]}>
                {getSeccionNombre()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {pregunta.tiempoSugerido && modoLider && (
            <View style={styles.tiempoBadge}>
              <Clock size={14} color={colors.tabIconDefault} />
              <Text style={[styles.tiempoText, { color: colors.tabIconDefault }]}>
                {pregunta.tiempoSugerido} min
              </Text>
            </View>
          )}
          
          <View style={styles.puntosBadge}>
            <Star size={14} color={colors.warning} />
            <Text style={[styles.puntosText, { color: colors.warning }]}>
              {pregunta.puntos} pts
            </Text>
          </View>
        </View>
      </View>

      {/* Texto de la pregunta */}
      <Text style={[styles.preguntaText, { color: colors.text }]}>
        {pregunta.texto}
      </Text>

      {/* Campo de respuesta según el tipo */}
      {pregunta.tipo === 'abierta' || pregunta.tipo === 'reflexion' ? (
        <View style={styles.respuestaContainer}>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: marcadaComoRespondida ? getSeccionColor() : colors.border,
                borderWidth: marcadaComoRespondida ? 2 : 1,
              }
            ]}
            placeholder={
              pregunta.tipo === 'reflexion' 
                ? "Tómate tu tiempo para reflexionar..." 
                : "Escribe tu respuesta aquí..."
            }
            placeholderTextColor={colors.tabIconDefault}
            multiline
            numberOfLines={4}
            value={respuestaLocal || ''}
            onChangeText={handleRespuestaChange}
          />
          
          {guardando && (
            <Text style={[styles.guardandoText, { color: colors.tabIconDefault }]}>
              Guardando...
            </Text>
          )}
        </View>
      ) : pregunta.tipo === 'multiple' && pregunta.opciones ? (
        <View style={styles.opcionesContainer}>
          {pregunta.opciones.map((opcion, idx) => (
            <TouchableOpacity
              key={`opcion-${idx}-${opcion}`}
              style={[
                styles.opcionButton,
                { 
                  backgroundColor: colors.background, 
                  borderColor: respuestaLocal === idx ? getSeccionColor() : colors.border,
                  borderWidth: respuestaLocal === idx ? 2 : 1,
                }
              ]}
              onPress={() => handleRespuestaChange(idx)}
            >
              <View style={[
                styles.radioCircle,
                { borderColor: respuestaLocal === idx ? getSeccionColor() : colors.border }
              ]}>
                {respuestaLocal === idx && (
                  <View style={[styles.radioInner, { backgroundColor: getSeccionColor() }]} />
                )}
              </View>
              <Text style={[
                styles.opcionText,
                { 
                  color: respuestaLocal === idx ? colors.text : colors.tabIconDefault,
                  fontWeight: respuestaLocal === idx ? '600' : '400',
                }
              ]}>
                {opcion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : pregunta.tipo === 'verdadero-falso' ? (
        <View style={styles.verdaderoFalsoContainer}>
          <TouchableOpacity
            style={[
              styles.verdaderoFalsoButton,
              { 
                backgroundColor: respuestaLocal === true ? colors.success + '10' : colors.background,
                borderColor: respuestaLocal === true ? colors.success : colors.border,
                borderWidth: respuestaLocal === true ? 2 : 1,
              }
            ]}
            onPress={() => handleRespuestaChange(true)}
          >
            <CheckSquare 
              size={20} 
              color={respuestaLocal === true ? colors.success : colors.tabIconDefault} 
            />
            <Text style={[
              styles.verdaderoFalsoText,
              { color: respuestaLocal === true ? colors.success : colors.tabIconDefault }
            ]}>
              Verdadero
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verdaderoFalsoButton,
              { 
                backgroundColor: respuestaLocal === false ? colors.danger + '10' : colors.background,
                borderColor: respuestaLocal === false ? colors.danger : colors.border,
                borderWidth: respuestaLocal === false ? 2 : 1,
              }
            ]}
            onPress={() => handleRespuestaChange(false)}
          >
            <Square 
              size={20} 
              color={respuestaLocal === false ? colors.danger : colors.tabIconDefault} 
            />
            <Text style={[
              styles.verdaderoFalsoText,
              { color: respuestaLocal === false ? colors.danger : colors.tabIconDefault }
            ]}>
              Falso
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Botón marcar como respondida */}
      <TouchableOpacity
        style={[
          styles.marcarButton,
          { 
            backgroundColor: marcadaComoRespondida ? getSeccionColor() + '10' : colors.background,
            borderColor: marcadaComoRespondida ? getSeccionColor() : colors.border,
          }
        ]}
        onPress={toggleMarcarRespondida}
      >
        {marcadaComoRespondida ? (
          <CheckSquare size={18} color={getSeccionColor()} />
        ) : (
          <Square size={18} color={colors.tabIconDefault} />
        )}
        <Text style={[
          styles.marcarText,
          { color: marcadaComoRespondida ? getSeccionColor() : colors.tabIconDefault }
        ]}>
          {marcadaComoRespondida ? 'Respondida' : 'Marcar como respondida'}
        </Text>
      </TouchableOpacity>

      {/* Notas del líder (solo en modo líder) */}
      {modoLider && pregunta.notasLider && (
        <View style={styles.notasLiderContainer}>
          <TouchableOpacity
            style={[styles.notasLiderButton, { backgroundColor: colors.primary + '10' }]}
            onPress={() => setMostrarNotasLider(!mostrarNotasLider)}
          >
            <Users size={16} color={colors.primary} />
            <Text style={[styles.notasLiderButtonText, { color: colors.primary }]}>
              Notas del líder
            </Text>
          </TouchableOpacity>
          
          {mostrarNotasLider && (
            <View style={[styles.notasLiderContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.notasLiderText, { color: colors.text }]}>
                {pregunta.notasLider}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Mostrar respuesta correcta (si aplica) */}
      {mostrarRespuesta && pregunta.respuestaCorrecta !== undefined && (
        <View style={[styles.respuestaCorrectaContainer, { backgroundColor: colors.success + '10' }]}>
          <AlertCircle size={16} color={colors.success} />
          <Text style={[styles.respuestaCorrectaText, { color: colors.success }]}>
            Respuesta correcta: {
              pregunta.tipo === 'multiple' && pregunta.opciones
                ? pregunta.opciones[pregunta.respuestaCorrecta as number]
                : pregunta.tipo === 'verdadero-falso'
                  ? (pregunta.respuestaCorrecta ? 'Verdadero' : 'Falso')
                  : pregunta.respuestaCorrecta
            }
          </Text>
        </View>
      )}

      {/* Explicación (si existe) */}
      {mostrarRespuesta && pregunta.explicacion && (
        <View style={[styles.explicacionContainer, { backgroundColor: colors.primary + '05' }]}>
          <Text style={[styles.explicacionText, { color: colors.text }]}>
            {pregunta.explicacion}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numeroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  numeroText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  seccionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seccionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tiempoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tiempoText: {
    fontSize: 12,
  },
  puntosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  puntosText: {
    fontSize: 12,
    fontWeight: '600',
  },
  preguntaText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  respuestaContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  guardandoText: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  opcionesContainer: {
    marginBottom: 16,
  },
  opcionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  opcionText: {
    fontSize: 15,
    flex: 1,
  },
  verdaderoFalsoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  verdaderoFalsoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  verdaderoFalsoText: {
    fontSize: 15,
    fontWeight: '500',
  },
  marcarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  marcarText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notasLiderContainer: {
    marginTop: 16,
  },
  notasLiderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  notasLiderButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notasLiderContent: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  notasLiderText: {
    fontSize: 14,
    lineHeight: 20,
  },
  respuestaCorrectaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  respuestaCorrectaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  explicacionContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  explicacionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});