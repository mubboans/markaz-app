import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import 'expo-router/entry';

// Register background handler for Firebase Messaging
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);

    // Display the notification using Notifee
    // This ensures the custom sound plays even when the app is killed
    await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        data: remoteMessage.data,
        android: {
            channelId: 'prayer',
            sound: 'azaan',
            pressAction: {
                id: 'default',
            },
        },
        ios: {
            sound: 'azaan.wav',
        },
    });
});

// Register background event handler for Notifee
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    console.log('Notifee background event', type, detail);

    if (type === EventType.ACTION_PRESS && pressAction.id === 'default') {
        console.log('User pressed notification in background');
    }
});
