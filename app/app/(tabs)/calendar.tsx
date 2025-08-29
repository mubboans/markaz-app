import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react-native';
import { useHijriStore } from '@/stores/hijriStore';
import { useAuthStore } from '@/stores/authStore';
import HijriDatePicker from '@/components/HijriDatePicker';

export default function CalendarScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { hijriDate, gregorianDate, fetchHijriDate } = useHijriStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const canEditDate = user?.role === 'admin' || user?.role === 'mosque_admin';

  useEffect(() => {
    fetchHijriDate();
  }, []);

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  return (
    <SafeAreaView
      style={[styles.container, , { paddingBottom: insets.bottom + 55 }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Islamic Calendar</Text>
          <Text style={styles.subtitle}>Hijri Calendar System</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.dateCard}>
            <View style={styles.dateHeader}>
              <Calendar size={24} color="#059669" />
              <Text style={styles.dateTitle}>Current Date </Text>
            </View>
            <View style={styles.gregorianDate}>
              <Text style={styles.gregorianText}>
                Please Note this date migth not be correct
              </Text>
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.hijriDate}>
                <Text style={styles.hijriDay}>{hijriDate.day}</Text>
                <Text style={styles.hijriMonth}>
                  {islamicMonths[hijriDate.month - 1]}
                </Text>
                <Text style={styles.hijriYear}>{hijriDate.year} AH</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.gregorianDate}>
                <Text style={styles.gregorianText}>
                  {gregorianDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.monthGrid}>
            <Text style={styles.sectionTitle}>Islamic Months</Text>
            <View style={styles.monthsContainer}>
              {islamicMonths.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthCard,
                    hijriDate.month === index + 1 && styles.currentMonth,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthNumber,
                      hijriDate.month === index + 1 && styles.currentMonthText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.monthName,
                      hijriDate.month === index + 1 && styles.currentMonthText,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {canEditDate && (
            <View style={styles.adminNote}>
              <Text style={styles.adminNoteText}>
                As an admin, you can adjust the Hijri date to ensure accuracy
                according to local moon sighting.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <HijriDatePicker
          currentDate={hijriDate}
          onDateChange={(newDate) => {
            // updateHijriDate(newDate);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#93C5FD',
  },
  content: {
    padding: 20,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
    alignSelf:'center'
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  hijriDate: {
    alignItems: 'center',
    marginBottom: 20,
  },
  hijriDay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#059669',
  },
  hijriMonth: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  hijriYear: {
    fontSize: 16,
    color: '#6B7280',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#D1D5DB',
    marginBottom: 20,
  },
  gregorianDate: {
    alignItems: 'center',
  },
  gregorianText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  monthGrid: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  monthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentMonth: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  monthNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  monthName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  currentMonthText: {
    color: '#FFFFFF',
  },
  adminNote: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  adminNoteText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
});