import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, ChevronLeft, BookOpen, Check, Settings } from 'lucide-react-native';
import { moduloSantidad, type Pregunta, type Modulo } from '@/constants/modulo-santidad';
import { moduloEspirituSanto } from '@/constants/modulo-espiritu-santo';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/providers/AppProvider';
import { useRouter } from 'expo-router';

type Respuesta = {
  [key: string]: string;
};

type PreguntaRespondida = {
  [key: string]: boolean;
};

// Tipo para el ranking de usuarios
type UserProgress = {
  userId: string;
  nombre: string;
  apellido: string;
  totalPuntos: number;
  preguntasRespondidas: number;
  porcentajeCompletado: number;
  modulosCompletados: number;
};

export default function DiscipuladoScreen() {
  const { isDarkMode, members, user } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();

  const [moduloActivo, setModuloActivo] = useState<string | null>(null);
  const [leccionActiva, setLeccionActiva] = useState<string | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta>({});
  const [preguntasRespondidas, setPreguntasRespondidas] = useState<PreguntaRespondida>({});
  const [topUsuarios, setTopUsuarios] = useState<UserProgress[]>([]);
  const [modulosPersonalizados, setModulosPersonalizados] = useState<Modulo[]>([]);

  const modulosBase: Record<'santidad' | 'espiritu', Modulo> = {
    santidad: moduloSantidad,
    espiritu: moduloEspirituSanto,
  };

  const modulos: Record<string, Modulo> = {
    ...modulosBase,
    ...modulosPersonalizados.reduce((acc, modulo) => {
      acc[modulo.id] = modulo;
      return acc;
    }, {} as Record<string, Modulo>),
  };

  useEffect(() => {
    cargarDatos();
    cargarModulosPersonalizados();
  }, []);

  useEffect(() => {
    calcularRanking();
  }, [preguntasRespondidas, members]);

  useEffect(() => {
    if (leccionActiva && moduloActivo) {
      const modulo = modulos[moduloActivo];
      const leccion = modulo?.lecciones.find(l => l.id === leccionActiva);
      if (!leccion) {
        setLeccionActiva(null);
        setSeccionActiva(null);
      }
    }
  }, [leccionActiva, moduloActivo]);

  useEffect(() => {
    if (seccionActiva && leccionActiva && moduloActivo) {
      const modulo = modulos[moduloActivo];
      const leccion = modulo?.lecciones.find(l => l.id === leccionActiva);
      const seccion = leccion?.secciones.find(s => s.id === seccionActiva);
      if (!seccion) {
        setSeccionActiva(null);
      }
    }
  }, [seccionActiva, leccionActiva, moduloActivo]);

  useEffect(() => {
    guardarDatos();
    // Recalcular ranking cuando cambian las respuestas
    if (Object.keys(preguntasRespondidas).length > 0) {
      calcularRanking();
    }
  }, [respuestas, preguntasRespondidas, moduloActivo, leccionActiva, seccionActiva]);

  const calcularRanking = async () => {
    try {
      const allUsersProgress: UserProgress[] = [];

      // Calcular progreso para cada miembro
      for (const member of members) {
        try {
          const userPreguntas = await AsyncStorage.getItem(`discipulado_preguntas_respondidas_${member.id}`);
          if (userPreguntas && userPreguntas !== 'null' && userPreguntas !== 'undefined') {
            const preguntasData = JSON.parse(userPreguntas) as PreguntaRespondida;
            let totalPuntos = 0;
            let preguntasContestadas = 0;
            let totalPreguntas = 0;

            Object.values(modulos).forEach(modulo => {
              modulo.lecciones.forEach(leccion => {
                leccion.secciones.forEach(seccion => {
                  if (seccion.preguntas) {
                    seccion.preguntas.forEach(pregunta => {
                      totalPreguntas++;
                      if (preguntasData[pregunta.id]) {
                        preguntasContestadas++;
                        totalPuntos += pregunta.puntos ?? 10;
                      }
                    });
                  }
                });
              });
            });

            if (preguntasContestadas > 0) {
              allUsersProgress.push({
                userId: member.id,
                nombre: member.nombre,
                apellido: member.apellido,
                totalPuntos,
                preguntasRespondidas: preguntasContestadas,
                porcentajeCompletado: totalPreguntas > 0 ? Math.round((preguntasContestadas / totalPreguntas) * 100) : 0,
                modulosCompletados: 0,
              });
            }
          }
        } catch (memberError) {
          console.error(`Error loading progress for member ${member.id}:`, memberError);
        }
      }

      // Calcular progreso del usuario actual
      if (user && Object.keys(preguntasRespondidas).length > 0) {
        let totalPuntos = 0;
        let preguntasContestadas = 0;
        let totalPreguntas = 0;

        Object.values(modulos).forEach(modulo => {
          modulo.lecciones.forEach(leccion => {
            leccion.secciones.forEach(seccion => {
              if (seccion.preguntas) {
                seccion.preguntas.forEach(pregunta => {
                  totalPreguntas++;
                  if (preguntasRespondidas[pregunta.id]) {
                    preguntasContestadas++;
                    totalPuntos += pregunta.puntos ?? 10;
                  }
                });
              }
            });
          });
        });

        // Verificar si el usuario actual ya está en la lista (por si es un miembro)
        const currentUserExists = allUsersProgress.find(u => u.userId === user.id);
        if (!currentUserExists && preguntasContestadas > 0) {
          allUsersProgress.push({
            userId: user.id,
            nombre: user.nombre || 'Usuario',
            apellido: user.apellido || 'Actual',
            totalPuntos,
            preguntasRespondidas: preguntasContestadas,
            porcentajeCompletado: totalPreguntas > 0 ? Math.round((preguntasContestadas / totalPreguntas) * 100) : 0,
            modulosCompletados: 0,
          });
        } else if (currentUserExists && preguntasContestadas > 0) {
          // Actualizar el progreso del usuario actual si ya existe
          const index = allUsersProgress.findIndex(u => u.userId === user.id);
          if (index !== -1) {
            allUsersProgress[index] = {
              ...allUsersProgress[index],
              totalPuntos,
              preguntasRespondidas: preguntasContestadas,
              porcentajeCompletado: totalPreguntas > 0 ? Math.round((preguntasContestadas / totalPreguntas) * 100) : 0,
            };
          }
        }
      }

      const sortedUsers = allUsersProgress
        .sort((a, b) => b.totalPuntos - a.totalPuntos)
        .slice(0, 5);

      setTopUsuarios(sortedUsers);
    } catch (error) {
      console.error('Error calculando ranking:', error);
    }
  };

  const cargarModulosPersonalizados = async () => {
    try {
      const stored = await AsyncStorage.getItem('custom_modulos');
      if (stored) {
        const customModulos = JSON.parse(stored) as Modulo[];
        setModulosPersonalizados(customModulos);
      }
    } catch (error) {
      console.error('Error cargando módulos personalizados:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      // Intentar cargar datos específicos del usuario primero
      let respuestasGuardadas = null;
      let preguntasGuardadas = null;
      
      if (user) {
        respuestasGuardadas = await AsyncStorage.getItem(`discipulado_respuestas_${user.id}`);
        preguntasGuardadas = await AsyncStorage.getItem(`discipulado_preguntas_respondidas_${user.id}`);
      }
      
      // Si no hay datos específicos del usuario, cargar datos genéricos
      if (!respuestasGuardadas) {
        respuestasGuardadas = await AsyncStorage.getItem('discipulado_respuestas');
      }
      if (!preguntasGuardadas) {
        preguntasGuardadas = await AsyncStorage.getItem('discipulado_preguntas_respondidas');
      }
      
      const estadoGuardado = await AsyncStorage.getItem('discipulado_estado');

      if (respuestasGuardadas) {
        setRespuestas(JSON.parse(respuestasGuardadas));
      }
      if (preguntasGuardadas) {
        setPreguntasRespondidas(JSON.parse(preguntasGuardadas));
      }

      if (estadoGuardado) {
        try {
          const estado = JSON.parse(estadoGuardado) as {
            moduloActivo?: string | null;
            leccionActiva?: string | null;
            seccionActiva?: string | null;
          };
          if (estado.moduloActivo) {
            const modulo = modulos[estado.moduloActivo] || modulosBase[estado.moduloActivo as 'santidad' | 'espiritu'];
            const leccionValida = modulo.lecciones.find((l: any) => l.id === estado.leccionActiva);

            if (leccionValida) {
              setModuloActivo(estado.moduloActivo);
              setLeccionActiva(estado.leccionActiva ?? null);

              if (estado.seccionActiva) {
                const seccionValida = leccionValida.secciones.find((s: any) => s.id === estado.seccionActiva);
                if (seccionValida) {
                  setSeccionActiva(estado.seccionActiva);
                }
              }
            }
          }
        } catch (e) {
          console.log('Estado guardado inválido, iniciando desde cero');
          await AsyncStorage.removeItem('discipulado_estado');
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert(
        'Error al cargar datos',
        'Hubo un problema al cargar tu progreso. ¿Deseas reiniciar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Reiniciar',
            onPress: async () => {
              await AsyncStorage.multiRemove([
                'discipulado_respuestas',
                'discipulado_preguntas_respondidas',
                'discipulado_estado',
              ]);
              setRespuestas({});
              setPreguntasRespondidas({});
              setModuloActivo(null);
              setLeccionActiva(null);
              setSeccionActiva(null);
            },
          },
        ]
      );
    }
  };

  const guardarDatos = async () => {
    try {
      // Guardar respuestas y preguntas respondidas del usuario actual
      if (user) {
        await AsyncStorage.setItem(`discipulado_respuestas_${user.id}`, JSON.stringify(respuestas));
        await AsyncStorage.setItem(`discipulado_preguntas_respondidas_${user.id}`, JSON.stringify(preguntasRespondidas));
        
        // También guardar en las claves genéricas para compatibilidad
        await AsyncStorage.setItem('discipulado_respuestas', JSON.stringify(respuestas));
        await AsyncStorage.setItem('discipulado_preguntas_respondidas', JSON.stringify(preguntasRespondidas));
      } else {
        await AsyncStorage.setItem('discipulado_respuestas', JSON.stringify(respuestas));
        await AsyncStorage.setItem('discipulado_preguntas_respondidas', JSON.stringify(preguntasRespondidas));
      }
      
      const estado = { moduloActivo, leccionActiva, seccionActiva };
      await AsyncStorage.setItem('discipulado_estado', JSON.stringify(estado));
    } catch (error) {
      console.error('Error guardando datos:', error);
    }
  };

  const handleRespuestaChange = (preguntaId: string, texto: string) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: texto,
    }));
  };

  const marcarComoRespondida = (preguntaId: string) => {
    setPreguntasRespondidas(prev => ({
      ...prev,
      [preguntaId]: !prev[preguntaId],
    }));
  };

  const calcularProgreso = (tgtLeccionId: string) => {
    const modulo = moduloActivo ? modulos[moduloActivo] : null;
    if (!modulo) return 0;
    const leccion = modulo.lecciones.find(l => l.id === tgtLeccionId);
    if (!leccion) return 0;

    const totalPreguntas = leccion.secciones.reduce((acc, s) => acc + (s.preguntas?.length ?? 0), 0);
    if (totalPreguntas === 0) return 0;

    const preguntasCompletadas = leccion.secciones.reduce((acc, s) => {
      const completadas = s.preguntas?.filter(p => preguntasRespondidas[p.id]).length ?? 0;
      return acc + completadas;
    }, 0);

    return Math.round((preguntasCompletadas / totalPreguntas) * 100);
  };

  const renderModulos = () => {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Discipulado" subtitle="Crecimiento espiritual" />
        
        {user?.role === 'admin' && (
          <TouchableOpacity
            style={[styles.adminButton, { backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb' }]}
            onPress={() => router.push('/gestion-modulos')}
            testID="admin-gestion-modulos"
          >
            <Settings size={20} color="#ffffff" />
            <Text style={styles.adminButtonText}>Gestionar Módulos</Text>
          </TouchableOpacity>
        )}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} testID="discipulado-scroll">
          <View style={[styles.rankingCard, {
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }]}
          >
            <View style={styles.rankingHeader}>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', top: -8, left: '30%', right: '30%', height: 4, borderRadius: 2 }}
              />
              <Text style={[styles.rankingTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>🏆 Top 5 - Mejores Puntuaciones</Text>
              <Text style={[styles.rankingSubtitle, { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13, marginTop: 4, textAlign: 'center' }]}>Líderes en el camino del discipulado</Text>
            </View>

            <View style={styles.rankingTable}>
              {topUsuarios.length > 0 ? (
                topUsuarios.map((usuario, index) => (
                  <View key={usuario.userId} style={[styles.rankingRow, {
                    backgroundColor: index === 0
                      ? (isDarkMode ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.05)')
                      : index === 1
                      ? (isDarkMode ? 'rgba(192,192,192,0.08)' : 'rgba(192,192,192,0.04)')
                      : index === 2
                      ? (isDarkMode ? 'rgba(205,127,50,0.08)' : 'rgba(205,127,50,0.04)')
                      : 'transparent',
                    borderBottomWidth: index < topUsuarios.length - 1 ? 1 : 0,
                    borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0',
                    borderRadius: index === 0 ? 12 : 8,
                    marginBottom: index === 0 ? 4 : 0,
                  }]}
                  >
                    <View style={[styles.rankingPosition, { width: index < 3 ? 48 : 40 }]}>
                      <Text style={[styles.rankingPositionText, { fontSize: index === 0 ? 28 : index < 3 ? 24 : 16 }]}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                      </Text>
                    </View>

                    <View style={styles.rankingUserInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.rankingUserName, { color: isDarkMode ? '#f1f5f9' : '#1e293b', fontWeight: index === 0 ? '700' : '600', fontSize: index === 0 ? 16 : 15 }]}>
                          {usuario.nombre} {usuario.apellido}
                        </Text>
                        {index === 0 && (
                          <View style={{ backgroundColor: '#fbbf24', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ fontSize: 10, color: '#78350f', fontWeight: '700' }}>LÍDER</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.rankingStats}>
                        <View style={{ backgroundColor: isDarkMode ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={[styles.rankingStatText, { color: '#22c55e', fontSize: 11, fontWeight: '600' }]}>
                            {usuario.preguntasRespondidas} preguntas
                          </Text>
                        </View>
                        <View style={{ backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={[styles.rankingStatText, { color: '#3b82f6', fontSize: 11, fontWeight: '600' }]}>
                            {usuario.porcentajeCompletado}% completado
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.rankingPoints}>
                      <Text style={[styles.rankingPointsText, { color: index === 0 ? '#fbbf24' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : isDarkMode ? '#60a5fa' : '#3b82f6', fontWeight: '700', fontSize: index === 0 ? 22 : 18 }]}>
                        {usuario.totalPuntos}
                      </Text>
                      <Text style={[styles.rankingPointsLabel, { color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11 }]}>puntos</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
                  <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 14, textAlign: 'center' }}>
                    Aún no hay puntuaciones registradas.
                  </Text>
                  <Text style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                    ¡Sé el primero en completar las lecciones!
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.progressCard, {
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 8,
              borderRadius: 16,
              borderWidth: 1,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }]}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f8fafc']}
                style={{ padding: 16 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={[styles.progressIconContainer, { 
                    backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    marginRight: 12
                  }]}>
                    <Text style={{ fontSize: 22 }}>🎓</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.progressTitle, { 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b', 
                      marginBottom: 2,
                      fontSize: 16,
                      fontWeight: '700'
                    }]}>Mi Progreso en Discipulado</Text>
                    <Text style={{ 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: 12
                    }}>Continúa creciendo en tu fe</Text>
                  </View>
                </View>

                <View style={styles.progressGrid}>
                  <View style={[styles.progressItem, {
                    backgroundColor: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)'
                  }]}>
                    <View style={[styles.progressIconContainer, { 
                      backgroundColor: isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)',
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginBottom: 8
                    }]}>
                      <BookOpen size={18} color="#3b82f6" />
                    </View>
                    <Text style={[styles.progressValue, { 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      fontSize: 22,
                      fontWeight: '700',
                      marginBottom: 2
                    }]}>
                      {(() => {
                        let leccionesCompletadas = 0;
                        Object.values(modulos).forEach(m => {
                          m.lecciones.forEach(l => {
                            const progreso = calcularProgreso(l.id);
                            if (progreso === 100) leccionesCompletadas++;
                          });
                        });
                        return leccionesCompletadas;
                      })()}
                    </Text>
                    <Text style={[styles.progressLabel, { 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: 11,
                      fontWeight: '600'
                    }]}>Lecciones</Text>
                  </View>

                  <View style={[styles.progressItem, {
                    backgroundColor: isDarkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)',
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)'
                  }]}>
                    <View style={[styles.progressIconContainer, { 
                      backgroundColor: isDarkMode ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)',
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginBottom: 8
                    }]}>
                      <Check size={18} color="#22c55e" />
                    </View>
                    <Text style={[styles.progressValue, { 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      fontSize: 22,
                      fontWeight: '700',
                      marginBottom: 2
                    }]}>
                      {Object.keys(preguntasRespondidas).filter(key => preguntasRespondidas[key]).length}
                    </Text>
                    <Text style={[styles.progressLabel, { 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: 11,
                      fontWeight: '600'
                    }]}>Preguntas</Text>
                  </View>

                  <View style={[styles.progressItem, {
                    backgroundColor: isDarkMode ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.05)',
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(251,146,60,0.2)' : 'rgba(251,146,60,0.1)'
                  }]}>
                    <View style={[styles.progressIconContainer, { 
                      backgroundColor: isDarkMode ? 'rgba(251,146,60,0.2)' : 'rgba(251,146,60,0.15)',
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginBottom: 8,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }]}>
                      <Text style={{ fontSize: 18 }}>🏆</Text>
                    </View>
                    <Text style={[styles.progressValue, { 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      fontSize: 22,
                      fontWeight: '700',
                      marginBottom: 2
                    }]}>
                      {(() => {
                        let totalPuntos = 0;
                        Object.values(modulos).forEach(m => {
                          m.lecciones.forEach(l => {
                            l.secciones.forEach(s => {
                              s.preguntas?.forEach(p => {
                                if (preguntasRespondidas[p.id]) totalPuntos += p.puntos ?? 10;
                              });
                            });
                          });
                        });
                        return totalPuntos;
                      })()}
                    </Text>
                    <Text style={[styles.progressLabel, { 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: 11,
                      fontWeight: '600'
                    }]}>Puntos</Text>
                  </View>

                  <View style={[styles.progressItem, {
                    backgroundColor: isDarkMode ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)',
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.1)'
                  }]}>
                    <View style={[styles.progressIconContainer, { 
                      backgroundColor: isDarkMode ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)',
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginBottom: 8,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }]}>
                      <Text style={{ fontSize: 18 }}>📈</Text>
                    </View>
                    <Text style={[styles.progressValue, { 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      fontSize: 22,
                      fontWeight: '700',
                      marginBottom: 2
                    }]}>
                      {(() => {
                        let totalPreguntas = 0;
                        let preguntasContestadas = 0;
                        Object.values(modulos).forEach(m => {
                          m.lecciones.forEach(l => {
                            l.secciones.forEach(s => {
                              if (s.preguntas) {
                                totalPreguntas += s.preguntas.length;
                                s.preguntas.forEach(p => {
                                  if (preguntasRespondidas[p.id]) preguntasContestadas++;
                                });
                              }
                            });
                          });
                        });
                        return totalPreguntas > 0 ? Math.round((preguntasContestadas / totalPreguntas) * 100) + '%' : '0%';
                      })()}
                    </Text>
                    <Text style={[styles.progressLabel, { 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: 11,
                      fontWeight: '600'
                    }]}>Avance</Text>
                  </View>
                </View>

                <View style={[styles.progressMessage, { 
                  backgroundColor: isDarkMode ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)', 
                  borderLeftWidth: 3, 
                  borderLeftColor: '#22c55e', 
                  marginTop: 12, 
                  padding: 12, 
                  borderRadius: 8
                }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: isDarkMode ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8
                    }}>
                      <Text style={{ fontSize: 14 }}>✅</Text>
                    </View>
                    <Text style={[styles.progressMessageText, { 
                      color: isDarkMode ? '#86efac' : '#16a34a', 
                      flex: 1,
                      fontSize: 12,
                      fontWeight: '600',
                      lineHeight: 16
                    }]}>¡Excelente progreso! Sigue adelante.</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <TouchableOpacity
              style={[styles.moduloCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }]}
              onPress={() => {
                setModuloActivo('santidad');
                setLeccionActiva(null);
                setSeccionActiva(null);
              }}
              testID="modulo-santidad"
            >
              <View style={[styles.moduloIcon, { backgroundColor: '#7c3aed' }]}>
                <Text style={styles.moduloEmoji}>✨</Text>
              </View>
              <View style={styles.moduloInfo}>
                <Text style={[styles.moduloTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>{modulosBase.santidad.titulo}</Text>
                <Text style={[styles.moduloDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{modulosBase.santidad.descripcion}</Text>
                <View style={styles.moduloMeta}>
                  <Text style={[styles.moduloLessons, { color: isDarkMode ? '#a78bfa' : '#7c3aed' }]}>{modulosBase.santidad.lecciones.length} lecciones</Text>
                </View>
              </View>
              <ChevronRight size={24} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.moduloCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }]}
              onPress={() => {
                setModuloActivo('espiritu');
                setLeccionActiva(null);
                setSeccionActiva(null);
              }}
              testID="modulo-espiritu"
            >
              <View style={[styles.moduloIcon, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.moduloEmoji}>🔥</Text>
              </View>
              <View style={styles.moduloInfo}>
                <Text style={[styles.moduloTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>{modulosBase.espiritu.titulo}</Text>
                <Text style={[styles.moduloDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{modulosBase.espiritu.descripcion}</Text>
                <View style={styles.moduloMeta}>
                  <Text style={[styles.moduloLessons, { color: isDarkMode ? '#60a5fa' : '#3b82f6' }]}>{modulosBase.espiritu.lecciones.length} lecciones</Text>
                </View>
              </View>
              <ChevronRight size={24} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            </TouchableOpacity>

            {modulosPersonalizados.map((modulo, index) => {
              const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
              const emojis = ['📚', '🎓', '📖', '✍️', '🌟'];
              const bgColor = colors[index % colors.length];
              const emoji = emojis[index % emojis.length];

              return (
                <TouchableOpacity
                  key={modulo.id}
                  style={[styles.moduloCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }]}
                  onPress={() => {
                    setModuloActivo(modulo.id);
                    setLeccionActiva(null);
                    setSeccionActiva(null);
                  }}
                  testID={`modulo-${modulo.id}`}
                >
                  <View style={[styles.moduloIcon, { backgroundColor: bgColor }]}>
                    <Text style={styles.moduloEmoji}>{emoji}</Text>
                  </View>
                  <View style={styles.moduloInfo}>
                    <Text style={[styles.moduloTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>{modulo.titulo}</Text>
                    <Text style={[styles.moduloDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{modulo.descripcion}</Text>
                    <View style={styles.moduloMeta}>
                      <Text style={[styles.moduloLessons, { color: bgColor }]}>{modulo.lecciones.length} lecciones</Text>
                      <View style={{ backgroundColor: `${bgColor}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 }}>
                        <Text style={{ color: bgColor, fontSize: 10, fontWeight: '600' }}>PERSONALIZADO</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={24} color={isDarkMode ? '#64748b' : '#94a3b8'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderLecciones = () => {
    const modulo = moduloActivo ? modulos[moduloActivo] : null;
    if (!modulo) return null;

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {modulo.lecciones.map((leccion) => {
          const progreso = calcularProgreso(leccion.id);
          return (
            <TouchableOpacity
              key={leccion.id}
              style={[styles.leccionCard, isDarkMode && styles.leccionCardDark]}
              onPress={() => {
                setLeccionActiva(leccion.id);
                setSeccionActiva(null);
              }}
            >
              <View style={styles.leccionHeader}>
                <View style={[styles.leccionNumero, isDarkMode && styles.leccionNumeroDark]}>
                  <Text style={styles.leccionNumeroText}>{leccion.numero}</Text>
                </View>
                <View style={styles.leccionInfo}>
                  <Text style={[styles.leccionTitulo, isDarkMode && styles.leccionTituloDark]}>{leccion.titulo}</Text>
                  <Text style={[styles.leccionSubtitulo, isDarkMode && styles.leccionSubtituloDark]}>{leccion.subtitulo}</Text>
                </View>
              </View>

              {progreso > 0 && (
                <View style={styles.progresoContainer}>
                  <View style={[styles.progresoBar, isDarkMode && styles.progresoBarDark]}>
                    <View style={[styles.progresoFill, { width: `${progreso}%` }]} />
                  </View>
                  <Text style={[styles.progresoText, isDarkMode && styles.progresoTextDark]}>{progreso}%</Text>
                </View>
              )}

              <View style={styles.leccionFooter}>
                {leccion.secciones.map((seccion) => (
                  <TouchableOpacity
                    key={seccion.id}
                    style={[styles.seccionButton, isDarkMode && styles.seccionButtonDark]}
                    onPress={() => {
                      setLeccionActiva(leccion.id);
                      setSeccionActiva(seccion.id);
                    }}
                  >
                    <Text style={[styles.seccionButtonText, isDarkMode && styles.seccionButtonTextDark]}>{seccion.titulo}</Text>
                    <ChevronRight size={16} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderSeccion = () => {
    try {
      const modulo = moduloActivo ? modulos[moduloActivo] : null;
      if (!modulo || !leccionActiva || !seccionActiva) return null;

      const leccion = modulo.lecciones.find(l => l.id === leccionActiva);
      if (!leccion) {
        setLeccionActiva(null);
        setSeccionActiva(null);
        return null;
      }

      const seccion = leccion.secciones.find(s => s.id === seccionActiva);
      if (!seccion) {
        setSeccionActiva(null);
        return null;
      }

      const seccionIndex = leccion.secciones.findIndex(s => s.id === seccionActiva);
      const haySeccionAnterior = seccionIndex > 0;
      const haySeccionSiguiente = seccionIndex < leccion.secciones.length - 1;

      const sectionColors = moduloActivo === 'santidad' ? {
        conocer: { bg: isDarkMode ? '#1e3a5f' : '#e8f4fd', border: isDarkMode ? '#4a90e2' : '#2196f3', icon: '📖' },
        reflexionar: { bg: isDarkMode ? '#4a2c5e' : '#f3e5f5', border: isDarkMode ? '#9c27b0' : '#7b1fa2', icon: '💭' },
        examinar: { bg: isDarkMode ? '#5d4037' : '#fff3e0', border: isDarkMode ? '#ff9800' : '#f57c00', icon: '🔍' },
        aplicar: { bg: isDarkMode ? '#2e5d3e' : '#e8f5e9', border: isDarkMode ? '#4caf50' : '#388e3c', icon: '✨' },
        introduccion: { bg: isDarkMode ? '#37474f' : '#eceff1', border: isDarkMode ? '#607d8b' : '#455a64', icon: '🎯' },
        conclusion: { bg: isDarkMode ? '#4e342e' : '#efebe9', border: isDarkMode ? '#8d6e63' : '#5d4037', icon: '🏁' },
      } : {
        conocer: { bg: isDarkMode ? '#1b4332' : '#d4edda', border: isDarkMode ? '#2e7d32' : '#28a745', icon: '📖' },
        reflexionar: { bg: isDarkMode ? '#1e3a5f' : '#d1ecf1', border: isDarkMode ? '#1976d2' : '#17a2b8', icon: '💭' },
        examinar: { bg: isDarkMode ? '#5d4037' : '#fff3cd', border: isDarkMode ? '#ffa000' : '#ffc107', icon: '🔍' },
        aplicar: { bg: isDarkMode ? '#4a148c' : '#f8d7da', border: isDarkMode ? '#e91e63' : '#dc3545', icon: '✨' },
        introduccion: { bg: isDarkMode ? '#263238' : '#f5f5f5', border: isDarkMode ? '#546e7a' : '#6c757d', icon: '🎯' },
        conclusion: { bg: isDarkMode ? '#3e2723' : '#efebe9', border: isDarkMode ? '#6d4c41' : '#795548', icon: '🏁' },
      };

      const currentSectionColor = (sectionColors as any)[seccion.tipo] || (sectionColors as any).introduccion;

      return (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.navegacionBotones}>
            {haySeccionAnterior && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                onPress={() => {
                  const nuevaSeccion = leccion.secciones[seccionIndex - 1];
                  if (nuevaSeccion) setSeccionActiva(nuevaSeccion.id);
                }}
              >
                <ChevronLeft size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.navButtonText, { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13 }]}>Anterior</Text>
              </TouchableOpacity>
            )}
            {haySeccionSiguiente && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                onPress={() => {
                  const nuevaSeccion = leccion.secciones[seccionIndex + 1];
                  if (nuevaSeccion) setSeccionActiva(nuevaSeccion.id);
                }}
              >
                <Text style={[styles.navButtonText, { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13 }]}>Siguiente</Text>
                <ChevronRight size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            )}
          </View>


          <View style={[styles.seccionHeader, { backgroundColor: currentSectionColor.bg, borderLeftWidth: 4, borderLeftColor: currentSectionColor.border, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>{currentSectionColor.icon}</Text>
              <Text style={[styles.seccionTitulo, { color: isDarkMode ? '#f1f5f9' : '#1e293b', flex: 1 }]}>{seccion.titulo}</Text>
            </View>
          </View>

          {seccion.contenido && (
            <View style={[styles.contenidoCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: 12, marginHorizontal: 16, marginTop: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 }]}
            >
              <Text style={[styles.contenidoTexto, { color: isDarkMode ? '#e2e8f0' : '#334155' }]}>{seccion.contenido}</Text>
            </View>
          )}


          {seccion.objetivo && (
            <View style={[{ backgroundColor: isDarkMode ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.08)', borderWidth: 1, borderColor: '#fb923c40', borderRadius: 12, marginHorizontal: 16, marginTop: 12, padding: 16 }]}
            >
              <Text style={{ color: '#ea580c', fontWeight: '600', marginBottom: 4 }}>🎯 Objetivo:</Text>
              <Text style={{ color: isDarkMode ? '#fed7aa' : '#7c2d12' }}>{seccion.objetivo}</Text>
            </View>
          )}

          {seccion.preguntas && seccion.preguntas.map((pregunta: Pregunta, index: number) => (
            <View key={pregunta.id} style={[styles.preguntaCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: 12, marginHorizontal: 16, marginTop: 12, padding: 16, borderWidth: 1, borderColor: preguntasRespondidas[pregunta.id] ? '#10b981' : (isDarkMode ? '#334155' : '#e2e8f0'), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 }]}
            >
              <View style={styles.preguntaHeader}>
                <View style={{ backgroundColor: currentSectionColor.border, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{index + 1}</Text>
                </View>
                <Text style={[styles.preguntaTexto, { color: isDarkMode ? '#f1f5f9' : '#1e293b', flex: 1, fontSize: 15, lineHeight: 22 }]}>{pregunta.texto}</Text>
                {preguntasRespondidas[pregunta.id] && (<Check size={24} color="#10b981" />)}
              </View>

              <TextInput
                style={[styles.respuestaInput, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderColor: isDarkMode ? '#334155' : '#cbd5e1', borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12, marginLeft: 44, color: isDarkMode ? '#e2e8f0' : '#1e293b', minHeight: 100, textAlignVertical: 'top' }]}
                placeholder="Escribe tu respuesta aquí..."
                placeholderTextColor={isDarkMode ? '#64748b' : '#94a3b8'}
                multiline
                numberOfLines={4}
                value={respuestas[pregunta.id] ?? ''}
                onChangeText={(texto) => handleRespuestaChange(pregunta.id, texto)}
                testID={`respuesta-${pregunta.id}`}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginLeft: 44 }}>
                <View style={{ backgroundColor: `${currentSectionColor.border}20`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: currentSectionColor.border, fontSize: 12, fontWeight: '600' }}>{pregunta.puntos} puntos</Text>
                </View>
                <TouchableOpacity
                  style={[{ backgroundColor: preguntasRespondidas[pregunta.id] ? '#10b981' : currentSectionColor.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }]}
                  onPress={() => marcarComoRespondida(pregunta.id)}
                  testID={`marcar-${pregunta.id}`}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                    {preguntasRespondidas[pregunta.id] ? '✓ Respondida' : 'Marcar como respondida'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}


          {seccion.desafio && (
            <View style={[styles.desafioCard, { backgroundColor: isDarkMode ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.08)', borderWidth: 2, borderColor: '#fb923c', borderRadius: 12, marginHorizontal: 16, marginTop: 16, padding: 16 }]}
            >
              <Text style={[styles.desafioTitulo, { color: '#ea580c', fontWeight: '700', fontSize: 16, marginBottom: 8 }]}>⚡ Desafío de la semana:</Text>
              <Text style={[styles.desafioTexto, { color: isDarkMode ? '#fed7aa' : '#7c2d12', fontSize: 15, lineHeight: 22 }]}>{seccion.desafio}</Text>
            </View>
          )}

          {seccion.preguntasProfundizar && seccion.preguntasProfundizar.length > 0 && (
            <View style={[styles.profundizarCard, { backgroundColor: isDarkMode ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)', borderLeftWidth: 3, borderLeftColor: '#a855f7', borderRadius: 12, marginHorizontal: 16, marginTop: 16, padding: 16 }]}
            >
              <Text style={[styles.profundizarTitulo, { color: '#9333ea', fontWeight: '600', fontSize: 15, marginBottom: 8 }]}>💭 Preguntas para profundizar en la semana:</Text>
              {seccion.preguntasProfundizar.map((p: string, index: number) => (
                <Text key={`profundizar-${index}`} style={[styles.profundizarTexto, { color: isDarkMode ? '#e9d5ff' : '#6b21a8', marginLeft: 8, marginTop: 6, fontSize: 14, lineHeight: 20 }]}>• {p}</Text>
              ))}
            </View>
          )}

          <View style={styles.navegacionBotones}>
            {haySeccionAnterior && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                onPress={() => {
                  const nuevaSeccion = leccion.secciones[seccionIndex - 1];
                  if (nuevaSeccion) setSeccionActiva(nuevaSeccion.id);
                }}
              >
                <ChevronLeft size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                <Text style={[styles.navButtonText, { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13 }]}>Anterior</Text>
              </TouchableOpacity>
            )}
            {haySeccionSiguiente && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                onPress={() => {
                  const nuevaSeccion = leccion.secciones[seccionIndex + 1];
                  if (nuevaSeccion) setSeccionActiva(nuevaSeccion.id);
                }}
              >
                <Text style={[styles.navButtonText, { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13 }]}>Siguiente</Text>
                <ChevronRight size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDarkMode && styles.footerTextDark]}>iglesiacasadedios33@gmail.com</Text>
          </View>
        </ScrollView>
      );
    } catch (error) {
      console.error('Error renderizando sección:', error);
      setLeccionActiva(null);
      setSeccionActiva(null);
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: isDarkMode ? '#f87171' : '#dc2626', fontSize: 16, textAlign: 'center' }}>Error al cargar la sección. Por favor, intenta nuevamente.</Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => {
              setLeccionActiva(null);
              setSeccionActiva(null);
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Volver a lecciones</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (!moduloActivo) {
    return renderModulos();
  }

  if (moduloActivo && !leccionActiva) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>        
        <AppHeader 
          title={modulos[moduloActivo].titulo}
          subtitle="Selecciona una lección"
          showBackButton
          onBackPress={() => {
            setModuloActivo(null);
            setLeccionActiva(null);
            setSeccionActiva(null);
          }}
        />
        {renderLecciones()}
      </View>
    );
  }

  if (moduloActivo && leccionActiva && !seccionActiva) {
    const modulo = modulos[moduloActivo];
    const leccion = modulo?.lecciones.find(l => l.id === leccionActiva);

    if (!leccion) {
      setLeccionActiva(null);
      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>          
          <AppHeader 
            title={modulos[moduloActivo].titulo}
            subtitle="Selecciona una lección"
            showBackButton
            onBackPress={() => {
              setModuloActivo(null);
              setLeccionActiva(null);
              setSeccionActiva(null);
            }}
          />
          {renderLecciones()}
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>        
        <AppHeader 
          title={leccion.titulo}
          subtitle="Selecciona una sección"
          showBackButton
          onBackPress={() => {
            setLeccionActiva(null);
          }}
        />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {leccion.secciones.map((seccion) => (
            <TouchableOpacity
              key={seccion.id}
              style={[styles.seccionButton, isDarkMode && styles.seccionButtonDark, { marginHorizontal: 16, marginTop: 12, padding: 16, backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 }]}
              onPress={() => {
                setSeccionActiva(seccion.id);
              }}
            >
              <Text style={[styles.seccionButtonText, isDarkMode && styles.seccionButtonTextDark, { fontSize: 16, fontWeight: '600' }]}>{seccion.titulo}</Text>
              <ChevronRight size={20} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (moduloActivo && leccionActiva && seccionActiva) {
    const modulo = modulos[moduloActivo];
    const leccion = modulo?.lecciones.find(l => l.id === leccionActiva);
    const seccion = leccion?.secciones.find(s => s.id === seccionActiva);

    if (!modulo || !leccion || !seccion) {
      if (!seccion) {
        setSeccionActiva(null);
      } else if (!leccion) {
        setLeccionActiva(null);
        setSeccionActiva(null);
      } else {
        setModuloActivo(null);
        setLeccionActiva(null);
        setSeccionActiva(null);
      }

      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>          
          <AppHeader title="Discipulado" subtitle="Selecciona una opción" />
          {renderModulos()}
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>        
        <AppHeader 
          title={seccion.titulo || 'Sección'}
          subtitle={leccion.titulo}
          showBackButton
          onBackPress={() => {
            setSeccionActiva(null);
          }}
        />
        {renderSeccion()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <AppHeader 
        title={moduloActivo ? modulos[moduloActivo].titulo : 'Discipulado'}
        subtitle="Selecciona una lección"
        showBackButton={!!moduloActivo}
        onBackPress={() => {
          setModuloActivo(null);
          setLeccionActiva(null);
          setSeccionActiva(null);
        }}
      />
      {moduloActivo ? renderLecciones() : renderModulos()}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  safeAreaDark: { backgroundColor: '#0f172a' },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerContent: { marginBottom: 0 },
  title: { fontSize: 24, fontWeight: 'bold' },
  themeToggle: { flexDirection: 'row', alignItems: 'center' },
  liderToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  liderText: { fontSize: 14, fontWeight: '500' },
  moduloCard: { flexDirection: 'row', alignItems: 'center', padding: 20, marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  moduloIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  moduloEmoji: { fontSize: 24 },
  moduloInfo: { flex: 1 },
  moduloTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  moduloDescription: { fontSize: 14, marginBottom: 8 },
  moduloMeta: { flexDirection: 'row', alignItems: 'center' },
  moduloLessons: { fontSize: 12, fontWeight: '500' },
  navegacionHeader: { padding: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  rotatedIcon: { transform: [{ rotate: '180deg' }] },
  backText: { fontSize: 16, marginLeft: 8 },
  backTextDark: { color: '#60a5fa' },
  moduloHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  moduloHeaderTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  moduloHeaderTitleDark: { color: '#f3f4f6' },
  moduloHeaderDescription: { fontSize: 14, color: '#6b7280' },
  moduloHeaderDescriptionDark: { color: '#9ca3af' },
  leccionCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  leccionCardDark: { backgroundColor: '#1e293b' },
  leccionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  leccionNumero: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  leccionNumeroDark: { backgroundColor: '#60a5fa' },
  leccionNumeroText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  leccionInfo: { flex: 1 },
  leccionTitulo: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  leccionTituloDark: { color: '#f3f4f6' },
  leccionSubtitulo: { fontSize: 14, color: '#6b7280' },
  leccionSubtituloDark: { color: '#9ca3af' },
  progresoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progresoBar: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginRight: 8 },
  progresoBarDark: { backgroundColor: '#374151' },
  progresoFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  progresoText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  progresoTextDark: { color: '#9ca3af' },
  leccionFooter: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12 },
  seccionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 4, backgroundColor: '#f9fafb', borderRadius: 8 },
  seccionButtonDark: { backgroundColor: '#0f172a' },
  seccionButtonText: { fontSize: 14, color: '#4b5563' },
  seccionButtonTextDark: { color: '#d1d5db' },
  seccionHeader: { padding: 20 },
  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  seccionTituloDark: { color: '#f3f4f6' },
  contenidoCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 },
  contenidoCardDark: { backgroundColor: '#1e293b' },
  contenidoTexto: { fontSize: 15, lineHeight: 24, color: '#374151' },
  contenidoTextoDark: { color: '#e5e7eb' },
  preguntaCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 },
  preguntaCardDark: { backgroundColor: '#1e293b' },
  preguntaRespondida: { borderColor: '#10b981', borderWidth: 2 },
  preguntaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  preguntaNumero: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginRight: 8 },
  preguntaNumeroDark: { color: '#9ca3af' },
  preguntaTexto: { fontSize: 15, color: '#1f2937', lineHeight: 22 },
  preguntaTextoDark: { color: '#f3f4f6' },
  respuestaInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top', backgroundColor: '#f9fafb' },
  respuestaInputDark: { backgroundColor: '#0f172a', borderColor: '#374151', color: '#f3f4f6' },
  marcarButton: { backgroundColor: '#3b82f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  marcarButtonCompletado: { backgroundColor: '#10b981' },
  marcarButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  marcarButtonTextCompletado: { color: '#fff' },
  versiculosCard: { backgroundColor: '#f3f4f6', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16 },
  versiculosCardDark: { backgroundColor: '#1e293b' },
  versiculosTitulo: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  versiculosTituloDark: { color: '#f3f4f6' },
  versiculoTexto: { fontSize: 14, color: '#4b5563', marginLeft: 8, marginTop: 4 },
  versiculoTextoDark: { color: '#d1d5db' },
  desafioCard: { backgroundColor: '#fef3c7', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#fbbf24' },
  desafioCardDark: { backgroundColor: '#78350f', borderColor: '#fbbf24' },
  desafioTitulo: { fontSize: 16, fontWeight: '700', color: '#92400e', marginBottom: 8 },
  desafioTituloDark: { color: '#fef3c7' },
  desafioTexto: { fontSize: 14, color: '#78350f', lineHeight: 20 },
  desafioTextoDark: { color: '#fde68a' },
  profundizarCard: { backgroundColor: '#ede9fe', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16 },
  profundizarCardDark: { backgroundColor: '#2e1065' },
  profundizarTitulo: { fontSize: 15, fontWeight: '600', color: '#5b21b6', marginBottom: 8 },
  profundizarTituloDark: { color: '#c4b5fd' },
  profundizarTexto: { fontSize: 14, color: '#6d28d9', marginLeft: 8, marginTop: 4 },
  profundizarTextoDark: { color: '#ddd6fe' },
  navegacionBotones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 12, gap: 8 },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  navButtonAnterior: { backgroundColor: '#6b7280' },
  navButtonSiguiente: { backgroundColor: '#3b82f6' },
  navButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', marginHorizontal: 4 },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9ca3af' },
  footerTextDark: { color: '#6b7280' },
  rankingCard: { backgroundColor: '#fff' },
  rankingHeader: { marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', position: 'relative' },
  rankingTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
  rankingSubtitle: { fontSize: 13, textAlign: 'center' },
  rankingTable: { gap: 0 },
  rankingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, marginHorizontal: -4 },
  rankingPosition: { width: 40, alignItems: 'center' },
  rankingPositionText: { fontWeight: '600' },
  rankingUserInfo: { flex: 1, marginLeft: 8 },
  rankingUserName: { fontSize: 15, marginBottom: 2 },
  rankingStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rankingStatText: { fontSize: 12 },
  rankingPoints: { alignItems: 'flex-end' },
  rankingPointsText: { fontSize: 18 },
  rankingPointsLabel: { fontSize: 11, marginTop: -2 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 30, paddingBottom: 24, elevation: 4, shadowOpacity: 0.15, shadowRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 } },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center' },
  headerTextContainer: { flex: 1, alignItems: 'center', marginHorizontal: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.85 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  content: { flex: 1, paddingTop: 8 },
  progressCard: { backgroundColor: '#fff' },
  progressTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  progressGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  progressItem: { width: '48%', alignItems: 'center', paddingVertical: 12 },
  progressIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  progressValue: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  progressLabel: { fontSize: 13 },
  progressMessage: { marginTop: 16 },
  progressMessageText: { fontSize: 14, fontWeight: '500' },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});