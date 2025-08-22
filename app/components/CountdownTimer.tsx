import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

interface CountdownTimerProps {
  targetTime: string;
}

export default function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const pulseScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
      
      const target = new Date();
      target.setHours(targetHours, targetMinutes, 0, 0);
      
      // If target time has passed today, set it for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      
      const difference = target.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
        
        // Add pulse animation when less than 5 minutes left
        if (hours === 0 && minutes < 5) {
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
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

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