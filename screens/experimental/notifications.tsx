
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission not granted for notifications');
      }
    };

export const scheduleNotification = async (ReservationDate: Date) => {
    // Calculate hour before reservation
    console.log('added notification at: ',ReservationDate);
    const date = ReservationDate;
    date.setHours(date.getHours()-1);
    ReservationDate.setHours(ReservationDate.getHours()-1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reservation in hour',
        body: `Don''t forget about your reservation at ${Date}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date
        },
    });
}

    