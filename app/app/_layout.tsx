// _layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider } from "./providers/ToastProvider";
import { Text, View } from "react-native";
import { getPrayerTimes } from "@/services/prayerService";

// const ADHAAN_TASK = "adhaan-task";

// /* 1️⃣  Background task definition (top-level) */
// TaskManager.defineTask(ADHAAN_TASK, async () => {
//     console.log("🔔 Adhaan task running");
    
//   const now = new Date();
//   const nowHHMM = `${now.getHours().toString().padStart(2, "0")}:${now
//     .getMinutes()
//     .toString()
//     .padStart(2, "0")}`;

//   const todayTimes = {
//     fajr: "05:06",
//     dhuhr: "12:41",
//     asr: "16:25",
//     maghrib: "20:28",
//     isha: "20:29",
//   };

//   const prayer = Object.entries(todayTimes).find(([, t]) => t === nowHHMM);
//     console.log(prayer, "prayer from background task");
//   if (prayer) {
//     await Notifications.scheduleNotificationAsync({
//       content: { title: "Prayer Time", body: prayer[0], sound: "adhaan.mp3" },
//       trigger: null,
//     });
//   }
//   return BackgroundFetch.BackgroundFetchResult.NewData;
// });

const scheduleAlarms = async () => {
    const prayerTimes = getPrayerTimes();
  await Notifications.requestPermissionsAsync();
  await Notifications.cancelAllScheduledNotificationsAsync();
  const list = [
    { name: "Fajr", time: prayerTimes?.fajr.toString() },
    { name: "Sunrise", time: prayerTimes?.sunrise.toString() },
    { name: "Dhuhr", time: prayerTimes?.dhuhr.toString() },
    { name: "Asr", time: prayerTimes?.asr.toString() },
    { name: "Maghrib", time: prayerTimes?.maghrib.toString() },
    { name: "Isha", time: prayerTimes?.isha.toString() },
    { name: "Midnight", time: prayerTimes?.midnight.toString() },
  ];

  for (const p of list) {
    const [h, m] = p.time.split(":").map(Number);
    // await Notifications.scheduleNotificationAsync({
    //   content: { title: "Prayer", body: p.name, sound: "adhaan-android.mp3" },
    //   trigger: : "daily", hour: h, minute: m, repeats: true },
    // });
  }
};

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, isLoading } = useAuthStore(); // <- expose `isLoading`

  /* register background task once */
  useEffect(() => {
    console.log("Registering background task...");  
     scheduleAlarms();
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
          {isAuthenticated ? (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="+not-found" />
        </Stack>
      </ToastProvider>
      <StatusBar style="auto" />
    </>
  );
}
