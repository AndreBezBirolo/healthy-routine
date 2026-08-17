import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração de apresentação das notificações em primeiro plano (compatível SDK 54)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Solicita permissão e agenda lembretes de rotina do casal
  requestPermissions: async () => {
    if (Platform.OS === 'web') return false;

    try {
      const settings: any = await Notifications.getPermissionsAsync();
      let granted = settings.granted || settings.status === 'granted';

      if (!granted) {
        const requested: any = await Notifications.requestPermissionsAsync();
        granted = requested.granted || requested.status === 'granted';
      }

      return !!granted;
    } catch (err) {
      console.warn('Notifications permission error', err);
      return false;
    }
  },

  // Disparo de notificação local para eventos do casal
  sendLocalNotification: async (title: string, body: string) => {
    if (Platform.OS === 'web') {
      console.log(`[Notification Web]: ${title} - ${body}`);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Dispara imediatamente
    });
  },

  // Lembrete inteligente de sexta-feira para quebrar a rotina
  scheduleWeekendReminder: async () => {
    if (Platform.OS === 'web') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎲 Sextou! Que tal quebrar a rotina?',
        body: 'Abram o Healthy Routine e girem a roleta para escolher o jantar especial do final de semana!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 6, // Sexta-feira
        hour: 17,
        minute: 0,
      },
    });
  },
};
