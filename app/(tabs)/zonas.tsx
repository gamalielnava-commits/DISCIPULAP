import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { 
  MapPin, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  ChevronRight,
  UserCheck,
  Activity,
  TrendingUp,
  Award
} from 'lucide-react-native';

interface Zona {
  id: string;
  nombre: string;
  supervisor: string;
  supervisorId: string;
  grupos: string[];
  miembrosTotal: number;
  asistenciaPromedio: number;
  discipuladoCompletado: number;
}



export default function ZonasScreen() {
  const { isDarkMode, user, members, groups, attendance } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    supervisor: '',
    supervisorId: '',
  });
  const [gruposModalVisible, setGruposModalVisible] = useState(false);
  const [selectedGrupos, setSelectedGrupos] = useState<string[]>([]);

  const [zonas, setZonas] = useState<Zona[]>([]);

  // Calcular estadísticas reales de zonas
  const calculateZoneStats = React.useCallback(() => {
    const updatedZonas = zonas.map(zona => {
      // Obtener grupos de esta zona
      const zoneGroups = groups.filter(g => zona.grupos.includes(g.id));
      
      // Calcular miembros totales
      const miembrosTotal = members.filter(m => 
        zoneGroups.some(g => g.id === m.grupoId)
      ).length;
      
      // Calcular asistencia promedio
      const zoneAttendance = attendance.filter(a => 
        zoneGroups.some(g => g.id === a.grupoId)
      );
      
      let asistenciaPromedio = 0;
      if (zoneAttendance.length > 0) {
        const totalAsistentes = zoneAttendance.reduce((sum, a) => sum + a.asistentes.length, 0);
        asistenciaPromedio = Math.round((totalAsistentes / zoneAttendance.length));
      }
      
      // Calcular discipulado completado
      const zoneMembersWithDiscipleship = members.filter(m => 
        zoneGroups.some(g => g.id === m.grupoId) && m.discipulado
      ).length;
      
      return {
        ...zona,
        miembrosTotal,
        asistenciaPromedio: miembrosTotal > 0 ? Math.round((asistenciaPromedio / miembrosTotal) * 100) : 0,
        discipuladoCompletado: zoneMembersWithDiscipleship,
      };
    });
    
    setZonas(updatedZonas);
  }, [zonas, groups, members, attendance]);

  useEffect(() => {
    calculateZoneStats();
  }, [calculateZoneStats]);

  const filteredZonas = useMemo(() => {
    if (!searchQuery) return zonas;
    return zonas.filter(zona =>
      zona.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zona.supervisor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [zonas, searchQuery]);

  const handleAddZona = () => {
    setEditMode(false);
    setFormData({ nombre: '', supervisor: '', supervisorId: '' });
    setSelectedGrupos([]);
    setModalVisible(true);
  };

  const handleEditZona = (zona: Zona) => {
    setEditMode(true);
    setSelectedZona(zona);
    setFormData({
      nombre: zona.nombre,
      supervisor: zona.supervisor,
      supervisorId: zona.supervisorId,
    });
    setSelectedGrupos(zona.grupos);
    setModalVisible(true);
  };

  const handleDeleteZona = (zonaId: string) => {
    Alert.alert(
      'Eliminar Zona',
      '¿Estás seguro de que deseas eliminar esta zona?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setZonas(prev => prev.filter(z => z.id !== zonaId));
          },
        },
      ]
    );
  };

  const handleSaveZona = () => {
    if (!formData.nombre || !formData.supervisor) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (editMode && selectedZona) {
      setZonas(prev =>
        prev.map(z =>
          z.id === selectedZona.id
            ? {
                ...z,
                nombre: formData.nombre,
                supervisor: formData.supervisor,
                supervisorId: formData.supervisorId,
                grupos: selectedGrupos,
              }
            : z
        )
      );
    } else {
      const newZona: Zona = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        supervisor: formData.supervisor,
        supervisorId: formData.supervisorId,
        grupos: selectedGrupos,
        miembrosTotal: members.filter(m => 
          selectedGrupos.some(gId => groups.find(g => g.id === gId && g.id === m.grupoId))
        ).length,
        asistenciaPromedio: 0,
        discipuladoCompletado: 0,
      };
      setZonas(prev => [...prev, newZona]);
    }

    setModalVisible(false);
    setFormData({ nombre: '', supervisor: '', supervisorId: '' });
    setSelectedGrupos([]);
  };

  const handleViewDetails = (zona: Zona) => {
    setSelectedZona(zona);
    setDetailsModalVisible(true);
  };

  const renderZonaCard = ({ item }: { item: Zona }) => (
    <Pressable
      style={[styles.zonaCard, { backgroundColor: colors.card }]}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.zonaHeader}>
        <View style={styles.zonaInfo}>
          <MapPin size={20} color={colors.primary} />
          <Text style={[styles.zonaName, { color: colors.text }]}>
            {item.nombre}
          </Text>
        </View>
        <View style={styles.zonaActions}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleEditZona(item);
            }}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit2 size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteZona(item.id);
            }}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      <View style={styles.supervisorInfo}>
        <UserCheck size={16} color={colors.textSecondary} />
        <Text style={[styles.supervisorText, { color: colors.textSecondary }]}>
          Supervisor: {item.supervisor}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Users size={16} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {item.grupos.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Grupos
          </Text>
        </View>
        <View style={styles.statItem}>
          <Activity size={16} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {item.miembrosTotal}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Miembros
          </Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={16} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {item.asistenciaPromedio}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Asistencia
          </Text>
        </View>
        <View style={styles.statItem}>
          <Award size={16} color={colors.info} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {item.discipuladoCompletado}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Completados
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.viewDetailsButton,
          { backgroundColor: colors.primary + '20' },
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => handleViewDetails(item)}
      >
        <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
          Ver detalles
        </Text>
        <ChevronRight size={16} color={colors.primary} />
      </Pressable>
    </Pressable>
  );

  const renderGrupoItem = ({ item }: { item: { id: string; nombre: string; lider: string; miembros: number; zonaId: string; asistenciaPromedio: number; discipuladoProgreso: number } }) => {
    const isSelected = selectedGrupos.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.grupoItem,
          { backgroundColor: colors.card },
          isSelected && { backgroundColor: colors.primary + '20' }
        ]}
        onPress={() => {
          if (isSelected) {
            setSelectedGrupos(prev => prev.filter(id => id !== item.id));
          } else {
            setSelectedGrupos(prev => [...prev, item.id]);
          }
        }}
      >
        <View style={styles.grupoItemContent}>
          <Text style={[styles.grupoName, { color: colors.text }]}>
            {item.nombre}
          </Text>
          <Text style={[styles.grupoLider, { color: colors.textSecondary }]}>
            Líder: {item.lider}
          </Text>
          <Text style={[styles.grupoMiembros, { color: colors.textSecondary }]}>
            {item.miembros} miembros
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Verificar permisos según el rol del usuario
  const canManageZonas = user?.role === 'admin' || user?.role === 'supervisor';

  if (!canManageZonas) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.noAccessContainer}>
          <MapPin size={48} color={colors.textSecondary} />
          <Text style={[styles.noAccessText, { color: colors.textSecondary }]}>
            No tienes permisos para acceder a este módulo
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Gestión de Zonas
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddZona}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Nueva Zona</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar zona o supervisor..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredZonas}
        renderItem={renderZonaCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para agregar/editar zona */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editMode ? 'Editar Zona' : 'Nueva Zona'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Nombre de la zona"
              placeholderTextColor={colors.textSecondary}
              value={formData.nombre}
              onChangeText={text => setFormData(prev => ({ ...prev, nombre: text }))}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Nombre del supervisor"
              placeholderTextColor={colors.textSecondary}
              value={formData.supervisor}
              onChangeText={text => setFormData(prev => ({ ...prev, supervisor: text }))}
            />

            <TouchableOpacity
              style={[styles.selectGroupsButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => setGruposModalVisible(true)}
            >
              <Users size={20} color={colors.primary} />
              <Text style={[styles.selectGroupsText, { color: colors.primary }]}>
                Seleccionar Grupos ({selectedGrupos.length})
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveZona}
              >
                <Text style={styles.saveButtonText}>
                  {editMode ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar grupos */}
      <Modal
        visible={gruposModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGruposModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Seleccionar Grupos
            </Text>

            <FlatList
              data={groups.map(g => ({
                id: g.id,
                nombre: g.nombre,
                lider: members.find(m => g.lideres?.includes(m.id))?.nombre || 'Sin líder',
                miembros: members.filter(m => m.grupoId === g.id).length,
                zonaId: '',
                asistenciaPromedio: 0,
                discipuladoProgreso: 0,
              }))}
              renderItem={renderGrupoItem}
              keyExtractor={item => item.id}
              style={styles.gruposList}
            />

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => setGruposModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles de zona */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.detailsModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.detailsHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedZona?.nombre}
              </Text>
              <Pressable
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Información General</Text>
                <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
                  <View style={styles.infoRow}>
                    <UserCheck size={18} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Supervisor:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedZona?.supervisor}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Users size={18} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Total de Grupos:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedZona?.grupos.length}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Activity size={18} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Total de Miembros:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedZona?.miembrosTotal}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Estadísticas</Text>
                <View style={[styles.statsGrid, { backgroundColor: colors.background }]}>
                  <View style={styles.statCard}>
                    <TrendingUp size={24} color={colors.success} />
                    <Text style={[styles.statCardValue, { color: colors.text }]}>
                      {selectedZona?.asistenciaPromedio}%
                    </Text>
                    <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Asistencia</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Award size={24} color={colors.warning} />
                    <Text style={[styles.statCardValue, { color: colors.text }]}>
                      {selectedZona?.discipuladoCompletado}
                    </Text>
                    <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Completados</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Grupos en esta Zona</Text>
                {selectedZona?.grupos.map(grupoId => {
                  const grupo = groups.find(g => g.id === grupoId);
                  if (!grupo) return null;
                  const groupMembers = members.filter(m => m.grupoId === grupo.id);
                  const groupAttendance = attendance.filter(a => a.grupoId === grupo.id);
                  const avgAttendance = groupAttendance.length > 0
                    ? Math.round((groupAttendance.reduce((sum, a) => sum + a.asistentes.length, 0) / groupAttendance.length / groupMembers.length) * 100)
                    : 0;
                  const liderName = members.find(m => grupo.lideres?.includes(m.id))?.nombre || 'Sin líder';
                  
                  return (
                    <View key={grupo.id} style={[styles.grupoDetailCard, { backgroundColor: colors.background }]}>
                      <Text style={[styles.grupoDetailName, { color: colors.text }]}>{grupo.nombre}</Text>
                      <Text style={[styles.grupoDetailInfo, { color: colors.textSecondary }]}>Líder: {liderName}</Text>
                      <View style={styles.grupoDetailStats}>
                        <Text style={[styles.grupoDetailStat, { color: colors.textSecondary }]}>
                          {groupMembers.length} miembros
                        </Text>
                        <Text style={[styles.grupoDetailStat, { color: colors.textSecondary }]}>
                          {avgAttendance}% asistencia
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.detailsActions}>
              <Pressable
                style={[styles.detailActionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setDetailsModalVisible(false);
                  handleEditZona(selectedZona!);
                }}
              >
                <Edit2 size={18} color="#fff" />
                <Text style={styles.detailActionText}>Editar Zona</Text>
              </Pressable>
              <Pressable
                style={[styles.detailActionButton, { backgroundColor: colors.danger }]}
                onPress={() => {
                  setDetailsModalVisible(false);
                  handleDeleteZona(selectedZona!.id);
                }}
              >
                <Trash2 size={18} color="#fff" />
                <Text style={styles.detailActionText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  zonaCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  zonaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  zonaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zonaName: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  zonaActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  actionButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  supervisorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 15,
  },
  supervisorText: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  statLabel: {
    fontSize: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  viewDetailsText: {
    fontWeight: '500' as const,
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  noAccessText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  selectGroupsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  selectGroupsText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  gruposList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  grupoItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grupoItemContent: {
    flex: 1,
  },
  grupoName: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  grupoLider: {
    fontSize: 14,
    marginBottom: 2,
  },
  grupoMiembros: {
    fontSize: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold' as const,
  },
  doneButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  detailsModalContent: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  detailsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  infoCard: {
    padding: 15,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderRadius: 10,
  },
  statCard: {
    alignItems: 'center',
    gap: 5,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  statCardLabel: {
    fontSize: 12,
  },
  grupoDetailCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  grupoDetailName: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  grupoDetailInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  grupoDetailStats: {
    flexDirection: 'row',
    gap: 15,
  },
  grupoDetailStat: {
    fontSize: 12,
  },
  detailsActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  detailActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});