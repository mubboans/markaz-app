import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

interface CountdownTimerProps {
  timeTable: {
    name: string;
    time: string; // e.g. "05:12" or "18:45"
    arabic?: string;
  }[];
  onTimeReached?: () => void;
}

export default function CountdownTimer({ timeTable, onTimeReached }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    arabic?: string;
    time: string;
  } | null>(null);

  const pulseScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Convert HH:MM → Date for today/tomorrow
  const toDate = (time: string, addDay = 0) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (addDay) d.setDate(d.getDate() + addDay);
    return d;
  };

  const getNextPrayer = () => {
    const now = new Date();

    // Find next prayer for today
    let next = timeTable.find((p) => toDate(p.time) > now);

    // If none left (after Isha), roll to tomorrow Fajr
    if (!next) {
      next = { ...timeTable[0], time: timeTable[0].time }; // Fajr
      return { ...next, date: toDate(next.time, 1) }; // add +1 day
    }
    return { ...next, date: toDate(next.time) };
  };

  useEffect(() => {
    if (!timeTable?.length) return;

    let lastNextPrayerName = '';

    const tick = () => {
      const { name, arabic, time, date } = getNextPrayer();
      
      // Check if the next prayer has changed, which means a prayer time was reached
      if (lastNextPrayerName && lastNextPrayerName !== name && onTimeReached) {
        onTimeReached();
      }
      
      lastNextPrayerName = name;
      setNextPrayer({ name, arabic, time });

      // countdown
      const now = new Date();
      const diff = date.getTime() - now.getTime();

      // If diff is very small (less than 1 second), we've reached the prayer time
      if (diff < 1000 && diff >= 0 && onTimeReached) {
        onTimeReached();
      }

      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });

      // pulse in last 5 mins
      const minsLeft = diff / 60_000;
      if (minsLeft <= 5 && minsLeft > 0) {
        pulseScale.value = withRepeat(
          withSequence(
            withSpring(1.05, { damping: 15 }),
            withSpring(1, { damping: 15 })
          ),
          -1,
          false
        );
      } else {
        pulseScale.value = withSpring(1);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeTable, onTimeReached]);

  const formatTime = (v: number) => v.toString().padStart(2, "0");

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.infoBlock}>
        {/* <Text style={styles.nextPrayerLabel}>Next Prayer</Text> */}
        {nextPrayer && (
          <Text style={styles.nextPrayerName}>
            {nextPrayer.arabic
              ? `${nextPrayer.arabic} (${nextPrayer.name})`
              : nextPrayer.name}
          </Text>
        )}
      </View>

      <View style={styles.countdownRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatTime(timeLeft.hours)}</Text>
          <Text style={styles.timeLabel}>Hours</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatTime(timeLeft.minutes)}</Text>
          <Text style={styles.timeLabel}>Minutes</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatTime(timeLeft.seconds)}</Text>
          <Text style={styles.timeLabel}>Seconds</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12 },
  infoBlock: { alignItems: "center" },
  nextPrayerLabel: { fontSize: 12, color: "#6B7280" },
  nextPrayerName: { fontSize: 18, fontWeight: "700", color: "#059669" },
  countdownRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeBlock: { alignItems: "center", minWidth: 60 },
  timeValue: { fontSize: 24, fontWeight: "700", color: "#059669" },
  timeLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  separator: {
    fontSize: 24,
    fontWeight: "700",
    color: "#059669",
    marginHorizontal: 4,
  },
});
