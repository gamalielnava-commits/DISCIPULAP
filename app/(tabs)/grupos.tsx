import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform
} from "react-native";
import { Users, Plus, Edit2, Trash2, Search, X, User, MapPin, Clock, MoreVertical } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import Colors from "@/constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '@/components/AppHeader';

export default function GroupsScreen() {
  const { groups, members, addGroup, updateGroup, deleteGroup, addMember, updateMember, deleteMember, permissions, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  const [groupForm, setGroupForm] = useState({
    nombre: "",
    ubicacion: "",
    horario: "",
    lideres: [] as string[],
  });

  const [memberForm, setMemberForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    bautizado: false,
    discipulado: false,
    ministerio: "",
    grupoId: "",
    estatus: "activo" as "activo" | "inactivo",
  });

  const filteredGroups = groups.filter(g => 
    g.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveGroup = () => {
    if (!groupForm.nombre || !groupForm.ubicacion || !groupForm.horario) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, groupForm);
    } else {
      addGroup(groupForm);
    }

    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupForm({ nombre: "", ubicacion: "", horario: "", lideres: [] });
  };

  const handleSaveMember = () => {
    if (!memberForm.nombre || !memberForm.apellido || !memberForm.email) {
      Alert.alert("Error", "Por favor complete los campos requeridos");
      return;
    }

    if (editingMember) {
      updateMember(editingMember.id, memberForm);
    } else {
      addMember({ ...memberForm, grupoId: selectedGroup || "" });
    }

    setShowMemberModal(false);
    setEditingMember(null);
    setMemberForm({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      direccion: "",
      fechaNacimiento: "",
      bautizado: false,
      discipulado: false,
      ministerio: "",
      grupoId: "",
      estatus: "activo",
    });
  };

  const handleDeleteMember = (memberId: string) => {
    Alert.alert(
      "Eliminar Miembro",
      "¿Está seguro de eliminar este miembro del grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMember(memberId) }
      ]
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    Alert.alert(
      "Eliminar Grupo",
      "¿Está seguro de eliminar este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteGroup(groupId) }
      ]
    );
  };

  const openEditGroup = (group: any) => {
    setEditingGroup(group);
    setGroupForm({
      nombre: group.nombre,
      ubicacion: group.ubicacion,
      horario: group.horario,
      lideres: group.lideres || [],
    });
    setShowGroupModal(true);
  };

  const openEditMember = (member: any) => {
    setEditingMember(member);
    setMemberForm(member);
    setShowMemberModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Grupos" 
        subtitle="Grupos de Discipulado"
      />
      
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar grupo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.tabIconDefault}
          />
        </View>
        <Text style={[styles.groupsCount, { color: colors.tabIconDefault }]}>
          {groups.length} grupos activos
        </Text>
      </View>
      
      {permissions?.canManageGroups && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => setShowGroupModal(true)}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.floatingButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.content}>
        {filteredGroups.map((group) => {
          const groupMembers = members.filter(m => m.grupoId === group.id);
          const isExpanded = selectedGroup === group.id;
          
          return (
            <View key={group.id} style={[styles.groupCard, { backgroundColor: colors.card }]}>
              <TouchableOpacity 
                style={styles.groupHeader}
                onPress={() => setSelectedGroup(isExpanded ? null : group.id)}
              >
                <View style={styles.groupInfo}>
                  <View style={styles.groupTitleRow}>
                    <LinearGradient
                      colors={[colors.primary + '20', colors.primary + '10']}
                      style={styles.groupIcon}
                    >
                      <Users size={20} color={colors.primary} />
                    </LinearGradient>
                    <Text style={[styles.groupName, { color: colors.text }]}>{group.nombre}</Text>
                  </View>
                  <View style={styles.groupDetailRow}>
                    <MapPin size={14} color={colors.tabIconDefault} />
                    <Text style={[styles.groupDetails, { color: colors.tabIconDefault }]}>{group.ubicacion}</Text>
                  </View>
                  <View style={styles.groupDetailRow}>
                    <Clock size={14} color={colors.tabIconDefault} />
                    <Text style={[styles.groupDetails, { color: colors.tabIconDefault }]}>{group.horario}</Text>
                  </View>
                  <View style={[styles.memberCountBadge, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.memberCount, { color: colors.secondary }]}>
                      {groupMembers.length} miembros
                    </Text>
                  </View>
                </View>
                
                {permissions?.canManageGroups && (
                  <View style={styles.groupActions}>
                    <TouchableOpacity 
                      style={[styles.actionIcon, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => openEditGroup(group)}
                    >
                      <Edit2 size={16} color={colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionIcon, { backgroundColor: colors.danger + '10' }]}
                      onPress={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.membersList}>
                  <View style={styles.membersHeader}>
                    <Text style={styles.membersTitle}>Miembros del Grupo</Text>
                    <TouchableOpacity 
                      style={styles.addMemberButton}
                      onPress={() => {
                        setMemberForm({ ...memberForm, grupoId: group.id });
                        setShowMemberModal(true);
                      }}
                    >
                      <Plus size={16} color="#2B6CB0" />
                      <Text style={styles.addMemberText}>Agregar</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {groupMembers.map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <User size={16} color="#718096" />
                      <Text style={styles.memberName}>
                        {member.nombre} {member.apellido}
                      </Text>
                      <View style={styles.memberBadges}>
                        {member.bautizado && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>B</Text>
                          </View>
                        )}
                        {member.discipulado && (
                          <View style={[styles.badge, styles.badgeDiscipulado]}>
                            <Text style={styles.badgeText}>D</Text>
                          </View>
                        )}
                      </View>
                      {permissions?.canManageGroups && (
                        <View style={styles.memberActions}>
                          <TouchableOpacity 
                            style={styles.memberActionButton}
                            onPress={() => openEditMember(member)}
                          >
                            <Edit2 size={14} color="#2B6CB0" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.memberActionButton}
                            onPress={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 size={14} color="#E53E3E" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                  
                  {groupMembers.length === 0 && (
                    <Text style={styles.noMembers}>No hay miembros en este grupo</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal para Grupo */}
      <Modal
        visible={showGroupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGroup ? "Editar Grupo" : "Nuevo Grupo"}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowGroupModal(false);
                setEditingGroup(null);
                setGroupForm({ nombre: "", ubicacion: "", horario: "", lideres: [] });
              }}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del grupo"
              value={groupForm.nombre}
              onChangeText={(text) => setGroupForm({ ...groupForm, nombre: text })}
              placeholderTextColor="#A0AEC0"
            />

            <TextInput
              style={styles.input}
              placeholder="Ubicación"
              value={groupForm.ubicacion}
              onChangeText={(text) => setGroupForm({ ...groupForm, ubicacion: text })}
              placeholderTextColor="#A0AEC0"
            />

            <TextInput
              style={styles.input}
              placeholder="Horario (ej: Viernes 7:30 PM)"
              value={groupForm.horario}
              onChangeText={(text) => setGroupForm({ ...groupForm, horario: text })}
              placeholderTextColor="#A0AEC0"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroup}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para Miembro */}
      <Modal
        visible={showMemberModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMember ? "Editar Miembro" : "Nuevo Miembro"}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowMemberModal(false);
                setEditingMember(null);
              }}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.input}
                placeholder="Nombre *"
                value={memberForm.nombre}
                onChangeText={(text) => setMemberForm({ ...memberForm, nombre: text })}
                placeholderTextColor="#A0AEC0"
              />

              <TextInput
                style={styles.input}
                placeholder="Apellido *"
                value={memberForm.apellido}
                onChangeText={(text) => setMemberForm({ ...memberForm, apellido: text })}
                placeholderTextColor="#A0AEC0"
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={memberForm.email}
                onChangeText={(text) => setMemberForm({ ...memberForm, email: text })}
                keyboardType="email-address"
                placeholderTextColor="#A0AEC0"
              />

              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={memberForm.telefono}
                onChangeText={(text) => setMemberForm({ ...memberForm, telefono: text })}
                keyboardType="phone-pad"
                placeholderTextColor="#A0AEC0"
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={memberForm.direccion}
                onChangeText={(text) => setMemberForm({ ...memberForm, direccion: text })}
                placeholderTextColor="#A0AEC0"
              />

              <TextInput
                style={styles.input}
                placeholder="Fecha de Nacimiento (DD/MM/AAAA)"
                value={memberForm.fechaNacimiento}
                onChangeText={(text) => setMemberForm({ ...memberForm, fechaNacimiento: text })}
                placeholderTextColor="#A0AEC0"
              />

              <TextInput
                style={styles.input}
                placeholder="Ministerio"
                value={memberForm.ministerio}
                onChangeText={(text) => setMemberForm({ ...memberForm, ministerio: text })}
                placeholderTextColor="#A0AEC0"
              />

              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setMemberForm({ ...memberForm, bautizado: !memberForm.bautizado })}
                >
                  <View style={[styles.checkboxBox, memberForm.bautizado && styles.checkboxChecked]}>
                    {memberForm.bautizado && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Bautizado</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setMemberForm({ ...memberForm, discipulado: !memberForm.discipulado })}
                >
                  <View style={[styles.checkboxBox, memberForm.discipulado && styles.checkboxChecked]}>
                    {memberForm.discipulado && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>En Discipulado</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveMember}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                {editingMember && (
                  <TouchableOpacity 
                    style={[styles.deleteButton]} 
                    onPress={() => {
                      handleDeleteMember(editingMember.id);
                      setShowMemberModal(false);
                      setEditingMember(null);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar Miembro</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
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
  searchSection: {
    padding: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  groupsCount: {
    fontSize: 14,
    marginLeft: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingButtonGradient: {
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
  },
  content: {
    flex: 1,
    padding: 15,
  },
  groupCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  groupDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupDetails: {
    fontSize: 14,
    marginLeft: 6,
  },
  memberCountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  membersList: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 15,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addMemberText: {
    color: '#2B6CB0',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  memberActionButton: {
    padding: 6,
    marginLeft: 4,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    marginLeft: 10,
  },
  memberBadges: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: '#38A169',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  badgeDiscipulado: {
    backgroundColor: '#805AD5',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  noMembers: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 14,
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  modalScroll: {
    maxHeight: 400,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2B6CB0',
    borderColor: '#2B6CB0',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2D3748',
  },
  modalButtons: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
});