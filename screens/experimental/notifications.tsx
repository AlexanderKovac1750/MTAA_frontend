
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission not granted for notifications');
      }
    };

export const scheduleNotification = async () => {
    // Calculate 2 minutes from now
    console.log('added notification');
    const date = new Date(Date.now());
    date.setSeconds(date.getSeconds()+50);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Scheduled Notification',
        body: 'BB This notification was triggered 2 minutes from now-d-!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date
        },
    });
}

    