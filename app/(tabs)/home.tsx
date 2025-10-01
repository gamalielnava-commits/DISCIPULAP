import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, Calendar, BookOpen, TrendingUp, Bell, GraduationCap, Heart, MessageSquare, Mic, Check } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import ChurchLogo from '@/components/ChurchLogo';

// Frases motivacionales personalizadas por rol
const welcomePhrasesByRole = {
  miembro: [
    "¡Bienvenido a Casa de Dios! Tu presencia nos alegra.",
    "Cada día es una oportunidad para crecer en la fe.",
    "Eres parte importante de esta familia espiritual.",
    "Dios tiene un propósito especial para tu vida.",
    "Tu testimonio puede transformar vidas.",
    "Continúa creciendo, Dios está contigo."
  ],
  lider: [
    "¡Gracias por cuidar tu grupo! Cada alma cuenta.",
    "Tu liderazgo marca la diferencia en las vidas.",
    "Eres un instrumento de Dios para el discipulado.",
    "Tu dedicación inspira a otros a seguir a Cristo.",
    "Cada miembro de tu grupo es valioso para Dios.",
    "Sigue adelante, tu labor tiene recompensa eterna."
  ],
  supervisor: [
    "Tu supervisión fortalece el Reino de Dios.",
    "Gracias por velar por el bienestar de los grupos.",
    "Tu experiencia guía a los líderes hacia la excelencia.",
    "Eres un pilar fundamental en nuestra iglesia.",
    "Tu visión estratégica edifica la obra de Dios.",
    "Cada área bajo tu cuidado florece con tu dedicación."
  ],
  admin: [
    "¡Bienvenido, siervo fiel! Tu trabajo no es en vano.",
    "Casa de Dios se edifica con tu servicio.",
    "Tu administración sabia bendice a toda la congregación.",
    "Dios bendice tu fidelidad en el ministerio.",
    "Tu visión y liderazgo transforman vidas.",
    "Gracias por tu entrega total al Reino de Dios."
  ],
  invitado: [
    "¡Bienvenido a Casa de Dios! Nos alegra tenerte aquí.",
    "Eres bienvenido en esta familia de fe.",
    "Dios te trajo aquí con un propósito especial.",
    "Esta es tu casa, siéntete en familia.",
    "Esperamos que encuentres paz y amor en este lugar.",
    "Dios tiene algo especial preparado para ti."
  ]
};

export default function HomeScreen() {
  const { members, groups, announcements, user, permissions, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [refreshing, setRefreshing] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const welcomePhrases = welcomePhrasesByRole[user?.role || 'invitado'] || welcomePhrasesByRole.invitado;

  const fadeAnim = useState(new Animated.Value(1))[0];

  // Filtrar datos según el rol del usuario
  const filteredMembers = user?.role === 'miembro' ? [] : 
    user?.role === 'lider' && user.grupoId ? members.filter(m => m.grupoId === user.grupoId) :
    user?.role === 'supervisor' ? members : // Supervisor ve todos por ahora
    members;

  const filteredGroups = user?.role === 'miembro' ? [] :
    user?.role === 'lider' && user.grupoId ? groups.filter(g => g.id === user.grupoId) :
    user?.role === 'supervisor' ? groups : // Supervisor ve todos por ahora
    groups;

  const activeMembers = filteredMembers.filter(m => m.estatus === 'activo').length;
  const activeGroups = filteredGroups.length;
  const baptizedPercentage = filteredMembers.length > 0 
    ? Math.round((filteredMembers.filter(m => m.bautizado).length / filteredMembers.length) * 100)
    : 0;
  const discipleshipPercentage = filteredMembers.length > 0
    ? Math.round((filteredMembers.filter(m => m.discipulado).length / filteredMembers.length) * 100)
    : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % welcomePhrases.length);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [fadeAnim, welcomePhrases.length]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const stats = [
    { 
      title: "Miembros", 
      value: activeMembers.toString(), 
      icon: Users, 
      gradient: [colors.primary, colors.secondary] as [string, string],
      route: 'grupos'
    },
    { 
      title: "Grupos", 
      value: activeGroups.toString(), 
      icon: Heart, 
      gradient: [colors.secondary, colors.accent] as [string, string],
      route: 'grupos'
    },
    { 
      title: "Bautizados", 
      value: `${baptizedPercentage}%`, 
      icon: TrendingUp, 
      gradient: [colors.success, colors.secondary] as [string, string],
      route: 'reportes'
    },
    { 
      title: "Discipulado", 
      value: `${discipleshipPercentage}%`, 
      icon: GraduationCap, 
      gradient: [colors.info, colors.primary] as [string, string],
      route: 'discipulado'
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header con gradiente */}
        <LinearGradient
          colors={[colors.gradient1, colors.gradient2]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                  <ChurchLogo size={56} />
                </View>
                <View style={styles.churchInfo}>
                  <Text style={styles.churchName}>Iglesia Casa de Dios</Text>
                  <Text style={styles.churchSubtitle}>Aurora, Colorado</Text>
                </View>
              </View>
              

            </View>
            

            
            <Animated.View style={[styles.animatedView, { opacity: fadeAnim }]}>
              <Text style={styles.welcomeText}>
                {welcomePhrases[currentPhrase % welcomePhrases.length]}
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>

        {/* Anuncios importantes */}
        {announcements.length > 0 && (
          <View style={styles.announcementsSection}>
            <View style={styles.announcementsSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Anuncios Recientes</Text>
              <TouchableOpacity 
                onPress={() => router.push('/anuncios')}
                style={styles.viewAllButton}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            {announcements.slice(0, 3).map((announcement) => (
              <TouchableOpacity 
                key={announcement.id}
                style={[
                  styles.announcementCard,
                  { backgroundColor: colors.card },
                  announcement.prioridad === 'alta' && { borderLeftWidth: 4, borderLeftColor: colors.danger }
                ]}
                onPress={() => router.push('/anuncios')}
                activeOpacity={0.8}
              >
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementIconContainer}>
                    <Bell size={16} color={announcement.prioridad === 'alta' ? colors.danger : colors.primary} />
                  </View>
                  <View style={styles.announcementContent}>
                    <Text style={[styles.announcementTitle, { color: colors.text }]} numberOfLines={2}>
                      {announcement.titulo}
                    </Text>
                    <Text style={[styles.announcementPreview, { color: colors.tabIconDefault }]} numberOfLines={2}>
                      {announcement.contenido}
                    </Text>
                    <View style={styles.announcementMeta}>
                      <Text style={[styles.announcementDate, { color: colors.tabIconDefault }]}>
                        {new Date(announcement.fecha).toLocaleDateString()}
                      </Text>
                      {announcement.prioridad === 'alta' && (
                        <View style={[styles.priorityBadge, { backgroundColor: colors.danger + '20' }]}>
                          <Text style={[styles.priorityText, { color: colors.danger }]}>Alta prioridad</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Estadísticas - Solo para roles con responsabilidades */}
        {user?.role !== 'miembro' && (
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
            <TouchableOpacity 
              key={`stat-${stat.title}-${index}`} 
              style={[styles.statCard, { backgroundColor: colors.card }]}
              onPress={() => {
                if (stat.route === 'grupos') router.push('/grupos');
                else if (stat.route === 'reportes') router.push('/reportes');
                else if (stat.route === 'discipulado') router.push('/discipulado');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={stat.gradient}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statIconContainer}>
                  <stat.icon size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progreso de discipulado para todos los usuarios */}
        <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary + '15', colors.secondary + '15']}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.progressHeader}>
              <View style={[styles.progressIcon, { backgroundColor: colors.primary + '20' }]}>
                <GraduationCap size={28} color={colors.primary} />
              </View>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressMainTitle, { color: colors.text }]}>
                  Mi Progreso en Discipulado
                </Text>
                <Text style={[styles.progressSubtitle, { color: colors.tabIconDefault }]}>
                  Continúa creciendo en tu fe
                </Text>
              </View>
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <View style={[styles.statIconSmall, { backgroundColor: '#3b82f6' + '20' }]}>
                  <BookOpen size={20} color="#3b82f6" />
                </View>
                <Text style={[styles.statValueSmall, { color: colors.text }]}>3</Text>
                <Text style={[styles.statLabelSmall, { color: colors.tabIconDefault }]}>Lecciones</Text>
              </View>
              
              <View style={styles.progressStatItem}>
                <View style={[styles.statIconSmall, { backgroundColor: '#10b981' + '20' }]}>
                  <Check size={20} color="#10b981" />
                </View>
                <Text style={[styles.statValueSmall, { color: colors.text }]}>25</Text>
                <Text style={[styles.statLabelSmall, { color: colors.tabIconDefault }]}>Preguntas</Text>
              </View>
              
              <View style={styles.progressStatItem}>
                <View style={[styles.statIconSmall, { backgroundColor: '#f59e0b' + '20' }]}>
                  <TrendingUp size={20} color="#f59e0b" />
                </View>
                <Text style={[styles.statValueSmall, { color: colors.text }]}>375</Text>
                <Text style={[styles.statLabelSmall, { color: colors.tabIconDefault }]}>Puntos</Text>
              </View>
            </View>
            
            <View style={styles.progressBarSection}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressBarFill, { width: '35%', backgroundColor: colors.primary }]} />
                </View>
                <Text style={[styles.progressPercentage, { color: colors.text }]}>35%</Text>
              </View>
              <Text style={[styles.progressDescription, { color: colors.tabIconDefault }]}>
                ¡Excelente progreso! Sigue adelante en tu camino de discipulado.
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/discipulado')}
            >
              <GraduationCap size={20} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>Continuar Discipulado</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceso Rápido</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/discipulado')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.secondary + '20', colors.secondary + '10']}
                style={styles.actionCardGradient}
              >
                <GraduationCap size={28} color={colors.secondary} />
                <Text style={[styles.actionCardText, { color: colors.text }]}>Discipulado</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/devocionales')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accent + '20', colors.accent + '10']}
                style={styles.actionCardGradient}
              >
                <BookOpen size={28} color={colors.accent} />
                <Text style={[styles.actionCardText, { color: colors.text }]}>Devocionales</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/predicas')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.info + '20', colors.info + '10']}
                style={styles.actionCardGradient}
              >
                <Mic size={28} color={colors.info} />
                <Text style={[styles.actionCardText, { color: colors.text }]}>Prédicas</Text>
              </LinearGradient>
            </TouchableOpacity>

            {permissions?.canAccessAsistencia && (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/asistencia')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.success + '20', colors.success + '10']}
                  style={styles.actionCardGradient}
                >
                  <Calendar size={28} color={colors.success} />
                  <Text style={[styles.actionCardText, { color: colors.text }]}>Asistencia</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {permissions?.canAccessGrupos && (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/grupos')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.info + '20', colors.info + '10']}
                  style={styles.actionCardGradient}
                >
                  <Users size={28} color={colors.info} />
                  <Text style={[styles.actionCardText, { color: colors.text }]}>Grupos</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {permissions?.canAccessMensajes && (
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/mensajes')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.accent + '20', colors.accent + '10']}
                  style={styles.actionCardGradient}
                >
                  <MessageSquare size={28} color={colors.accent} />
                  <Text style={[styles.actionCardText, { color: colors.text }]}>Mensajes</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer con versículo */}
        <View style={[styles.footer, { backgroundColor: colors.card }]}>
          <View style={styles.footerDivider} />
          <Text style={[styles.footerVerse, { color: colors.tabIconDefault }]}>
            {`"Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo; enseñándoles que guarden todas las cosas que os he mandado; y he aquí yo estoy con vosotros todos los días, hasta el fin del mundo. Amén."`}
          </Text>
          <Text style={[styles.footerReference, { color: colors.primary }]}>Mateo 28:19-20 (RVR1960)</Text>
          <Text style={[styles.footerEmail, { color: colors.secondary }]}>iglesiacasadedios33@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  header: {
    padding: 20,
    paddingTop: 0,
  },
  headerTop: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoWrapper: {
    marginRight: 16,
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 4,
  },
  churchInfo: {
    flex: 1,
  },
  churchName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  churchSubtitle: {
    fontSize: 14,
    color: '#FFFFFF80',
  },
  roleContainer: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
    backgroundColor: '#FFFFFF15',
    padding: 16,
    borderRadius: 16,
  },
  announcementsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  announcementsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  announcementCard: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  announcementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00000008',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  announcementPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 20,
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#FFFFFF90',
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    padding: 24,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#00000010',
    marginBottom: 20,
  },
  footerVerse: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  footerReference: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  footerEmail: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  roleSelector: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  roleSelectorTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  roleOptions: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF10',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: '#FFFFFF30',
  },
  roleOptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500' as const,
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressGradient: {
    padding: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValueSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabelSmall: {
    fontSize: 12,
  },
  progressBarSection: {
    marginBottom: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
  },
  progressDescription: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  animatedView: {
    width: '100%',
  },
});