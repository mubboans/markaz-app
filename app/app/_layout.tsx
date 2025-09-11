// _layout.tsx
import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider } from "./providers/ToastProvider";
import { Text, View, AppState, Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import { getPrayerTimes } from "@/services/prayerService";
import { azaanService } from "@/services/azaanService";
import * as TaskManager from "expo-task-manager";
import { now } from "moment";
import { registerNewDayTask, scheduleBgAzaan } from "@/services/backgroundTask";
import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import * as SplashScreen from "expo-splash-screen";

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
    console.log(data, error, executionInfo, " executionInfo");
    
    if (error) {
        console.error('Background notification task error:', error);
        return;
    }
    if (data) {
        // Process the notification data here
        console.log('Background notification received:', data);
        azaanService.playAzaan();
        // You can also schedule local notifications or perform other actions
    }
});
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

const scheduleAlarms = async () => {
    try {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }
        
        
        const ok = await azaanService.allowAlarms();
        if (!ok) return;
        const today = getPrayerTimes(new Date());
        await azaanService.initialize();
        await scheduleBgAzaan();
        await registerNewDayTask();
        Object.entries(today).forEach(([name, time]) => {
            if (!['sunrise', 'midnight'].includes(name)) {
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                azaanService.scheduleAzaan(formattedName, time.toString());
            }
        });
    } catch (error) {
        console.error('Error scheduling alarms:', error);
    }
};

export default function RootLayout() {
     const [appIsReady, setAppIsReady] = useState(false);
     const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  useFrameworkReady();
  const { isLoading } = useAuthStore(); // <- expose `isLoading`
   useEffect(() => {
     scheduleAlarms();
     const foregroundSubscription =
       Notifications.addNotificationReceivedListener((notification) => {
         if (notification.request.content.data?.prayer) {
           azaanService.playAzaan();
         }
       });
    const responseSubscription =
       Notifications.addNotificationResponseReceivedListener((response) => {
         if (response.notification.request.content.data?.prayer) {
           azaanService.playAzaan();
         }
       });

     // App opened from notification (cold start)
     const checkInitialNotification = async () => {
       const response = await Notifications.getLastNotificationResponseAsync();
       if (response?.notification?.request?.content?.data?.prayer) {
         azaanService.playAzaan();
       }
     };
     checkInitialNotification();

    //  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

     return () => {
       foregroundSubscription.remove();
       responseSubscription.remove();
       azaanService.cleanup();
    //    Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
     };
   }, []);
   //splash Screen UseEffect
   useEffect(() => {
     async function prepare() {
       try {
         // Perform any app loading tasks here
         await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate loading
       } catch (e) {
         console.warn(e);
       } finally {
         setAppIsReady(true);
       }
     }
     prepare();
   }, []);
    const onLottieAnimationFinish = useCallback(() => {
      setSplashAnimationFinished(true);
    }, []);

      useEffect(() => {
        if (appIsReady && splashAnimationFinished) {
          SplashScreen.hideAsync(); // Hide native splash screen once app and animation are ready
        }
      }, [appIsReady, splashAnimationFinished]);

      if (!appIsReady || !splashAnimationFinished) {
        return (
          <AnimatedSplashScreen onAnimationFinish={onLottieAnimationFinish} />
        );
      }
  /* show loader until auth status is resolved */
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* {isAuthenticated ? ( */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* ) : (
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          )} */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </ToastProvider>
      <StatusBar style="auto" />
    </>
  );
}
