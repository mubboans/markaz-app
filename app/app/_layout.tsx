// _layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider } from "./providers/ToastProvider";
import { Text, View, AppState, Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { getPrayerTimes } from "@/services/prayerService";
import { bootstrapPrayers } from "@/services/dailyScheduler";
import { setSelfReschedulingAlarm } from "@/services/reshedulerService";
import { installRescheduleListener } from "@/services/rescheduleListener";
import { allowAlarms, setPrayerAlarms } from "@/services/prayerAlarms";
import { installPrayerListener, registerBackgroundAlarmUpdate } from "@/services/prayerBackground";
import { azaanService } from "@/services/azaanService";
import { useAzaan } from "@/hooks/useAzaan";
//   const todayTimes = {
//     fajr: "05:06",
//     dhuhr: "12:41",
//     asr: "16:25",
//     maghrib: "20:28",
//     isha: "20:29",
//   };
const scheduleAlarms = async () => {
    try {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }
        
        // Set up alarms
        const ok = await allowAlarms();
        if (!ok) return;
        
        // Get prayer times and schedule alarms
        const today = getPrayerTimes(new Date());
        await setPrayerAlarms(today); // today + 00:05 tomorrow
        
        // Install prayer listener for rescheduling
        installPrayerListener(); // listener for 00:05
        
        // Register background tasks for daily updates
        await registerBackgroundAlarmUpdate();
        
        // Initialize Azaan service
        await azaanService.initialize();
        
        // Schedule Azaan for each prayer time
        Object.entries(today).forEach(([name, time]) => {
            if (!['sunrise', 'midnight'].includes(name)) {
                // Format the prayer name for display
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                azaanService.scheduleAzaan(formattedName, time.toString());
            }
        });
        
        console.log('Prayer alarms and Azaan scheduled successfully');
    } catch (error) {
        console.log("Error scheduling alarms:", error);
    }
};

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, isLoading } = useAuthStore(); // <- expose `isLoading`

  /* register background task once and handle app state changes */
  useEffect(() => {
    console.log("Registering background task and notification handlers...");  
    scheduleAlarms();
    
    // Setup notification listeners for different scenarios
    
    // 1. Foreground notification listener - plays Azaan when app is open
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification received:', notification.request.identifier);
      // Check if this is a prayer notification
      if (notification.request.content.data?.prayer) {
        // Play Azaan sound when prayer notification is received
        azaanService.playAzaan();
      }
    });
    
    // 2. Response listener - handles when user taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response.notification.request.identifier);
      if (response.notification.request.content.data?.prayer) {
        // User tapped on prayer notification
        azaanService.playAzaan();
      }
    });
    
    // 3. App state change listener - reschedules notifications when app comes to foreground
     const appStateSubscription = AppState.addEventListener('change', nextAppState => {
       if (nextAppState === 'active') {
         console.log('App has come to the foreground!');
         // Refresh prayer times and reschedule if needed
         const today = getPrayerTimes(new Date());
         setPrayerAlarms(today);
         
         // Re-initialize Azaan service if needed
         azaanService.initialize();
         
         // Ensure background tasks are registered
         registerBackgroundAlarmUpdate().catch(error => {
           console.warn('Failed to register background alarm update:', error);
         });
       }
     });
    
    return () => {
      // Clean up all listeners
      foregroundSubscription.remove();
      responseSubscription.remove();
      appStateSubscription.remove();
      
      // Clean up Azaan service
      azaanService.cleanup();
    };
  }, []);

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
