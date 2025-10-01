import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { 
  Send, 
  MessageSquare, 
  Users, 
  User, 
  ChevronDown,
  Clock,
  Check,
  CheckCheck,
  Plus,
  X,
  Bell,
  Shield,
  UserCheck,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/providers/AppProvider';
import { UserRole, ROLE_LABELS, canUserMessageToRole, ROLE_HIERARCHY } from '@/types/auth';
import AppHeader from '@/components/AppHeader';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientType: 'all' | 'role' | 'group' | 'individual';
  recipientRole?: UserRole;
  recipientGroupId?: string;
  recipientUserId?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  readBy?: string[];
}

export default function MensajesScreen() {
  const { user, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'admin1',
      senderName: 'Pastor Juan',
      senderRole: 'admin',
      recipientType: 'all',
      content: '¡Bendiciones familia! Recordemos que este domingo tendremos servicio especial a las 10am. Los esperamos con mucho gozo.',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      readBy: [],
    },
    {
      id: '2',
      senderId: 'supervisor1',
      senderName: 'María González',
      senderRole: 'supervisor',
      recipientType: 'role',
      recipientRole: 'lider',
      content: 'Líderes, por favor enviar el reporte de asistencia de esta semana antes del viernes.',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      readBy: ['user1'],
    },
  ]);

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipientType, setSelectedRecipientType] = useState<'all' | 'role' | 'group' | 'individual'>('all');
  const [selectedRole, setSelectedRole] = useState<UserRole>('miembro');
  const [showRecipientModal, setShowRecipientModal] = useState(false);

  // Simulación de usuario actual
  const currentUser = user || {
    id: 'user1',
    nombre: 'Usuario',
    role: 'lider' as UserRole,
  };

  const permissions = useMemo(() => {
    const roleHierarchy = ROLE_HIERARCHY[currentUser.role];
    return {
      canSend: roleHierarchy >= 2, // Líderes y superiores pueden enviar
      canSendToAll: currentUser.role === 'admin',
      availableRoles: Object.entries(ROLE_HIERARCHY)
        .filter(([role, level]) => level < roleHierarchy)
        .map(([role]) => role as UserRole),
    };
  }, [currentUser.role]);

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Mensajes para todos
      if (msg.recipientType === 'all') return true;
      
      // Mensajes para un rol específico
      if (msg.recipientType === 'role' && msg.recipientRole === currentUser.role) return true;
      
      // Mensajes individuales
      if (msg.recipientType === 'individual' && msg.recipientUserId === currentUser.id) return true;
      
      // Mensajes enviados por el usuario
      if (msg.senderId === currentUser.id) return true;
      
      return false;
    });
  }, [messages, currentUser]);

  const sendMessage = () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Por favor escribe un mensaje');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.nombre,
      senderRole: currentUser.role,
      recipientType: selectedRecipientType,
      recipientRole: selectedRecipientType === 'role' ? selectedRole : undefined,
      content: newMessage,
      timestamp: new Date(),
      read: false,
      readBy: [],
    };

    setMessages([message, ...messages]);
    setNewMessage('');
    setShowComposeModal(false);
    Alert.alert('Éxito', 'Mensaje enviado correctamente');
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, read: true, readBy: [...(msg.readBy || []), currentUser.id] }
        : msg
    ));
  };

  const getRecipientLabel = (msg: Message) => {
    switch (msg.recipientType) {
      case 'all':
        return 'Todos';
      case 'role':
        return ROLE_LABELS[msg.recipientRole!];
      case 'group':
        return 'Grupo';
      case 'individual':
        return 'Personal';
      default:
        return '';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} color={colors.primary} />;
      case 'supervisor':
        return <UserCheck size={16} color={colors.secondary} />;
      case 'lider':
        return <Users size={16} color={colors.accent} />;
      default:
        return <User size={16} color={colors.tabIconDefault} />;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUser.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          { backgroundColor: colors.card },
          isOwnMessage && styles.ownMessage,
        ]}
        onPress={() => !item.read && markAsRead(item.id)}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            {getRoleIcon(item.senderRole)}
            <Text style={[styles.senderName, { color: colors.text }]}>
              {item.senderName}
            </Text>
            <View style={[styles.recipientBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.recipientText, { color: colors.primary }]}>
                Para: {getRecipientLabel(item)}
              </Text>
            </View>
          </View>
          <View style={styles.messageStatus}>
            {item.read ? (
              <CheckCheck size={16} color={colors.success} />
            ) : (
              <Check size={16} color={colors.tabIconDefault} />
            )}
          </View>
        </View>
        
        <Text style={[styles.messageContent, { color: colors.text }]}>
          {item.content}
        </Text>
        
        <View style={styles.messageFooter}>
          <Clock size={12} color={colors.tabIconDefault} />
          <Text style={[styles.timestamp, { color: colors.tabIconDefault }]}>
            {new Date(item.timestamp).toLocaleString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Mensajes" 
        subtitle={`${ROLE_LABELS[currentUser.role]} • ${filteredMessages.filter(m => !m.read).length} sin leer`}
        rightActions={
          permissions.canSend ? (
            <TouchableOpacity
              style={styles.composeButton}
              onPress={() => setShowComposeModal(true)}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={filteredMessages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquare size={48} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              No hay mensajes
            </Text>
          </View>
        }
      />

      {/* Modal de Composición */}
      <Modal
        visible={showComposeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComposeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceLight }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Nuevo Mensaje
              </Text>
              <TouchableOpacity onPress={() => setShowComposeModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.recipientSection}>
              <Text style={[styles.label, { color: colors.text }]}>Enviar a:</Text>
              <TouchableOpacity
                style={[styles.recipientSelector, { backgroundColor: colors.card }]}
                onPress={() => {
                  console.log('Abriendo modal de destinatarios');
                  setShowRecipientModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.recipientSelectorContent}>
                  {selectedRecipientType === 'all' && <Users size={18} color={colors.primary} />}
                  {selectedRecipientType === 'role' && getRoleIcon(selectedRole)}
                  {selectedRecipientType === 'group' && <Users size={18} color={colors.secondary} />}
                  {selectedRecipientType === 'individual' && <User size={18} color={colors.accent} />}
                  <Text style={[styles.recipientSelectorText, { color: colors.text }]}>
                    {selectedRecipientType === 'all' 
                      ? 'Todos los miembros'
                      : selectedRecipientType === 'role'
                      ? `Todos los ${ROLE_LABELS[selectedRole]}s`
                      : selectedRecipientType === 'group'
                      ? 'Mi Grupo de Discipulado'
                      : selectedRecipientType === 'individual'
                      ? 'Persona específica'
                      : 'Seleccionar destinatario'}
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.tabIconDefault} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.messageInput, { 
                backgroundColor: colors.card,
                color: colors.text,
              }]}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={colors.tabIconDefault}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={sendMessage}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Enviar Mensaje</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Selección de Destinatario */}
      <Modal
        visible={showRecipientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecipientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowRecipientModal(false)}
          />
          <View style={[styles.recipientModal, { backgroundColor: colors.surfaceLight }]}>
            <View style={styles.recipientModalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Seleccionar Destinatario
              </Text>
              <TouchableOpacity 
                onPress={() => setShowRecipientModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {permissions.canSendToAll && (
                <TouchableOpacity
                  style={[
                    styles.recipientOption, 
                    { backgroundColor: colors.card },
                    selectedRecipientType === 'all' && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => {
                    console.log('Seleccionando: Todos');
                    setSelectedRecipientType('all');
                    setShowRecipientModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Users size={20} color={colors.primary} />
                  <Text style={[styles.recipientOptionText, { color: colors.text }]}>
                    Todos los miembros
                  </Text>
                  {selectedRecipientType === 'all' && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}

              <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>
                Por Rol
              </Text>

              {permissions.availableRoles.length > 0 ? (
                <>
                  {permissions.availableRoles.map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.recipientOption, 
                        { backgroundColor: colors.card },
                        selectedRecipientType === 'role' && selectedRole === role && { 
                          borderColor: colors.primary, 
                          borderWidth: 2 
                        }
                      ]}
                      onPress={() => {
                        console.log('Seleccionando rol:', role);
                        setSelectedRecipientType('role');
                        setSelectedRole(role);
                        setShowRecipientModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      {getRoleIcon(role)}
                      <Text style={[styles.recipientOptionText, { color: colors.text }]}>
                        Todos los {ROLE_LABELS[role]}s
                      </Text>
                      {selectedRecipientType === 'role' && selectedRole === role && (
                        <Check size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <Text style={[styles.noOptionsText, { color: colors.tabIconDefault }]}>
                  No tienes permisos para enviar mensajes a otros roles
                </Text>
              )}

              <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>
                Otros
              </Text>

              <TouchableOpacity
                style={[
                  styles.recipientOption, 
                  { backgroundColor: colors.card },
                  selectedRecipientType === 'group' && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  console.log('Seleccionando: Grupo');
                  setSelectedRecipientType('group');
                  setShowRecipientModal(false);
                }}
                activeOpacity={0.7}
              >
                <Users size={20} color={colors.secondary} />
                <Text style={[styles.recipientOptionText, { color: colors.text }]}>
                  Mi Grupo de Discipulado
                </Text>
                {selectedRecipientType === 'group' && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.recipientOption, 
                  { backgroundColor: colors.card },
                  selectedRecipientType === 'individual' && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  console.log('Seleccionando: Individual');
                  setSelectedRecipientType('individual');
                  setShowRecipientModal(false);
                  Alert.alert('Próximamente', 'La función de mensajes individuales estará disponible pronto');
                }}
                activeOpacity={0.7}
              >
                <User size={20} color={colors.accent} />
                <Text style={[styles.recipientOptionText, { color: colors.text }]}>
                  Persona específica
                </Text>
                {selectedRecipientType === 'individual' && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
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

  composeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 20,
  },
  messageCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  ownMessage: {
    borderWidth: 1,
    borderColor: '#00000010',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  recipientBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  recipientText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  messageStatus: {
    marginLeft: 8,
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
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
    fontWeight: 'bold' as const,
  },
  recipientSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  recipientSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  recipientSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientSelectorText: {
    fontSize: 16,
    marginLeft: 8,
  },
  messageInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  recipientModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
    width: '100%',
  },
  recipientModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  noOptionsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  recipientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  recipientOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});