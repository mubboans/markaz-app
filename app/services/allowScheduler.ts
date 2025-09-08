import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function allowAlarms() {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('prayer', {
            name: 'Prayer Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'azaan.mp3', // file inside assets → app.json
            vibrationPattern: [0, 500, 200, 500],
            bypassDnd: true, // even in DND
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
    }
    return true;
}