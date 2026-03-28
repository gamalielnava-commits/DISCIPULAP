import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Notification } from '@/types/auth';

export function useBirthdayNotifications() {
  useEffect(() => {
    checkBirthdays();
    const interval = setInterval(checkBirthdays, 3600000);
    return () => clearInterval(interval);
  }, []);

  const checkBirthdays = async () => {
    try {
      const usersData = await AsyncStorage.getItem('users');
      if (!usersData || usersData === 'null' || usersData === 'undefined') {
        return;
      }

      const users: User[] = JSON.parse(usersData);
      const today = new Date();
      const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

      const birthdayUsers = users.filter(user => {
        if (!user.fechaNacimiento) return false;
        const parts = user.fechaNacimiento.split('/');
        if (parts.length !== 3) return false;
        const userBirthdayStr = `${parts[0]}/${parts[1]}`;
        return userBirthdayStr === todayStr;
      });

      if (birthdayUsers.length === 0) return;

      const notificationsData = await AsyncStorage.getItem('notifications');
      let notifications: Notification[] = [];
      
      if (notificationsData && notificationsData !== 'null' && notificationsData !== 'undefined') {
        try {
          notifications = JSON.parse(notificationsData);
          if (!Array.isArray(notifications)) {
            notifications = [];
          }
        } catch (e) {
          notifications = [];
        }
      }

      const existingBirthdayIds = new Set(
        notifications
          .filter(n => n.tipo === 'cumpleanos')
          .map(n => n.userId)
      );

      const newNotifications: Notification[] = [];

      for (const user of birthdayUsers) {
        if (!existingBirthdayIds.has(user.id)) {
          const notification: Notification = {
            id: `birthday-${user.id}-${Date.now()}`,
            tipo: 'cumpleanos',
            titulo: '¡Cumpleaños hoy!',
            mensaje: `Hoy es el cumpleaños de ${user.nombre} ${user.apellido}. ¡No olvides felicitarlo!`,
            userId: user.id,
            userName: `${user.nombre} ${user.apellido}`,
            userEmail: user.email,
            leida: false,
            fecha: new Date(),
            accion: {
              tipo: 'felicitar',
              userId: user.id,
            },
          };
          newNotifications.push(notification);
        }
      }

      if (newNotifications.length > 0) {
        const updatedNotifications = [...notifications, ...newNotifications];
        await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        console.log(`Se crearon ${newNotifications.length} notificaciones de cumpleaños`);
      }
    } catch (error) {
      console.error('Error checking birthdays:', error);
    }
  };
}
