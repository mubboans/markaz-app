import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotifeeService {
    async requestPermission() {
        await notifee.requestPermission();
    }

    async createChannel() {
        if (Platform.OS === 'android') {
            await notifee.createChannel({
                id: 'prayer',
                name: 'Prayer Notifications',
                sound: 'azaan', // This looks for 'azaan.wav' or 'azaan.mp3' in res/raw
                importance: AndroidImportance.HIGH,
                visibility: AndroidVisibility.PUBLIC,
                vibration: true,
                lights: true,
            });
            console.log('✅ Notifee Prayer Channel Created');
        }
    }

    async displayNotification(title: string, body: string, data: any = {}) {
        try {
            await notifee.displayNotification({
                title,
                body,
                data,
                android: {
                    channelId: 'prayer',
                    sound: 'azaan',
                    smallIcon: 'ic_launcher', // Make sure this icon exists or use default
                    pressAction: {
                        id: 'default',
                    },
                    importance: AndroidImportance.HIGH,
                },
                ios: {
                    sound: 'azaan.wav',
                    foregroundPresentationOptions: {
                        badge: true,
                        sound: true,
                        banner: true,
                        list: true,
                    },
                },
            });
        } catch (error) {
            console.error('Failed to display Notifee notification:', error);
        }
    }
}

export const notifeeService = new NotifeeService();
