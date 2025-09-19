import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider, useToast } from "./providers/ToastProvider";
import { Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { azaanService } from "@/services/azaanService";
import * as TaskManager from "expo-task-manager";
import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { postRequest } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Keep background task at module scope (OK) */
const BACKGROUND_NOTIFICATION_TASK = "BG-TASK";
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log(data, error, executionInfo, " executionInfo");
    if (error) {
      console.error("Background notification task error:", error);
      return;
    }
    if (data) {
      console.log(data, "enter in data");
      azaanService.playAzaan();
    }
  }
);
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

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
//   toast.show("Welcome to Markaz App!");
  useEffect(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (notification.request.content.data?.prayer) {
          azaanService.playAzaan();
        }
      }
    );
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
      await scheduleAlarms();
      await registerForPushNotificationsAsync();
    };
    checkInitialNotification();

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
      azaanService.cleanup();
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

  async function registerForPushNotificationsAsync() {
    try {
        console.log(Device.isDevice, "check Device.isDevice");
        
      if (Device.isDevice) {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          "49718800-5134-4baf-8242-2707af98fdc1";
        console.log("Registering for Push Notifications...");
        
        console.log('token worked');
        
        const username =
          (Device?.deviceName || "") +
            Device?.modelName +
            Device.manufacturer || "user-device";
            await AsyncStorage.setItem("modelName", Device?.modelName || "").then(()=>console.log('modelName set'));
            await AsyncStorage.setItem("manufacturer", Device?.manufacturer || "");
            await AsyncStorage.setItem("deviceName", Device?.deviceName || "");
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        // console.log(token, "Push Notification Token");
        console.log(username, "username");
        await postRequest("api/expotoken", {
          token,
          username,
        }).then(
          () => {
            toast.show("Push Notification Token registered successfully");
          },
          (err) => {
            toast.show(
              "Error registering for Push Notifications" + err?.message
            );
          }
        );
      }
    } catch (error) {
      toast.show("Error during Push Notification registration"+ error);
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

/** Keep your original helper the same */
const scheduleAlarms = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }
    const ok = await azaanService.allowAlarms();
    if (!ok) return;

    await azaanService.initialize();
    console.log("initialize done ...");
  } catch (error) {
    console.error("Error scheduling alarms:", error);
  }
};