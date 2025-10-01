import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { 
  User, 
  Moon, 
  Sun, 
  Users, 
  LogOut, 
  Calendar,
  Mail,
  Phone,
  Edit2,
  X,
  Check
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import AppHeader from '@/components/AppHeader';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  grupo?: string;
  rolGrupo?: string;
  telefono?: string;
  fechaNacimiento?: string;
}

interface EditFormData {
  name: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
}



export default function PerfilScreen() {
  const { setIsAuthenticated, isDarkMode, setIsDarkMode, user, updateUser } = useApp();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
  });
  const [isLoading, setIsLoading] = useState(false);


  const colors = isDarkMode ? Colors.dark : Colors.light;
  const textSecondary = isDarkMode ? '#94a3b8' : '#64748b';


  useEffect(() => {
    console.log('Perfil - Usuario actual:', user);
    if (user) {
      const data: UserData = {
        id: user.id,
        name: `${user.nombre} ${user.apellido}`.trim(),
        email: user.email,
        role: user.role,
        grupo: user.grupoNombre || 'Sin grupo',
        rolGrupo: 'miembro',
        telefono: user.telefono || '',
        fechaNacimiento: user.fechaNacimiento || '',
      };
      console.log('Perfil - Datos del usuario procesados:', data);
      setUserData(data);
    } else {
      console.log('Perfil - No hay usuario autenticado');
      setUserData(null);
    }
  }, [user]);





  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro que deseas cerrar sesión?');
      if (confirmed) {
        setIsAuthenticated(false);
        router.replace('/login');
      }
    } else {
      // En móvil, simplemente cerrar sesión sin Alert
      setIsAuthenticated(false);
      router.replace('/login');
    }
  };

  const getRolDisplay = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      supervisor: 'Supervisor',
      lider: 'Líder',
      miembro: 'Miembro',
      discipulo: 'Discípulo',
      amigo: 'Amigo',
    };
    return roles[role] || role;
  };

  const getRolGrupoDisplay = (rol?: string) => {
    if (!rol) return null;
    const rolesGrupo: Record<string, string> = {
      lider: 'Líder del Grupo',
      asistente: 'Asistente',
      anfitrion: 'Anfitrión',
      discipulo: 'Discípulo',
      amigo: 'Amigo',
    };
    return rolesGrupo[rol] || rol;
  };

  const openEditModal = () => {
    if (userData) {
      setEditFormData({
        name: userData.name,
        email: userData.email,
        telefono: userData.telefono || '',
        fechaNacimiento: userData.fechaNacimiento || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !editFormData.name.trim() || !editFormData.email.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor complete los campos obligatorios (nombre y email)');
      } else {
        Alert.alert('Error', 'Por favor complete los campos obligatorios (nombre y email)');
      }
      return;
    }

    setIsLoading(true);
    try {
      // Separar nombre y apellido
      const nameParts = editFormData.name.trim().split(' ');
      const nombre = nameParts[0] || '';
      const apellido = nameParts.slice(1).join(' ') || '';

      // Actualizar usuario en el contexto
      await updateUser({
        nombre,
        apellido,
        email: editFormData.email.trim(),
        telefono: editFormData.telefono.trim(),
        fechaNacimiento: editFormData.fechaNacimiento.trim(),
      });
      
      setShowEditModal(false);
      
      if (Platform.OS === 'web') {
        alert('Perfil actualizado correctamente');
      } else {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      if (Platform.OS === 'web') {
        alert('No se pudo actualizar el perfil');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateInput = (text: string) => {
    // Auto-format date as user types
    let formatted = text.replace(/[^0-9]/g, '');
    if (formatted.length >= 3 && formatted.length <= 4) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    } else if (formatted.length >= 5) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
    }
    return formatted;
  };



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Mi Perfil" 
        subtitle={userData?.email || user?.email || 'Cargando...'}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.surfaceLight }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <User size={40} color="#fff" />
          </View>
          <View style={styles.userNameContainer}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {userData?.name || (user ? `${user.nombre} ${user.apellido}`.trim() : 'Cargando...')}
            </Text>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
              onPress={openEditModal}
            >
              <Edit2 size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userEmail, { color: textSecondary }]}>
            {userData?.email || user?.email || 'Cargando...'}
          </Text>
          
          <View style={styles.rolesContainer}>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.roleText, { color: colors.primary }]}>
                {getRolDisplay(userData?.role || user?.role || 'miembro')}
              </Text>
            </View>
            
            {userData?.rolGrupo && (
              <View style={[styles.roleBadge, { backgroundColor: '#10b981' + '20' }]}>
                <Text style={[styles.roleText, { color: '#10b981' }]}>
                  {getRolGrupoDisplay(userData.rolGrupo)}
                </Text>
              </View>
            )}
          </View>

          {userData?.grupo && (
            <View style={styles.grupoInfo}>
              <Users size={16} color={textSecondary} />
              <Text style={[styles.grupoText, { color: textSecondary }]}>
                Grupo: {userData.grupo}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Información Personal
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Mail size={18} color={textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: textSecondary }]}>Correo electrónico</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userData?.email || user?.email || 'No especificado'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Phone size={18} color={textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: textSecondary }]}>Teléfono</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userData?.telefono || user?.telefono || 'No especificado'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Calendar size={18} color={textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: textSecondary }]}>Fecha de nacimiento</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userData?.fechaNacimiento || user?.fechaNacimiento || 'No especificado'}
                </Text>
              </View>
            </View>
          </View>
        </View>



        <View style={[styles.section, { backgroundColor: colors.surfaceLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Configuración
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <View style={styles.settingLeft}>
              {isDarkMode ? (
                <Moon size={24} color={textSecondary} />
              ) : (
                <Sun size={24} color={textSecondary} />
              )}
              <Text style={[styles.settingText, { color: colors.text }]}>
                Modo {isDarkMode ? 'Oscuro' : 'Claro'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#cbd5e1', true: colors.primary + '50' }}
              thumbColor={isDarkMode ? colors.primary : '#f1f5f9'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#ef4444' }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textSecondary }]}>
            iglesiacasadedios33@gmail.com
          </Text>
        </View>
      </ScrollView>

      {/* Modal de edición */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceLight }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Editar Perfil
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                disabled={isLoading}
              >
                <X size={24} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: textSecondary }]}>Nombre completo *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({...editFormData, name: text})}
                  placeholder="Ingrese su nombre completo"
                  placeholderTextColor={textSecondary}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: textSecondary }]}>Correo electrónico *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({...editFormData, email: text})}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={textSecondary}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: textSecondary }]}>Teléfono</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={editFormData.telefono}
                  onChangeText={(text) => setEditFormData({...editFormData, telefono: text})}
                  placeholder="555-0123"
                  keyboardType="phone-pad"
                  placeholderTextColor={textSecondary}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: textSecondary }]}>Fecha de nacimiento</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={editFormData.fechaNacimiento}
                  onChangeText={(text) => {
                    const formatted = formatDateInput(text);
                    setEditFormData({...editFormData, fechaNacimiento: formatted});
                  }}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor={textSecondary}
                  editable={!isLoading}
                />
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { 
                  backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                  borderColor: colors.border 
                }]}
                onPress={() => setShowEditModal(false)}
                disabled={isLoading}
              >
                <Text style={[styles.cancelButtonText, { color: textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.saveButtonText}>Guardando...</Text>
                ) : (
                  <>
                    <Check size={16} color="#fff" />
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grupoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  grupoText: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});