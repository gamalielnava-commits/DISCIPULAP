import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';

import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X,
  Check,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { 
  User, 
  UserRole, 
  UserStatus, 
  Group, 
  ROLE_LABELS, 
  STATUS_LABELS,
  getUserPermissions 
} from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '@/components/AppHeader';

interface UserFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  role: UserRole;
  status: UserStatus;
  grupoId: string;
  notas: string;
  password?: string;
  confirmPassword?: string;
}

export default function UsuariosScreen() {
  const { user: currentUser, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    role: 'miembro',
    status: 'pendiente',
    grupoId: '',
    notas: '',
    password: undefined,
    confirmPassword: undefined,
  });

  // Verificar permisos
  const permissions = currentUser ? getUserPermissions(currentUser.role) : null;
  const canManageUsers = permissions?.canManageUsers || false;
  const canManagePasswords = permissions?.canManagePasswords || false;

  // Generar contraseña segura
  const generateStrongPassword = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+-=';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }, []);

  // Cargar usuarios y grupos
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar usuarios
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Datos de ejemplo - asegurar que coincida con el usuario del AppProvider
        const sampleUsers: User[] = [
          {
            id: '1',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@iglesia.com',
            role: 'admin',
            status: 'activo',
            grupoId: '1',
            grupoNombre: 'Discipulado Norte',
            telefono: '303-555-0101',
            fechaNacimiento: '15/03/1985',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            nombre: 'María',
            apellido: 'González',
            email: 'maria@iglesia.com',
            role: 'lider',
            status: 'activo',
            grupoId: '1',
            grupoNombre: 'Jóvenes',
            telefono: '555-0102',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            nombre: 'Pedro',
            apellido: 'Rodríguez',
            email: 'pedro@iglesia.com',
            role: 'miembro',
            status: 'pendiente',
            grupoId: '2',
            grupoNombre: 'Adultos',
            telefono: '555-0103',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setUsers(sampleUsers);
        await AsyncStorage.setItem('users', JSON.stringify(sampleUsers));
      }

      // Cargar grupos
      const storedGroups = await AsyncStorage.getItem('groups');
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      } else {
        const sampleGroups: Group[] = [
          {
            id: '1',
            nombre: 'Jóvenes',
            descripcion: 'Grupo de jóvenes de 18-30 años',
            cantidadMiembros: 25,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            nombre: 'Adultos',
            descripcion: 'Grupo de adultos mayores de 30 años',
            cantidadMiembros: 40,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            nombre: 'Niños',
            descripcion: 'Ministerio infantil',
            cantidadMiembros: 30,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setGroups(sampleGroups);
        await AsyncStorage.setItem('groups', JSON.stringify(sampleGroups));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesGroup = filterGroup === 'all' || user.grupoId === filterGroup;
      
      return matchesSearch && matchesRole && matchesStatus && matchesGroup;
    });
  }, [users, searchQuery, filterRole, filterStatus, filterGroup]);

  // Agregar usuario
  const handleAddUser = async () => {
    if (!formData.nombre || !formData.apellido || !formData.email) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    if (formData.password || formData.confirmPassword) {
      if ((formData.password ?? '') !== (formData.confirmPassword ?? '')) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      if ((formData.password ?? '').length > 0 && (formData.password ?? '').length < 8) {
        Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
        return;
      }
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      password: formData.password ?? undefined,
      grupoNombre: groups.find(g => g.id === formData.grupoId)?.nombre,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setShowAddModal(false);
    resetForm();
    Alert.alert('Éxito', 'Usuario agregado correctamente');
  };

  // Editar usuario
  const handleEditUser = async () => {
    if (!selectedUser) return;

    if (formData.password || formData.confirmPassword) {
      if ((formData.password ?? '') !== (formData.confirmPassword ?? '')) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      if ((formData.password ?? '').length > 0 && (formData.password ?? '').length < 8) {
        Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
        return;
      }
    }

    const updatedUser: User = {
      ...selectedUser,
      ...formData,
      password: formData.password ? formData.password : selectedUser.password,
      grupoNombre: groups.find(g => g.id === formData.grupoId)?.nombre,
      updatedAt: new Date(),
    };

    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? updatedUser : u
    );
    
    setUsers(updatedUsers);
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
    Alert.alert('Éxito', 'Usuario actualizado correctamente');
  };

  // Eliminar usuario
  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedUsers = users.filter(u => u.id !== userId);
            setUsers(updatedUsers);
            await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
            Alert.alert('Éxito', 'Usuario eliminado correctamente');
          },
        },
      ]
    );
  };

  // Abrir modal de edición
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      fechaNacimiento: user.fechaNacimiento || '',
      role: user.role,
      status: user.status,
      grupoId: user.grupoId || '',
      notas: user.notas || '',
      password: undefined,
      confirmPassword: undefined,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowCurrentPassword(false);
    setShowEditModal(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      role: 'miembro',
      status: 'pendiente',
      grupoId: '',
      notas: '',
      password: undefined,
      confirmPassword: undefined,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowCurrentPassword(false);
  };

  // Obtener color por status
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'activo': return '#26D0CE';
      case 'pendiente': return '#FFD93D';
      case 'inactivo': return '#FF6B6B';
      default: return '#95A5A6';
    }
  };

  // Obtener color por rol
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return '#FF6B6B';
      case 'supervisor': return '#6C5CE7';
      case 'lider': return '#26D0CE';
      case 'miembro': return '#95A5A6';
      case 'invitado': return '#FFD93D';
      default: return '#95A5A6';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: colors.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF6B6B',
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 8,
      shadowColor: '#FF6B6B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    filtersContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: '#FF6B6B',
      borderColor: '#FF6B6B',
    },
    filterChipText: {
      fontSize: 14,
      color: '#95A5A6',
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    usersList: {
      flex: 1,
      padding: 16,
    },
    userCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    userMeta: {
      flexDirection: 'row',
      gap: 8,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
    },
    userActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#151A30' : '#F5F5F5',
      borderWidth: 1,
      borderColor: colors.border,
    },
    userDetails: {
      gap: 6,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: '#95A5A6',
    },
    loader: {
      marginTop: 50,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 50,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#95A5A6',
      marginTop: 12,
    },
    noPermission: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noPermissionText: {
      fontSize: 18,
      color: '#95A5A6',
      marginTop: 16,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 0,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    formGroup: {
      paddingHorizontal: 20,
      marginTop: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#95A5A6',
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDarkMode ? '#151A30' : '#F5F5F5',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#151A30' : '#F5F5F5',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    dropdownText: {
      fontSize: 16,
      color: colors.text,
    },
    dropdownOptions: {
      marginTop: 4,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    dropdownOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDarkMode ? '#151A30' : '#F5F5F5',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#95A5A6',
    },
    saveButton: {
      backgroundColor: '#FF6B6B',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  if (!canManageUsers) {
    return (
      <View style={styles.container}>
        <AppHeader title="Usuarios" subtitle="Sin permisos" />
        <View style={styles.noPermission}>
          <UserX size={64} color="#95A5A6" />
          <Text style={styles.noPermissionText}>
            No tienes permisos para gestionar usuarios
          </Text>
        </View>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <AppHeader title="Usuarios" subtitle="Gestión de miembros" />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#7F8C8D"
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <UserPlus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterRole !== 'all' && styles.filterChipActive]}
          onPress={() => setFilterRole(filterRole === 'all' ? 'miembro' : 'all')}
        >
          <Shield size={16} color={filterRole !== 'all' ? '#FFFFFF' : '#95A5A6'} />
          <Text style={[styles.filterChipText, filterRole !== 'all' && styles.filterChipTextActive]}>
            {filterRole === 'all' ? 'Todos los roles' : ROLE_LABELS[filterRole]}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterStatus !== 'all' && styles.filterChipActive]}
          onPress={() => setFilterStatus(filterStatus === 'all' ? 'activo' : 'all')}
        >
          <UserCheck size={16} color={filterStatus !== 'all' ? '#FFFFFF' : '#95A5A6'} />
          <Text style={[styles.filterChipText, filterStatus !== 'all' && styles.filterChipTextActive]}>
            {filterStatus === 'all' ? 'Todos los estados' : STATUS_LABELS[filterStatus]}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterGroup !== 'all' && styles.filterChipActive]}
          onPress={() => setFilterGroup(filterGroup === 'all' ? groups[0]?.id || 'all' : 'all')}
        >
          <Users size={16} color={filterGroup !== 'all' ? '#FFFFFF' : '#95A5A6'} />
          <Text style={[styles.filterChipText, filterGroup !== 'all' && styles.filterChipTextActive]}>
            {filterGroup === 'all' ? 'Todos los grupos' : groups.find(g => g.id === filterGroup)?.nombre}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de usuarios */}
      <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#95A5A6" />
            <Text style={styles.emptyStateText}>No se encontraron usuarios</Text>
          </View>
        ) : (
          filteredUsers.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userCardHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} testID={`user-name-${user.id}`}>
                    {user.nombre} {user.apellido}
                  </Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.badge, { backgroundColor: getRoleColor(user.role) }]}>
                      <Text style={styles.badgeText}>{ROLE_LABELS[user.role]}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(user.status) }]}>
                      <Text style={styles.badgeText}>{STATUS_LABELS[user.status]}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(user)}
                    testID={`btn-edit-${user.id}`}
                  >
                    <Edit2 size={18} color="#95A5A6" />
                  </TouchableOpacity>
                  {canManagePasswords && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setPasswordUser(user);
                        setShowPasswordModal(true);
                      }}
                      testID={`btn-password-${user.id}`}
                    >
                      <KeyRound size={18} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteUser(user.id)}
                    testID={`btn-delete-${user.id}`}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Mail size={14} color="#95A5A6" />
                  <Text style={styles.detailText}>{user.email}</Text>
                </View>
                {user.telefono && (
                  <View style={styles.detailRow}>
                    <Phone size={14} color="#95A5A6" />
                    <Text style={styles.detailText}>{user.telefono}</Text>
                  </View>
                )}
                {user.grupoNombre && (
                  <View style={styles.detailRow}>
                    <Users size={14} color="#95A5A6" />
                    <Text style={styles.detailText}>{user.grupoNombre}</Text>
                  </View>
                )}
                {user.fechaNacimiento && (
                  <View style={styles.detailRow}>
                    <Calendar size={14} color="#95A5A6" />
                    <Text style={styles.detailText}>{user.fechaNacimiento}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de agregar/editar usuario */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showEditModal ? 'Editar Usuario' : 'Agregar Usuario'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <X size={24} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} testID="user-form-scroll">
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({...formData, nombre: text})}
                  placeholder="Ingrese el nombre"
                  placeholderTextColor="#7F8C8D"
                  testID="input-nombre"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.apellido}
                  onChangeText={(text) => setFormData({...formData, apellido: text})}
                  placeholder="Ingrese el apellido"
                  placeholderTextColor="#7F8C8D"
                  testID="input-apellido"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#7F8C8D"
                  testID="input-email"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({...formData, telefono: text})}
                  placeholder="555-0000"
                  keyboardType="phone-pad"
                  placeholderTextColor="#7F8C8D"
                  testID="input-telefono"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  value={formData.direccion}
                  onChangeText={(text) => setFormData({...formData, direccion: text})}
                  placeholder="Ingrese la dirección"
                  placeholderTextColor="#7F8C8D"
                  testID="input-direccion"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha de Nacimiento *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fechaNacimiento}
                  onChangeText={(text) => {
                    let formatted = text.replace(/[^0-9]/g, '');
                    if (formatted.length >= 3 && formatted.length <= 4) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                    } else if (formatted.length >= 5) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
                    }
                    setFormData({...formData, fechaNacimiento: formatted});
                  }}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#7F8C8D"
                  testID="input-fecha-nacimiento"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rol</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  <Text style={styles.dropdownText}>{ROLE_LABELS[formData.role]}</Text>
                  <ChevronDown size={20} color="#95A5A6" />
                </TouchableOpacity>
                {showRoleDropdown && (
                  <View style={styles.dropdownOptions}>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <TouchableOpacity
                        key={key}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData({...formData, role: key as UserRole});
                          setShowRoleDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{label}</Text>
                        {formData.role === key && <Check size={16} color="#FF6B6B" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <Text style={styles.dropdownText}>{STATUS_LABELS[formData.status]}</Text>
                  <ChevronDown size={20} color="#95A5A6" />
                </TouchableOpacity>
                {showStatusDropdown && (
                  <View style={styles.dropdownOptions}>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <TouchableOpacity
                        key={key}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData({...formData, status: key as UserStatus});
                          setShowStatusDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{label}</Text>
                        {formData.status === key && <Check size={16} color="#FF6B6B" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Grupo</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowGroupDropdown(!showGroupDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {formData.grupoId ? groups.find(g => g.id === formData.grupoId)?.nombre : 'Seleccionar grupo'}
                  </Text>
                  <ChevronDown size={20} color="#95A5A6" />
                </TouchableOpacity>
                {showGroupDropdown && (
                  <View style={styles.dropdownOptions}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setFormData({...formData, grupoId: ''});
                        setShowGroupDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>Sin grupo</Text>
                      {!formData.grupoId && <Check size={16} color="#FF6B6B" />}
                    </TouchableOpacity>
                    {groups.map(group => (
                      <TouchableOpacity
                        key={group.id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData({...formData, grupoId: group.id});
                          setShowGroupDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{group.nombre}</Text>
                        {formData.grupoId === group.id && <Check size={16} color="#FF6B6B" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notas}
                  onChangeText={(text) => setFormData({...formData, notas: text})}
                  placeholder="Notas adicionales..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#7F8C8D"
                  testID="input-notas"
                />
              </View>

              {canManagePasswords && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contraseña (opcional)</Text>
                  <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}
                    testID="password-input-wrapper">
                    <TextInput
                      style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 16 }}
                      value={formData.password ?? ''}
                      onChangeText={(text) => setFormData({ ...formData, password: text })}
                      placeholder="Nueva contraseña"
                      placeholderTextColor="#7F8C8D"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      testID="input-password"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} testID="toggle-show-password">
                      {showPassword ? (
                        <EyeOff size={20} color="#95A5A6" />
                      ) : (
                        <Eye size={20} color="#95A5A6" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 0 }]}>
                    <TextInput
                      style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 16 }}
                      value={formData.confirmPassword ?? ''}
                      onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                      placeholder="Confirmar contraseña"
                      placeholderTextColor="#7F8C8D"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      testID="input-confirm-password"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} testID="toggle-show-confirm-password">
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#95A5A6" />
                      ) : (
                        <Eye size={20} color="#95A5A6" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, { marginTop: 10, backgroundColor: '#1F2937' }]}
                    onPress={() => {
                      const temp = generateStrongPassword();
                      setFormData({ ...formData, password: temp, confirmPassword: temp });
                      Alert.alert('Contraseña temporal generada', temp);
                    }}
                    testID="btn-generate-temp-password"
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <KeyRound size={18} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Generar temporal</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                testID="btn-cancelar"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={showEditModal ? handleEditUser : handleAddUser}
                testID="btn-guardar-usuario"
              >
                <Text style={styles.saveButtonText}>
                  {showEditModal ? 'Actualizar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de gestión de contraseña */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPasswordUser(null);
          setFormData({...formData, password: undefined, confirmPassword: undefined});
          setShowPassword(false);
          setShowConfirmPassword(false);
          setShowCurrentPassword(false);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Gestionar Contraseña - {passwordUser?.nombre} {passwordUser?.apellido}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordUser(null);
                  setFormData({...formData, password: undefined, confirmPassword: undefined});
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setShowCurrentPassword(false);
                }}
              >
                <X size={24} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} testID="password-form-scroll">
              {passwordUser?.password && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contraseña Actual</Text>
                  <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}>
                    <TextInput
                      style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 16 }}
                      value={showCurrentPassword ? passwordUser.password : '••••••••••••'}
                      editable={false}
                      testID="current-password-display"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)} 
                      testID="toggle-show-current-password"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={20} color="#95A5A6" />
                      ) : (
                        <Eye size={20} color="#95A5A6" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}>
                  <TextInput
                    style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 16 }}
                    value={formData.password ?? ''}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#7F8C8D"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    testID="input-new-password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} testID="toggle-show-new-password">
                    {showPassword ? (
                      <EyeOff size={20} color="#95A5A6" />
                    ) : (
                      <Eye size={20} color="#95A5A6" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}>
                  <TextInput
                    style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 16 }}
                    value={formData.confirmPassword ?? ''}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    placeholder="Confirmar nueva contraseña"
                    placeholderTextColor="#7F8C8D"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    testID="input-confirm-new-password"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} testID="toggle-show-confirm-new-password">
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#95A5A6" />
                    ) : (
                      <Eye size={20} color="#95A5A6" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#1F2937', marginBottom: 10 }]}
                  onPress={() => {
                    const temp = generateStrongPassword();
                    setFormData({ ...formData, password: temp, confirmPassword: temp });
                    Alert.alert('Contraseña temporal generada', `Nueva contraseña: ${temp}\n\nAsegúrate de compartir esta contraseña de forma segura con el usuario.`);
                  }}
                  testID="btn-generate-password"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <KeyRound size={18} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Generar Contraseña Segura</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordUser(null);
                  setFormData({...formData, password: undefined, confirmPassword: undefined});
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setShowCurrentPassword(false);
                }}
                testID="btn-cancel-password"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={async () => {
                  if (!passwordUser) return;
                  
                  if (!formData.password || !formData.confirmPassword) {
                    Alert.alert('Error', 'Por favor complete ambos campos de contraseña');
                    return;
                  }
                  
                  if (formData.password !== formData.confirmPassword) {
                    Alert.alert('Error', 'Las contraseñas no coinciden');
                    return;
                  }
                  
                  if (formData.password.length < 8) {
                    Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
                    return;
                  }
                  
                  const updatedUser: User = {
                    ...passwordUser,
                    password: formData.password,
                    updatedAt: new Date(),
                  };
                  
                  const updatedUsers = users.map(u => 
                    u.id === passwordUser.id ? updatedUser : u
                  );
                  
                  setUsers(updatedUsers);
                  await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
                  
                  setShowPasswordModal(false);
                  setPasswordUser(null);
                  setFormData({...formData, password: undefined, confirmPassword: undefined});
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setShowCurrentPassword(false);
                  
                  Alert.alert('Éxito', 'Contraseña actualizada correctamente');
                }}
                testID="btn-save-password"
              >
                <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}