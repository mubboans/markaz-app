import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { MapPin, Clock, Phone, Users } from 'lucide-react-native';
import { Mosque } from '@/stores/mosqueStore';

interface MosqueCardProps {
  mosque: Mosque;
  onPress?: () => void;
}

export default function MosqueCard({ mosque, onPress }: MosqueCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withSpring(1);
  };

  const currentPrayerTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const prayers = [
      { name: 'Fajr', time: mosque.prayerTimes.fajr },
      { name: 'Dhuhr', time: mosque.prayerTimes.dhuhr },
      { name: 'Asr', time: mosque.prayerTimes.asr },
      { name: 'Maghrib', time: mosque.prayerTimes.maghrib },
      { name: 'Isha', time: mosque.prayerTimes.isha },
    ];

    let nextPrayer = prayers[0];
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        nextPrayer = prayer;
        break;
      }
    }

    return nextPrayer;
  };

  const nextPrayer = currentPrayerTime();

  const truncate = (s: string, n = 20) => (s?.length > n ? s.slice(0, n) + "…" : s);


  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.mosqueName}>{truncate(mosque?.name)} </Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.location}>{mosque.location}</Text>
            </View>
          </View>
          <View style={styles.capacityBadge}>
            <Users size={12} color="#059669" />
            <Text style={styles.capacityText}>{mosque.capacity}</Text>
          </View>
        </View>

        <View style={styles.prayerContainer}>
          <View style={styles.nextPrayer}>
            <Clock size={16} color="#059669" />
            <Text style={styles.nextPrayerLabel}>Next: {nextPrayer.name}</Text>
            <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.imam}>Imam: {mosque.imam || 'Not re'}</Text>
          {mosque.phone && (
            <View style={styles.phoneContainer}>
              <Phone size={12} color="#6B7280" />
              <Text style={styles.phoneText}>{mosque.phone}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  prayerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nextPrayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  nextPrayerTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imam: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
  },
});