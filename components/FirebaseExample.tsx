import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChurchDataService } from '@/services/firebase';
import { useApp } from '@/providers/AppProvider';
import { Plus, Users, Calendar, BookOpen } from 'lucide-react-native';

interface FirebaseData {
  id: string;
  [key: string]: any;
}

export default function FirebaseExample() {
  const { user, permissions, members: localMembers, groups: localGroups } = useApp();
  const [members, setMembers] = useState<FirebaseData[]>([]);
  const [groups, setGroups] = useState<FirebaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadFirebaseData();
  }, []);

  const loadFirebaseData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos desde Firebase
      const [firebaseMembers, firebaseGroups] = await Promise.all([
        ChurchDataService.getMembers(),
        ChurchDataService.getGroups(),
      ]);

      setMembers(firebaseMembers);
      setGroups(firebaseGroups);
      
      console.log('Datos cargados desde Firebase:', {
        members: firebaseMembers.length,
        groups: firebaseGroups.length,
      });
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos desde Firebase');
    } finally {
      setLoading(false);
    }
  };

  const syncLocalToFirebase = async () => {
    if (!permissions?.canManageUsers) {
      console.log('Sin permisos para sincronizar datos');
      return;
    }

    try {
      setSyncing(true);
      
      // Sincronizar miembros
      for (const member of localMembers) {
        await ChurchDataService.createMember({
          nombre: member.nombre,
          apellido: member.apellido,
          email: member.email,
          telefono: member.telefono,
          direccion: member.direccion,
          fechaNacimiento: member.fechaNacimiento,
          bautizado: member.bautizado,
          discipulado: member.discipulado,
          ministerio: member.ministerio,
          grupoId: member.grupoId,
          estatus: member.estatus,
        });
      }

      // Sincronizar grupos
      for (const group of localGroups) {
        await ChurchDataService.createGroup({
          nombre: group.nombre,
          lideres: group.lideres,
          miembros: group.miembros,
          ubicacion: group.ubicacion,
          horario: group.horario,
          direccion: group.direccion,
          dia: group.dia,
          hora: group.hora,
          zonaId: group.zonaId,
          zonaNombre: group.zonaNombre,
        });
      }

      Alert.alert('Éxito', 'Datos sincronizados con Firebase');
      await loadFirebaseData(); // Recargar datos
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
      Alert.alert('Error', 'No se pudieron sincronizar los datos');
    } finally {
      setSyncing(false);
    }
  };

  const createSampleMember = async () => {
    if (!permissions?.canManageUsers) {
      console.log('Sin permisos para crear miembros');
      return;
    }

    try {
      const sampleMember = {
        nombre: 'Nuevo',
        apellido: 'Miembro',
        email: `miembro${Date.now()}@iglesia.com`,
        telefono: '555-0000',
        direccion: 'Dirección de ejemplo',
        fechaNacimiento: '1990-01-01',
        bautizado: false,
        discipulado: false,
        ministerio: '',
        grupoId: groups[0]?.id || '',
        estatus: 'activo' as const,
      };

      await ChurchDataService.createMember(sampleMember);
      Alert.alert('Éxito', 'Miembro creado en Firebase');
      await loadFirebaseData();
    } catch (error) {
      console.error('Error creating member:', error);
      Alert.alert('Error', 'No se pudo crear el miembro');
    }
  };

  const renderMember = ({ item }: { item: FirebaseData }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Users size={20} color="#7C3AED" />
        <Text style={styles.itemTitle}>
          {item.nombre} {item.apellido}
        </Text>
      </View>
      <Text style={styles.itemSubtitle}>{item.email}</Text>
      <Text style={styles.itemDetail}>
        {item.bautizado ? '✅ Bautizado' : '❌ No bautizado'} • 
        {item.discipulado ? ' ✅ Discipulado' : ' ❌ Sin discipulado'}
      </Text>
    </View>
  );

  const renderGroup = ({ item }: { item: FirebaseData }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <BookOpen size={20} color="#059669" />
        <Text style={styles.itemTitle}>{item.nombre}</Text>
      </View>
      <Text style={styles.itemSubtitle}>{item.ubicacion}</Text>
      <Text style={styles.itemDetail}>
        {item.horario} • {item.miembros?.length || 0} miembros
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando datos de Firebase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firebase Integration</Text>
        <Text style={styles.subtitle}>
          Usuario: {user?.nombre} ({user?.role})
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={loadFirebaseData}
          disabled={loading}
        >
          <Calendar size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Recargar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.syncButton]}
          onPress={syncLocalToFirebase}
          disabled={syncing || !permissions?.canManageUsers}
        >
          {syncing ? (
            <ActivityIndicator size={16} color="#FFFFFF" />
          ) : (
            <Plus size={16} color="#FFFFFF" />
          )}
          <Text style={styles.actionButtonText}>Sincronizar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.createButton]}
          onPress={createSampleMember}
          disabled={!permissions?.canManageUsers}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Crear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{members.length}</Text>
          <Text style={styles.statLabel}>Miembros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{groups.length}</Text>
          <Text style={styles.statLabel}>Grupos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Miembros desde Firebase</Text>
        <FlatList
          data={members.slice(0, 3)} // Mostrar solo los primeros 3
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grupos desde Firebase</Text>
        <FlatList
          data={groups.slice(0, 2)} // Mostrar solo los primeros 2
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  syncButton: {
    backgroundColor: '#059669',
  },
  createButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});