
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
    const gdate = ReservationDate;
    gdate.setHours(gdate.getHours()-1);
    ReservationDate;
    const date = new Date(ReservationDate);

    console.log('date',date)
    console.log('ReservationDate',ReservationDate)
    console.log('localDate',date)
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reservation in hour',
        body: `Don''t forget about your reservation at ${date}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date
        },
    });
}

    