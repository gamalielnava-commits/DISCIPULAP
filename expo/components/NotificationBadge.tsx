import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Bell, X, UserPlus, Cake, Info } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { Notification } from '@/types/auth';

export default function NotificationBadge() {
  const { user, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored && stored !== 'null' && stored !== 'undefined') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
          setUnreadCount(parsed.filter(n => !n.leida).length);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, leida: true } : n
      );
      setNotifications(updated);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updated = notifications.map(n => ({ ...n, leida: true }));
      setNotifications(updated);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'registro':
        return <UserPlus size={20} color={colors.primary} />;
      case 'cumpleanos':
        return <Cake size={20} color={colors.warning} />;
      default:
        return <Info size={20} color={colors.info} />;
    }
  };

  const formatDate = (fecha: Date) => {
    const date = new Date(fecha);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  };

  if (user?.role !== 'admin') return null;

  return (
    <>
      <TouchableOpacity
        style={styles.bellContainer}
        onPress={() => setModalVisible(true)}
      >
        <Bell size={24} color={colors.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Notificaciones
              </Text>
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                    <Text style={[styles.markAllText, { color: colors.primary }]}>
                      Marcar todas
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Bell size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No tienes notificaciones
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      { backgroundColor: notification.leida ? 'transparent' : colors.primary + '10' },
                    ]}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <View style={styles.notificationIcon}>
                      {getIcon(notification.tipo)}
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationTitle, { color: colors.text }]}>
                        {notification.titulo}
                      </Text>
                      <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                        {notification.mensaje}
                      </Text>
                      <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
                        {formatDate(notification.fecha)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteNotification(notification.id)}
                      style={styles.deleteButton}
                    >
                      <X size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  notificationsList: {
    maxHeight: 500,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 15,
  },
  emptyText: {
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
});
