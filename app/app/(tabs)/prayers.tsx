import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Volume2, MapPin, Play } from 'lucide-react-native';
import { usePrayerStore } from '@/stores/prayerStore';
import * as Notifications from "expo-notifications";
// If praytime.js uses module.exports = PrayTimes, keep as default import.
// If praytime.js uses export = PrayTimes or export default PrayTimes, this is correct.
// If praytime.js uses export { PrayTimes }, use:
// import { PrayTimes } from "../../utils/praytime.js";
import PrayerTimeCard from '@/components/PrayerTimeCard';
import CountdownTimer from '@/components/CountdownTimer';
import { Audio } from 'expo-av';
import { useToast } from '../providers/ToastProvider';

export default function PrayersScreen() {
    
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [azaanEnabled, setAzaanEnabled] = useState(true);
  const { prayerTimes, fetchPrayerTimes, nextPrayer } = usePrayerStore();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    console.log(prayerTimes, "prayerTimes");
    
    fetchPrayerTimes();
  }, []);
  useEffect(() => {
    (async () => {
      // Optional: allow audio even when the phone is on silent
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound: s } = await Audio.Sound.createAsync(
        require('../../assets/audio/azaan-android.mp3') // <-- path to your mp3
      );
      sound.current = s;
      // Re-enable button when the track finishes
      sound.current.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    })();
    // Unload on unmount
    return () => {
      sound.current?.unloadAsync();
    };
  }, []);

  const playAzaan = async () => {
    if (!sound.current) return;
    try {
      await sound.current.replayAsync(); // replay from beginning every time
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleTestAzaan = () => {
    playAzaan();
  };
  


  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 55 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Prayer Times</Text>
          <Text style={styles.date}>{todayDate}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#A7F3D0" />
            <Text style={styles.location}>Asia, Kolkata</Text>
          </View>
        </View>

        {nextPrayer && (
          <View style={styles.nextPrayerContainer}>
            <Text style={styles.nextPrayerTitle}>Next Prayer</Text>
            {/* <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text> */}
            <CountdownTimer
              //   targetTime={nextPrayer.time}
              timeTable={
                prayerTimes
                //     [
                //     // ...prayerTimes,
                //     { arabic: "العصر", name: "Asr", time: "16:24" },

                //     { arabic: "Asd", name: "magrib", time: "16:25" },
                //     { arabic: "asdasd", name: "Isha", time: "16:26" },
                //   ]
              }
            //   onTimeReached={handlePrayerTimeReached}
            />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#059669" />
                <Text style={styles.settingLabel}>Prayer Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
                thumbColor={notificationsEnabled ? "#059669" : "#6B7280"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Volume2 size={20} color="#059669" />
                <Text style={styles.settingLabel}>Azaan Sound</Text>
              </View>
              <Switch
                value={azaanEnabled}
                onValueChange={setAzaanEnabled}
                trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
                thumbColor={azaanEnabled ? "#059669" : "#6B7280"}
              />
            </View>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestAzaan}
              disabled={isPlaying}
            >
              {/* <Play size={16} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test Azaan</Text> */}

              {isPlaying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Play size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.testButtonText}>Play Azaan</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

          <View style={styles.prayerTimesContainer}>
            {prayerTimes.map((prayer, index) => (
              <PrayerTimeCard
                key={prayer.name}
                prayer={prayer}
                isNext={nextPrayer?.name === prayer.name}
                style={
                  index !== prayerTimes.length - 1
                    ? styles.prayerCardMargin
                    : null
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 16,
  },
  header: {
    backgroundColor: "#059669",
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#A7F3D0",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: "#A7F3D0",
  },
  nextPrayerContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: -10,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  nextPrayerTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 16,
  },
  content: {
    padding: 20,
  },
  settingsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  prayerTimesContainer: {
    gap: 12,
  },
  prayerCardMargin: {
    marginBottom: 12,
  },
});