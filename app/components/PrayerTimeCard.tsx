import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { PrayerTime } from '@/stores/prayerStore';

interface PrayerTimeCardProps {
  prayer: PrayerTime;
  isNext: boolean;
  style?: any;
}

export default function PrayerTimeCard({ prayer, isNext, style }: PrayerTimeCardProps) {
  const scale = useSharedValue(isNext ? 1.02 : 1);
  
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scale.value,
      [1, 1.02],
      ['#FFFFFF', '#F0FDF4']
    );
    
    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  React.useEffect(() => {
    // Animate the scale when isNext changes
    scale.value = withSpring(isNext ? 1.02 : 1, { damping: 15 });
  }, [isNext, prayer.name]);

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View style={styles.content}>
        <View style={styles.prayerInfo}>
          <Text style={[styles.prayerName, isNext && styles.nextPrayerName]}>
            {prayer.name}
          </Text>
          <Text style={styles.arabicName}>{prayer.arabic}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={[styles.time, isNext && styles.nextPrayerTime]}>
            {prayer.time}
          </Text>
          {isNext && <View style={styles.nextIndicator} />}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  nextPrayerName: {
    color: '#059669',
    fontWeight: '700',
  },
  arabicName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timeContainer: {
    alignItems: 'flex-end',
    position: 'relative',
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  nextPrayerTime: {
    color: '#059669',
    fontSize: 20,
  },
  nextIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    position: 'absolute',
    top: -2,
    right: -2,
  },
});