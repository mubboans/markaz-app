import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

interface CountdownTimerProps {
  targetTime: string;   // kept for backward compatibility (ignored when timeTable is passed)
  onTimeReached: (name: string) => void;
  timeTable: {          // ← new: full list
    name: string;
    time: string;       // 12-hour or 24-hour
    arabic?: string;
  }[];
}

export default function CountdownTimer({
  timeTable,
  onTimeReached,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const pulseScale = useSharedValue(1);

  const firedRef = useRef<Set<string>>(new Set());

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  /* ---------- helpers ---------- */
  const to24 = (t: string): string => {
    const parts = t.trim().split(/\s+/);
    if (parts.length === 1) return t; // already 24h
    const [time, period] = parts;
    let [h, m] = time.split(':').map(Number);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  /* ---------- effect ---------- */
  useEffect(() => {
    if (!timeTable?.length) return;

    const tick = () => {
      const now = new Date();
      const nowHHMM = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      // find next prayer (in order of the array)
      let nextPrayer = null;
      for (const p of timeTable) {
        const targetHHMM = to24(p.time);
        if (targetHHMM > nowHHMM && !firedRef.current.has(p.name)) {
          nextPrayer = p;
          break;
        }
      }
      // all passed today → first tomorrow
      if (!nextPrayer) {
        nextPrayer = timeTable[0];
      }

      const targetHHMM = to24(nextPrayer.time);

      // exact match & not fired yet
      if (nowHHMM === targetHHMM && !firedRef.current.has(nextPrayer.name)) {
        firedRef.current.add(nextPrayer.name);
        onTimeReached(nextPrayer.name);
      }

      /* ---- countdown ---- */
      const [h, m] = targetHHMM.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);

      const diff = target.getTime() - now.getTime();
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });

      /* ---- pulse animation ---- */
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
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [timeTable, onTimeReached]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
  },
  timeLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
    marginHorizontal: 4,
  },
});