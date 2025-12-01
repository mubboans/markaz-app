import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider, useToast } from "./providers/ToastProvider";
import { Platform, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { notificationHandler } from "@/services/notificationHandler";
import { azaanService } from "@/services/azaanService";
import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Base_Url, postRequest } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { notifeeService } from "@/services/notifeeService";


// Background notification handling is now managed by notificationHandler service

/** Export a tiny wrapper that provides Toast context */
export default function RootLayout() {
  return (
    <>
      <ToastProvider>
        <RootLayoutInner />
      </ToastProvider>
      <StatusBar style="auto" />
    </>
  );
}

/** Move all your existing logic into an inner component.
    Now we can safely call `useToast()` here. */
function RootLayoutInner() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  useFrameworkReady();
  const { isLoading } = useAuthStore();

  // ✅ useToast is now inside a component and under <ToastProvider>
  const toast = useToast();
  const scheduleAlarms = async () => {
    try {
      await azaanService.initialize();
      console.log("Azaan service initialized for direct calls");
    } catch (error) {
      console.error("Error initializing azaan service:", error);
    }
  };

  //   toast.show("Welcome to Markaz App!");
  useEffect(() => {
    // Initialize notification handling and register for push notifications
    const initializeNotifications = async () => {
      try {
        // Initialize the notification handler
        const initialized = await notificationHandler.initialize();
        if (!initialized) {
          toast.show('Failed to initialize notifications');
          return;
        }

        // Schedule alarms
        await scheduleAlarms();

        // Check for any pending notifications (cold start)
        await notificationHandler.checkLastNotification();

        // Register for push notifications
        await registerForPushNotificationsAsync();

        console.log('Notification system initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notification system:', error);
        toast.show('Error initializing notifications: ' + (error instanceof Error ? error.message : String(error)));
      }
    };

    initializeNotifications();

    return () => {
      notificationHandler.cleanup();
    };
  }, []);

  // splash Screen UseEffect (unchanged except commented out setAppIsReady in your code)
  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // setAppIsReady(true); // (you had this commented out)
      }
    }
    prepare();
  }, []);

  const onLottieAnimationFinish = useCallback(() => {
    setSplashAnimationFinished(true);
  }, []);

  useEffect(() => {
    if (appIsReady && splashAnimationFinished) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, splashAnimationFinished]);

  if (!appIsReady || !splashAnimationFinished) {
    return <AnimatedSplashScreen onAnimationFinish={onLottieAnimationFinish} />;
  }

  // ... existing imports

  async function getFCMToken() {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('FCM token:', token);
      await AsyncStorage.setItem('fcm_token', token);

      // Initialize Notifee
      await notifeeService.requestPermission();
      await notifeeService.createChannel();

      // Send token to backend
      await fetch(Base_Url + 'pushfcmtoken', {
        method: 'POST',
        body: JSON.stringify({ token: token, platform: Platform.OS }),
        headers: { 'Content-Type': 'application/json' }
      });

      // Listen for token refresh
      messaging().onTokenRefresh(async newToken => {
        await AsyncStorage.setItem('fcm_token', newToken);
        await fetch(Base_Url + 'pushfcmtoken', {
          method: 'POST',
          body: JSON.stringify({ token: newToken, platform: Platform.OS }),
          headers: { 'Content-Type': 'application/json' }
        });
      });

      // Handle foreground messages
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived!', remoteMessage);
        await notifeeService.displayNotification(
          remoteMessage.notification?.title || 'New Notification',
          remoteMessage.notification?.body || 'You have a new message',
          remoteMessage.data
        );
      });

      return () => unsubscribe();
    } catch (error) {
      toast.show("Error getting FCM token: " + error);
      console.error("Error getting FCM token:", error);
    }
  }

  async function registerForPushNotificationsAsync() {
    try {
      if (Device.isDevice) {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          "49718800-5134-4baf-8242-2707af98fdc1";
        const username =
          (Device?.deviceName || "") +
          Device?.modelName +
          Device.manufacturer || "user-device";
        await AsyncStorage.setItem("modelName", Device?.modelName || "").then(() => console.log('modelName set'));
        await AsyncStorage.setItem("manufacturer", Device?.manufacturer || "");
        await AsyncStorage.setItem("deviceName", Device?.deviceName || "");
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

        try {
          await postRequest("api/expotoken", {
            token,
            username,
          });
          toast.show("Push Notification Token registered successfully");
        } catch (err: any) {
          // Don't show error toast if it's just a network error (server not running)
          if (err?.code !== 'ERR_NETWORK' && err?.code !== 'ECONNABORTED') {
            toast.show("Error registering for Push Notifications: " + (err?.message || 'Unknown error'));
          }
          console.warn("Push token registration failed - server may not be running");
        }
      }

      await getFCMToken();
    } catch (error) {
      toast.show("Error during Push Notification registration" + error);
      console.log(error, "Push Notification Error");
    } finally {
      setAppIsReady(true);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}