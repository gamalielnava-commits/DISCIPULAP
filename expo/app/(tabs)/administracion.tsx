import React, { useState, useEffect, useMemo } from 'react';
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
  Switch,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Check,
  ChevronDown,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  Settings,
  Key,
  Lock,
  Unlock,
  Save,
  RefreshCw,
  AlertTriangle
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
  getUserPermissions,
  MODULE_PERMISSIONS,
  RolePermissions as ModuleRolePermissions
} from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'usuarios' | 'grupos' | 'contenido' | 'reportes' | 'sistema';
}

interface RolePermissions {
  [key: string]: boolean;
}

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
}

interface GroupFormData {
  nombre: string;
  descripcion: string;
  liderId: string;
}

export default function AdministracionScreen() {
  const { user: currentUser, updateCustomPermissions, resetPermissionsToDefault, getEffectivePermissions, isDarkMode, resetAllData } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [activeTab, setActiveTab] = useState<'usuarios' | 'permisos' | 'grupos' | 'sistema'>('usuarios');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
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
  });
  
  // Estados para grupos
  const [groups, setGroups] = useState<Group[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupFormData, setGroupFormData] = useState<GroupFormData>({
    nombre: '',
    descripcion: '',
    liderId: '',
  });
  
  // Permisos disponibles
  const availablePermissions: Permission[] = [
    { id: 'manage_users', name: 'Gestionar usuarios', description: 'Crear, editar y eliminar usuarios', category: 'usuarios' },
    { id: 'view_users', name: 'Ver usuarios', description: 'Ver lista de usuarios', category: 'usuarios' },
    { id: 'edit_user_info', name: 'Editar información de usuarios', description: 'Modificar datos personales de usuarios', category: 'usuarios' },
    { id: 'manage_groups', name: 'Gestionar grupos', description: 'Crear, editar y eliminar grupos', category: 'grupos' },
    { id: 'view_groups', name: 'Ver grupos', description: 'Ver información de grupos', category: 'grupos' },
    { id: 'assign_groups', name: 'Asignar miembros a grupos', description: 'Agregar o quitar miembros de grupos', category: 'grupos' },
    { id: 'manage_content', name: 'Gestionar contenido', description: 'Crear y editar lecciones y recursos', category: 'contenido' },
    { id: 'view_content', name: 'Ver contenido', description: 'Acceder a lecciones y recursos', category: 'contenido' },
    { id: 'upload_resources', name: 'Subir recursos', description: 'Cargar archivos y materiales', category: 'contenido' },
    { id: 'manage_reports', name: 'Gestionar reportes', description: 'Crear y exportar reportes', category: 'reportes' },
    { id: 'view_reports', name: 'Ver reportes', description: 'Ver reportes y estadísticas', category: 'reportes' },
    { id: 'export_data', name: 'Exportar datos', description: 'Descargar información en diferentes formatos', category: 'reportes' },
    { id: 'manage_system', name: 'Configuración del sistema', description: 'Modificar configuración general', category: 'sistema' },
    { id: 'manage_permissions', name: 'Gestionar permisos', description: 'Modificar permisos de roles', category: 'sistema' },
    { id: 'view_logs', name: 'Ver registros', description: 'Acceder a logs del sistema', category: 'sistema' },
  ];
  
  // Permisos por rol
  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: RolePermissions }>({
    admin: {
      manage_users: true,
      view_users: true,
      edit_user_info: true,
      manage_groups: true,
      view_groups: true,
      assign_groups: true,
      manage_content: true,
      view_content: true,
      upload_resources: true,
      manage_reports: true,
      view_reports: true,
      export_data: true,
      manage_system: true,
      manage_permissions: true,
      view_logs: true,
    },
    supervisor: {
      manage_users: false,
      view_users: true,
      edit_user_info: true,
      manage_groups: true,
      view_groups: true,
      assign_groups: true,
      manage_content: true,
      view_content: true,
      upload_resources: true,
      manage_reports: true,
      view_reports: true,
      export_data: true,
      manage_system: false,
      manage_permissions: false,
      view_logs: false,
    },
    lider: {
      manage_users: false,
      view_users: true,
      edit_user_info: false,
      manage_groups: false,
      view_groups: true,
      assign_groups: true,
      manage_content: false,
      view_content: true,
      upload_resources: true,
      manage_reports: false,
      view_reports: true,
      export_data: false,
      manage_system: false,
      manage_permissions: false,
      view_logs: false,
    },
    miembro: {
      manage_users: false,
      view_users: false,
      edit_user_info: false,
      manage_groups: false,
      view_groups: true,
      assign_groups: false,
      manage_content: false,
      view_content: true,
      upload_resources: false,
      manage_reports: false,
      view_reports: false,
      export_data: false,
      manage_system: false,
      manage_permissions: false,
      view_logs: false,
    },
    invitado: {
      manage_users: false,
      view_users: false,
      edit_user_info: false,
      manage_groups: false,
      view_groups: false,
      assign_groups: false,
      manage_content: false,
      view_content: true,
      upload_resources: false,
      manage_reports: false,
      view_reports: false,
      export_data: false,
      manage_system: false,
      manage_permissions: false,
      view_logs: false,
    },
  });

  // Verificar permisos
  const permissions = currentUser ? getUserPermissions(currentUser.role) : null;
  const canManageUsers = permissions?.canManageUsers || currentUser?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar usuarios
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }

      // Cargar grupos
      const storedGroups = await AsyncStorage.getItem('groups');
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      } else {
        const defaultGroups: Group[] = [
          {
            id: '1',
            nombre: 'Jóvenes',
            descripcion: 'Grupo de jóvenes de 18-30 años',
            cantidadMiembros: 0,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            nombre: 'Adultos',
            descripcion: 'Grupo de adultos mayores de 30 años',
            cantidadMiembros: 0,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setGroups(defaultGroups);
        await AsyncStorage.setItem('groups', JSON.stringify(defaultGroups));
      }

      // Cargar permisos
      const storedPermissions = await AsyncStorage.getItem('rolePermissions');
      if (storedPermissions) {
        setRolePermissions(JSON.parse(storedPermissions));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para usuarios
  const handleSaveUser = async () => {
    if (!userFormData.nombre || !userFormData.apellido || !userFormData.email) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    if (selectedUser) {
      // Editar usuario
      const updatedUser: User = {
        ...selectedUser,
        ...userFormData,
        grupoNombre: groups.find(g => g.id === userFormData.grupoId)?.nombre,
        updatedAt: new Date(),
      };
      const updatedUsers = users.map(u => u.id === selectedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
    } else {
      // Crear usuario
      const newUser: User = {
        id: Date.now().toString(),
        ...userFormData,
        grupoNombre: groups.find(g => g.id === userFormData.grupoId)?.nombre,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      Alert.alert('Éxito', 'Usuario creado correctamente');
    }

    setShowUserModal(false);
    resetUserForm();
  };

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

  const openEditUserModal = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
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
    });
    setShowUserModal(true);
  };

  const resetUserForm = () => {
    setSelectedUser(null);
    setUserFormData({
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
    });
  };

  // Funciones para grupos
  const handleSaveGroup = async () => {
    if (!groupFormData.nombre) {
      Alert.alert('Error', 'El nombre del grupo es requerido');
      return;
    }

    if (selectedGroup) {
      // Editar grupo
      const updatedGroup: Group = {
        ...selectedGroup,
        nombre: groupFormData.nombre,
        descripcion: groupFormData.descripcion,
        updatedAt: new Date(),
      };
      const updatedGroups = groups.map(g => g.id === selectedGroup.id ? updatedGroup : g);
      setGroups(updatedGroups);
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      Alert.alert('Éxito', 'Grupo actualizado correctamente');
    } else {
      // Crear grupo
      const newGroup: Group = {
        id: Date.now().toString(),
        nombre: groupFormData.nombre,
        descripcion: groupFormData.descripcion,
        cantidadMiembros: 0,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      Alert.alert('Éxito', 'Grupo creado correctamente');
    }

    setShowGroupModal(false);
    resetGroupForm();
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupMembers = users.filter(u => u.grupoId === groupId);
    if (groupMembers.length > 0) {
      Alert.alert('Error', 'No se puede eliminar un grupo con miembros asignados');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de eliminar este grupo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedGroups = groups.filter(g => g.id !== groupId);
            setGroups(updatedGroups);
            await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
            Alert.alert('Éxito', 'Grupo eliminado correctamente');
          },
        },
      ]
    );
  };

  const openEditGroupModal = (group: Group) => {
    setSelectedGroup(group);
    setGroupFormData({
      nombre: group.nombre,
      descripcion: group.descripcion || '',
      liderId: '',
    });
    setShowGroupModal(true);
  };

  const resetGroupForm = () => {
    setSelectedGroup(null);
    setGroupFormData({
      nombre: '',
      descripcion: '',
      liderId: '',
    });
  };

  // Funciones para permisos
  const togglePermission = (role: UserRole, permissionId: string) => {
    if (currentUser?.role !== 'admin') {
      Alert.alert('Sin permisos', 'Solo los administradores pueden modificar permisos');
      return;
    }

    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionId]: !prev[role][permissionId],
      },
    }));
  };

  const savePermissions = async () => {
    try {
      await AsyncStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
      Alert.alert('Éxito', 'Permisos actualizados correctamente');
    } catch (error) {
      console.error('Error guardando permisos:', error);
      Alert.alert('Error', 'No se pudieron guardar los permisos');
    }
  };

  // Filtros
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.nombre.toLowerCase().includes(searchLower) ||
        user.apellido.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchQuery]);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => 
      group.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  // Helpers
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

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'activo': return '#26D0CE';
      case 'pendiente': return '#FFD93D';
      case 'inactivo': return '#FF6B6B';
      default: return '#95A5A6';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginVertical: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
    },
    activeTab: {
      backgroundColor: '#FF6B6B',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FF6B6B',
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 12,
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
    list: {
      flex: 1,
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: '#95A5A6',
      marginBottom: 8,
    },
    cardActions: {
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
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
    },
    groupBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    groupBadgeText: {
      color: '#FF6B6B',
      fontSize: 12,
      fontWeight: '500',
    },
    cardDetails: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    detailText: {
      fontSize: 13,
      color: '#95A5A6',
    },
    groupStats: {
      flexDirection: 'row',
      gap: 16,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 13,
      color: '#95A5A6',
    },
    membersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    memberChip: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    memberChipText: {
      fontSize: 12,
      color: '#FF6B6B',
      fontWeight: '500',
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
    permissionsHeader: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: '#95A5A6',
    },
    roleCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    roleTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    permissionCategory: {
      marginBottom: 16,
    },
    categoryTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: '#95A5A6',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    permissionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    permissionInfo: {
      flex: 1,
      marginRight: 12,
    },
    permissionName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
    },
    permissionDescription: {
      fontSize: 12,
      color: '#7F8C8D',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF6B6B',
      paddingVertical: 14,
      borderRadius: 12,
      marginVertical: 20,
      gap: 8,
      shadowColor: '#FF6B6B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    resetButton: {
      marginLeft: 'auto',
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#151A30' : '#F5F5F5',
      borderWidth: 1,
      borderColor: colors.border,
    },
    adminNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(255, 217, 61, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 217, 61, 0.3)',
      borderRadius: 12,
      padding: 16,
      marginVertical: 20,
    },
    adminNoteText: {
      flex: 1,
      fontSize: 14,
      color: '#FFD93D',
      fontWeight: '500',
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
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#151A30' : '#F5F5F5',
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionChipActive: {
      backgroundColor: '#FF6B6B',
      borderColor: '#FF6B6B',
    },
    optionChipText: {
      fontSize: 14,
      color: '#95A5A6',
      fontWeight: '500',
    },
    optionChipTextActive: {
      color: '#FFFFFF',
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
    primaryButton: {
      backgroundColor: '#FF6B6B',
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  if (!canManageUsers) {
    return (
      <View style={styles.container}>
        <AppHeader 
          title="Administración" 
          subtitle="Gestión del sistema"
        />
        <View style={styles.noPermission}>
          <Lock size={64} color="#95A5A6" />
          <Text style={styles.noPermissionText}>
            No tienes permisos para acceder a esta sección
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Administración" 
        subtitle="Gestión del sistema"
      />
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'usuarios' && styles.activeTab]}
          onPress={() => setActiveTab('usuarios')}
        >
          <Users size={18} color={activeTab === 'usuarios' ? '#FFFFFF' : '#FF6B6B'} />
          <Text style={[styles.tabText, activeTab === 'usuarios' && styles.activeTabText]}>
            Usuarios
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'permisos' && styles.activeTab]}
          onPress={() => setActiveTab('permisos')}
        >
          <Key size={18} color={activeTab === 'permisos' ? '#FFFFFF' : '#FF6B6B'} />
          <Text style={[styles.tabText, activeTab === 'permisos' && styles.activeTabText]}>
            Permisos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'grupos' && styles.activeTab]}
          onPress={() => setActiveTab('grupos')}
        >
          <Shield size={18} color={activeTab === 'grupos' ? '#FFFFFF' : '#FF6B6B'} />
          <Text style={[styles.tabText, activeTab === 'grupos' && styles.activeTabText]}>
            Grupos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sistema' && styles.activeTab]}
          onPress={() => setActiveTab('sistema')}
        >
          <Settings size={18} color={activeTab === 'sistema' ? '#FFFFFF' : '#FF6B6B'} />
          <Text style={[styles.tabText, activeTab === 'sistema' && styles.activeTabText]}>
            Sistema
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de Usuarios */}
      {activeTab === 'usuarios' && (
        <>
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
              onPress={() => {
                resetUserForm();
                setShowUserModal(true);
              }}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color="#95A5A6" />
                <Text style={styles.emptyStateText}>No se encontraron usuarios</Text>
              </View>
            ) : (
              filteredUsers.map(user => (
                <View key={user.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>
                        {user.nombre} {user.apellido}
                      </Text>
                      <Text style={styles.cardSubtitle}>{user.email}</Text>
                      <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: getRoleColor(user.role) }]}>
                          <Text style={styles.badgeText}>{ROLE_LABELS[user.role]}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getStatusColor(user.status) }]}>
                          <Text style={styles.badgeText}>{STATUS_LABELS[user.status]}</Text>
                        </View>
                        {user.grupoNombre && (
                          <View style={styles.groupBadge}>
                            <Users size={12} color="#FF6B6B" />
                            <Text style={styles.groupBadgeText}>{user.grupoNombre}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditUserModal(user)}
                      >
                        <Edit2 size={18} color="#95A5A6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {(user.telefono || user.direccion) && (
                    <View style={styles.cardDetails}>
                      {user.telefono && (
                        <View style={styles.detailRow}>
                          <Phone size={12} color="#95A5A6" />
                          <Text style={styles.detailText}>{user.telefono}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Contenido de Permisos */}
      {activeTab === 'permisos' && (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          <View style={styles.permissionsHeader}>
            <Text style={styles.sectionTitle}>Configuración de Permisos de Módulos</Text>
            <Text style={styles.sectionSubtitle}>
              Define qué módulos puede ver cada rol en la aplicación
            </Text>
          </View>

          {Object.entries(ROLE_LABELS).filter(([roleKey]) => roleKey !== 'admin').map(([roleKey, roleLabel]) => {
            const currentPermissions = getEffectivePermissions(roleKey as UserRole);
            const categorizedModules = MODULE_PERMISSIONS.reduce((acc, module) => {
              if (!acc[module.category]) acc[module.category] = [];
              acc[module.category].push(module);
              return acc;
            }, {} as { [key: string]: typeof MODULE_PERMISSIONS });

            return (
              <View key={roleKey} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <Shield size={20} color={getRoleColor(roleKey as UserRole)} />
                  <Text style={styles.roleTitle}>{roleLabel}</Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                      Alert.alert(
                        'Resetear Permisos',
                        `¿Desea restaurar los permisos por defecto para ${roleLabel}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Resetear',
                            style: 'destructive',
                            onPress: async () => {
                              await resetPermissionsToDefault(roleKey as UserRole);
                              Alert.alert('Éxito', 'Permisos restaurados a valores por defecto');
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Settings size={16} color="#95A5A6" />
                  </TouchableOpacity>
                </View>

                {Object.entries(categorizedModules).map(([category, modules]) => (
                  <View key={category} style={styles.permissionCategory}>
                    <Text style={styles.categoryTitle}>
                      {category === 'content' ? 'CONTENIDO' :
                       category === 'management' ? 'GESTIÓN' :
                       category === 'communication' ? 'COMUNICACIÓN' : 'ADMINISTRACIÓN'}
                    </Text>
                    {modules.map(module => {
                      const isEnabled = currentPermissions?.[module.moduleKey] || false;
                      return (
                        <View key={module.moduleKey} style={styles.permissionItem}>
                          <View style={styles.permissionInfo}>
                            <Text style={styles.permissionName}>{module.moduleName}</Text>
                            {module.description && (
                              <Text style={styles.permissionDescription}>{module.description}</Text>
                            )}
                          </View>
                          <Switch
                            value={isEnabled}
                            onValueChange={async (value) => {
                              if (currentUser?.role !== 'admin') {
                                Alert.alert('Sin permisos', 'Solo los administradores pueden modificar permisos');
                                return;
                              }
                              const updatedPermissions: Partial<ModuleRolePermissions> = {
                                [module.moduleKey]: value
                              };
                              await updateCustomPermissions(roleKey as UserRole, updatedPermissions);
                            }}
                            trackColor={{ false: '#2C3E50', true: 'rgba(255, 107, 107, 0.3)' }}
                            thumbColor={isEnabled ? '#FF6B6B' : '#95A5A6'}
                            disabled={currentUser?.role !== 'admin'}
                          />
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            );
          })}

          <View style={styles.adminNote}>
            <Lock size={16} color="#FFD93D" />
            <Text style={styles.adminNoteText}>
              Los administradores siempre tienen acceso completo a todos los módulos
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Contenido de Sistema */}
      {activeTab === 'sistema' && (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          <View style={styles.permissionsHeader}>
            <Text style={styles.sectionTitle}>Configuración del Sistema</Text>
            <Text style={styles.sectionSubtitle}>
              Opciones avanzadas de administración
            </Text>
          </View>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <AlertTriangle size={20} color="#FF6B6B" />
              <Text style={styles.roleTitle}>Zona de Peligro - Reseteo Total</Text>
            </View>

            <View style={styles.permissionCategory}>
              <Text style={styles.categoryTitle}>RESETEAR TODOS LOS DATOS</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#EF4444', marginVertical: 10 }]}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Resetear Todas las Estadísticas',
                    'Esta acción eliminará PERMANENTEMENTE todos los datos de la aplicación:\n\n• Miembros\n• Grupos\n• Zonas\n• Asistencias\n• Recursos\n• Anuncios\n• Progreso de discipulado\n• Devocionales\n• Todas las estadísticas\n\n¿Está absolutamente seguro? Esta acción NO se puede deshacer.',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Sí, resetear todo',
                        style: 'destructive',
                        onPress: () => {
                          Alert.alert(
                            '⚠️ Confirmación Final',
                            '¿Está COMPLETAMENTE SEGURO de que desea eliminar TODOS los datos? Esta es su última oportunidad para cancelar.',
                            [
                              {
                                text: 'Cancelar',
                                style: 'cancel',
                              },
                              {
                                text: 'ELIMINAR TODO',
                                style: 'destructive',
                                onPress: async () => {
                                  setLoading(true);
                                  const success = await resetAllData();
                                  setLoading(false);
                                  
                                  if (success) {
                                    Alert.alert(
                                      '✅ Datos Reseteados',
                                      'Todas las estadísticas y datos han sido eliminados exitosamente.',
                                      [
                                        {
                                          text: 'OK',
                                          onPress: () => {
                                            // Recargar los datos
                                            loadData();
                                          },
                                        },
                                      ]
                                    );
                                  } else {
                                    Alert.alert(
                                      'Error',
                                      'Hubo un problema al resetear los datos. Por favor, intente nuevamente.'
                                    );
                                  }
                                },
                              },
                            ]
                          );
                        },
                      },
                    ]
                  );
                }}
              >
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Resetear TODO</Text>
              </TouchableOpacity>

              <View style={[styles.adminNote, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={[styles.adminNoteText, { color: '#EF4444' }]}>
                  Advertencia: Esta acción eliminará permanentemente TODOS los datos. No se puede deshacer.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Settings size={20} color="#FFD93D" />
              <Text style={styles.roleTitle}>Reseteo Parcial - Por Categorías</Text>
            </View>

            <View style={styles.permissionCategory}>
              <Text style={styles.categoryTitle}>USUARIOS Y GRUPOS</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#F59E0B', marginVertical: 10 }]}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Resetear Usuarios y Grupos',
                    'Esta acción eliminará:\n\n• Todos los usuarios (excepto el administrador actual)\n• Todos los grupos\n• Asignaciones de usuarios a grupos\n\n¿Está seguro?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Resetear',
                        style: 'destructive',
                        onPress: async () => {
                          setLoading(true);
                          try {
                            // Mantener el usuario actual si es admin
                            const currentUserData = currentUser?.role === 'admin' ? [currentUser] : [];
                            await AsyncStorage.setItem('users', JSON.stringify(currentUserData));
                            await AsyncStorage.removeItem('groups');
                            
                            Alert.alert(
                              '✅ Datos Reseteados',
                              'Usuarios y grupos han sido eliminados.',
                              [{ text: 'OK', onPress: () => loadData() }]
                            );
                          } catch (error) {
                            Alert.alert('Error', 'No se pudieron resetear los datos');
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Users size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Resetear Usuarios y Grupos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionCategory}>
              <Text style={styles.categoryTitle}>DISCIPULADO</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#8B5CF6', marginVertical: 10 }]}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Resetear Progreso de Discipulado',
                    'Esta acción eliminará:\n\n• Todo el progreso en módulos\n• Respuestas guardadas\n• Puntuaciones\n• Tabla de mejores puntuaciones\n\n¿Está seguro?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Resetear',
                        style: 'destructive',
                        onPress: async () => {
                          setLoading(true);
                          try {
                            await AsyncStorage.removeItem('discipleshipProgress');
                            await AsyncStorage.removeItem('discipleshipScores');
                            await AsyncStorage.removeItem('topScores');
                            
                            Alert.alert(
                              '✅ Datos Reseteados',
                              'El progreso de discipulado ha sido eliminado.',
                              [{ text: 'OK' }]
                            );
                          } catch (error) {
                            Alert.alert('Error', 'No se pudieron resetear los datos');
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Resetear Discipulado</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionCategory}>
              <Text style={styles.categoryTitle}>ASISTENCIAS</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#10B981', marginVertical: 10 }]}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Resetear Asistencias',
                    'Esta acción eliminará:\n\n• Todos los registros de asistencia\n• Estadísticas de asistencia\n• Historial de reuniones\n\n¿Está seguro?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Resetear',
                        style: 'destructive',
                        onPress: async () => {
                          setLoading(true);
                          try {
                            await AsyncStorage.removeItem('attendanceRecords');
                            await AsyncStorage.removeItem('meetings');
                            
                            Alert.alert(
                              '✅ Datos Reseteados',
                              'Los registros de asistencia han sido eliminados.',
                              [{ text: 'OK' }]
                            );
                          } catch (error) {
                            Alert.alert('Error', 'No se pudieron resetear los datos');
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <UserCheck size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Resetear Asistencias</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionCategory}>
              <Text style={styles.categoryTitle}>CONTENIDO Y RECURSOS</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#06B6D4', marginVertical: 10 }]}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Resetear Contenido',
                    'Esta acción eliminará:\n\n• Devocionales guardados\n• Prédicas\n• Anuncios\n• Recursos\n• Mensajes\n\n¿Está seguro?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Resetear',
                        style: 'destructive',
                        onPress: async () => {
                          setLoading(true);
                          try {
                            await AsyncStorage.removeItem('devocionales');
                            await AsyncStorage.removeItem('predicas');
                            await AsyncStorage.removeItem('anuncios');
                            await AsyncStorage.removeItem('recursos');
                            await AsyncStorage.removeItem('mensajes');
                            
                            Alert.alert(
                              '✅ Datos Reseteados',
                              'Todo el contenido ha sido eliminado.',
                              [{ text: 'OK' }]
                            );
                          } catch (error) {
                            Alert.alert('Error', 'No se pudieron resetear los datos');
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Resetear Contenido</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionCategory}>
              <Text style={styles.categoryTitle}>ZONAS Y REPORTES</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#EC4899', marginVertical: 10 }]}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Resetear Zonas y Reportes',
                    'Esta acción eliminará:\n\n• Todas las zonas\n• Todos los reportes generados\n• Estadísticas de zonas\n\n¿Está seguro?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Resetear',
                        style: 'destructive',
                        onPress: async () => {
                          setLoading(true);
                          try {
                            await AsyncStorage.removeItem('zonas');
                            await AsyncStorage.removeItem('reportes');
                            
                            Alert.alert(
                              '✅ Datos Reseteados',
                              'Zonas y reportes han sido eliminados.',
                              [{ text: 'OK' }]
                            );
                          } catch (error) {
                            Alert.alert('Error', 'No se pudieron resetear los datos');
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Shield size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Resetear Zonas y Reportes</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.adminNote, { backgroundColor: 'rgba(255, 217, 61, 0.1)', borderColor: 'rgba(255, 217, 61, 0.3)' }]}>
              <AlertTriangle size={16} color="#FFD93D" />
              <Text style={[styles.adminNoteText, { color: '#FFD93D' }]}>
                Nota: El reseteo parcial permite eliminar datos por categorías específicas sin afectar otras áreas de la aplicación.
              </Text>
            </View>
          </View>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Settings size={20} color="#6C5CE7" />
              <Text style={styles.roleTitle}>Información del Sistema</Text>
            </View>

            <View style={styles.permissionCategory}>
              <View style={styles.detailRow}>
                <Text style={styles.permissionName}>Versión de la App:</Text>
                <Text style={styles.detailText}>1.0.0</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.permissionName}>Usuario Actual:</Text>
                <Text style={styles.detailText}>{currentUser?.email || 'No identificado'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.permissionName}>Rol:</Text>
                <Text style={styles.detailText}>{currentUser ? ROLE_LABELS[currentUser.role] : 'N/A'}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Contenido de Grupos */}
      {activeTab === 'grupos' && (
        <>
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#95A5A6" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar grupos..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#7F8C8D"
              />
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                resetGroupForm();
                setShowGroupModal(true);
              }}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
            ) : filteredGroups.length === 0 ? (
              <View style={styles.emptyState}>
                <Shield size={48} color="#95A5A6" />
                <Text style={styles.emptyStateText}>No se encontraron grupos</Text>
              </View>
            ) : (
              filteredGroups.map(group => {
                const groupMembers = users.filter(u => u.grupoId === group.id);
                const groupLeader = groupMembers.find(u => u.role === 'lider');
                
                return (
                  <View key={group.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{group.nombre}</Text>
                        {group.descripcion && (
                          <Text style={styles.cardSubtitle}>{group.descripcion}</Text>
                        )}
                        <View style={styles.groupStats}>
                          <View style={styles.statItem}>
                            <Users size={14} color="#95A5A6" />
                            <Text style={styles.statText}>{groupMembers.length} miembros</Text>
                          </View>
                          {groupLeader && (
                            <View style={styles.statItem}>
                              <Shield size={14} color="#95A5A6" />
                              <Text style={styles.statText}>Líder: {groupLeader.nombre}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => openEditGroupModal(group)}
                        >
                          <Edit2 size={18} color="#95A5A6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {groupMembers.length > 0 && (
                      <View style={styles.membersList}>
                        {groupMembers.slice(0, 4).map(member => (
                          <View key={member.id} style={styles.memberChip}>
                            <Text style={styles.memberChipText}>
                              {member.nombre} {member.apellido}
                            </Text>
                          </View>
                        ))}
                        {groupMembers.length > 4 && (
                          <View style={styles.memberChip}>
                            <Text style={styles.memberChipText}>+{groupMembers.length - 4} más</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </>
      )}

      {/* Modal de Usuario */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowUserModal(false);
          resetUserForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowUserModal(false);
                resetUserForm();
              }}>
                <X size={24} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.nombre}
                  onChangeText={(text) => setUserFormData({...userFormData, nombre: text})}
                  placeholder="Nombre"
                  placeholderTextColor="#7F8C8D"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.apellido}
                  onChangeText={(text) => setUserFormData({...userFormData, apellido: text})}
                  placeholder="Apellido"
                  placeholderTextColor="#7F8C8D"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.email}
                  onChangeText={(text) => setUserFormData({...userFormData, email: text})}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#7F8C8D"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.telefono}
                  onChangeText={(text) => setUserFormData({...userFormData, telefono: text})}
                  placeholder="555-0000"
                  keyboardType="phone-pad"
                  placeholderTextColor="#7F8C8D"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rol</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.optionChip,
                        userFormData.role === key && styles.optionChipActive
                      ]}
                      onPress={() => setUserFormData({...userFormData, role: key as UserRole})}
                    >
                      <Text style={[
                        styles.optionChipText,
                        userFormData.role === key && styles.optionChipTextActive
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.optionsRow}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.optionChip,
                        userFormData.status === key && styles.optionChipActive
                      ]}
                      onPress={() => setUserFormData({...userFormData, status: key as UserStatus})}
                    >
                      <Text style={[
                        styles.optionChipText,
                        userFormData.status === key && styles.optionChipTextActive
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Grupo</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      !userFormData.grupoId && styles.optionChipActive
                    ]}
                    onPress={() => setUserFormData({...userFormData, grupoId: ''})}
                  >
                    <Text style={[
                      styles.optionChipText,
                      !userFormData.grupoId && styles.optionChipTextActive
                    ]}>
                      Sin grupo
                    </Text>
                  </TouchableOpacity>
                  {groups.map(group => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.optionChip,
                        userFormData.grupoId === group.id && styles.optionChipActive
                      ]}
                      onPress={() => setUserFormData({...userFormData, grupoId: group.id})}
                    >
                      <Text style={[
                        styles.optionChipText,
                        userFormData.grupoId === group.id && styles.optionChipTextActive
                      ]}>
                        {group.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowUserModal(false);
                  resetUserForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveUser}
              >
                <Text style={styles.primaryButtonText}>
                  {selectedUser ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Grupo */}
      <Modal
        visible={showGroupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowGroupModal(false);
          resetGroupForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowGroupModal(false);
                resetGroupForm();
              }}>
                <X size={24} color="#95A5A6" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre del Grupo *</Text>
                <TextInput
                  style={styles.input}
                  value={groupFormData.nombre}
                  onChangeText={(text) => setGroupFormData({...groupFormData, nombre: text})}
                  placeholder="Ej: Jóvenes"
                  placeholderTextColor="#7F8C8D"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={groupFormData.descripcion}
                  onChangeText={(text) => setGroupFormData({...groupFormData, descripcion: text})}
                  placeholder="Descripción del grupo..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#7F8C8D"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowGroupModal(false);
                  resetGroupForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveGroup}
              >
                <Text style={styles.primaryButtonText}>
                  {selectedGroup ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}