// _layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { useAuthStore } from "@/stores/authStore";
import { ToastProvider } from "./providers/ToastProvider";
import { Text, View } from "react-native";
import { getPrayerTimes } from "@/services/prayerService";
import { bootstrapPrayers } from "@/services/dailyScheduler";
import { setSelfReschedulingAlarm } from "@/services/reshedulerService";
import { installRescheduleListener } from "@/services/rescheduleListener";
import { allowAlarms, setPrayerAlarms } from "@/services/prayerAlarms";
import { installPrayerListener } from "@/services/prayerBackground";
//   const todayTimes = {
//     fajr: "05:06",
//     dhuhr: "12:41",
//     asr: "16:25",
//     maghrib: "20:28",
//     isha: "20:29",
//   };
const scheduleAlarms = async () => {
    (async () => {
        try {
        //   await bootstrapPrayers(); // today immediately
        //   setSelfReschedulingAlarm(); // 00:05 tomorrow
        //   installRescheduleListener(); // listener for self-reschedule
         (async () => {
           const ok = await allowAlarms();
           if (!ok) return;
           const today = getPrayerTimes(new Date());
           await setPrayerAlarms(today); // today + 00:05 tomorrow
           installPrayerListener(); // listener for 00:05
         })();
        } catch (error) {
            console.log("Error scheduling alarms:", error);
        }
    })();
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
