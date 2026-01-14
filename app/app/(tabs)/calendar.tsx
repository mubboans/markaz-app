import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Moon } from 'lucide-react-native';
import moment from 'moment-hijri';

interface CalendarDay {
  gregorianDate: Date;
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const gregorianMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for the first day (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay();

    // Calculate days from previous month to show
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = startingDayOfWeek;

    // Calculate days from next month to show
    const daysInMonth = lastDay.getDate();
    const totalCells = Math.ceil((prevMonthDays + daysInMonth) / 7) * 7;
    const nextMonthDays = totalCells - (prevMonthDays + daysInMonth);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const hijriMoment = moment(date).subtract(1, 'days'); // Adjust for Mumbai
      const hijriDate = hijriMoment.format('iD/iM/iYYYY');
      const [hijriDay, hijriMonth, hijriYear] = hijriDate.split('/').map(Number);
      days.push({
        gregorianDate: date,
        hijriDay,
        hijriMonth,
        hijriYear,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const hijriMoment = moment(date).subtract(1, 'days'); // Adjust for Mumbai
      const hijriDate = hijriMoment.format('iD/iM/iYYYY');
      const [hijriDay, hijriMonth, hijriYear] = hijriDate.split('/').map(Number);
      days.push({
        gregorianDate: date,
        hijriDay,
        hijriMonth,
        hijriYear,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
      });
    }

    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      const hijriMoment = moment(date).subtract(1, 'days'); // Adjust for Mumbai
      const hijriDate = hijriMoment.format('iD/iM/iYYYY');
      const [hijriDay, hijriMonth, hijriYear] = hijriDate.split('/').map(Number);
      days.push({
        gregorianDate: date,
        hijriDay,
        hijriMonth,
        hijriYear,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
      });
    }

    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  // Get current Hijri month for display
  const currentHijriMoment = moment(currentDate).subtract(1, 'days');
  const currentHijriFormatted = currentHijriMoment.format('iM/iYYYY');
  const [currentHijriMonthNum, currentHijriYear] = currentHijriFormatted.split('/').map(Number);
  const currentHijriMonth = islamicMonths[currentHijriMonthNum - 1];

  // Helper to determine events/holidays
  const getEventDetails = (day: CalendarDay) => {
    const events = [];

    // Jumu'ah check (Friday)
    if (day.gregorianDate.getDay() === 5) {
      events.push({ title: "Jumu'ah", type: 'islamic', color: '#059669' });
    }

    // Example Static Holidays (Indian Context)
    const d = day.gregorianDate.getDate();
    const m = day.gregorianDate.getMonth(); // 0-indexed

    // Independence Day
    if (d === 15 && m === 7) {
      events.push({ title: "Independence Day", type: 'national', color: '#F59E0B' });
    }
    // Republic Day
    if (d === 26 && m === 0) {
      events.push({ title: "Republic Day", type: 'national', color: '#F59E0B' });
    }
    // Gandhi Jayanti
    if (d === 2 && m === 9) {
      events.push({ title: "Gandhi Jayanti", type: 'national', color: '#F59E0B' });
    }

    // Islamic Holidays (Approximate based on Hijri date)
    // Ramadan Start
    if (day.hijriMonth === 9 && day.hijriDay === 1) {
      events.push({ title: "Start of Ramadan", type: 'islamic', color: '#059669' });
    }
    // Eid al-Fitr
    if (day.hijriMonth === 10 && day.hijriDay === 1) {
      events.push({ title: "Eid al-Fitr", type: 'islamic', color: '#059669' });
    }
    // Eid al-Adha
    if (day.hijriMonth === 12 && day.hijriDay === 10) {
      events.push({ title: "Eid al-Adha", type: 'islamic', color: '#059669' });
    }
    // Ashura
    if (day.hijriMonth === 1 && day.hijriDay === 10) {
      events.push({ title: "Ashura", type: 'islamic', color: '#059669' });
    }

    return events;
  };

  return (
    <SafeAreaView
      style={[styles.container, { paddingBottom: insets.bottom + 55 }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Gregorian & Islamic Dates</Text>
        </View>

        <View style={styles.content}>
          {/* Month Navigation */}
          <View style={styles.navigationCard}>
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <ChevronLeft size={24} color="#1E3A8A" />
              </TouchableOpacity>

              <View style={styles.monthInfo}>
                <Text style={styles.gregorianMonthText}>
                  {gregorianMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <Text style={styles.hijriMonthText}>
                  {currentHijriMonth} {currentHijriYear} AH
                </Text>
              </View>

              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <ChevronRight size={24} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarCard}>
            {/* Week day headers */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day) => (
                <View key={day} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar days */}
            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day.isToday && styles.todayCell,
                    selectedDay == day && styles.selectedDayCell,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleDayPress(day)}
                >
                  <View style={styles.dayCellContent}>
                    <Text
                      style={[
                        styles.gregorianDayText,
                        !day.isCurrentMonth && styles.otherMonthText,
                        day.isToday && styles.todayText,
                      ]}
                    >
                      {day.gregorianDate.getDate()}
                    </Text>
                    <Text
                      style={[
                        styles.hijriDayText,
                        !day.isCurrentMonth && styles.otherMonthHijriText,
                        day.isToday && styles.todayHijriText,
                      ]}
                    >
                      {day.hijriDay}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>Date Format</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendColorBox} />
                <Text style={styles.legendText}>Gregorian Date (Top)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColorBox, styles.legendHijriBox]} />
                <Text style={styles.legendText}>Hijri Date (Bottom)</Text>
              </View>
            </View>
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                ℹ️ Hijri dates are calculated for Indian timezone and may vary by ±1 day based on moon sighting. Top on any date for details.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedDay && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Date Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  {/* Gregorian Section */}
                  <View style={styles.dateSection}>
                    <View style={styles.sectionHeader}>
                      <CalendarIcon size={20} color="#1E3A8A" />
                      <Text style={styles.sectionHeaderText}>Gregorian Calendar</Text>
                    </View>
                    <Text style={styles.bigDateText}>
                      {selectedDay.gregorianDate.getDate()}
                    </Text>
                    <Text style={styles.fullDateText}>
                      {selectedDay.gregorianDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                      })}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Hijri Section */}
                  <View style={styles.dateSection}>
                    <View style={styles.sectionHeader}>
                      <Moon size={20} color="#059669" />
                      <Text style={[styles.sectionHeaderText, { color: '#059669' }]}>
                        Islamic Calendar
                      </Text>
                    </View>
                    <Text style={[styles.bigDateText, { color: '#059669' }]}>
                      {selectedDay.hijriDay}
                    </Text>
                    <Text style={styles.fullDateText}>
                      {islamicMonths[selectedDay.hijriMonth - 1]} {selectedDay.hijriYear} AH
                    </Text>
                  </View>

                  {/* Events/Holidays */}
                  <View style={styles.eventsContainer}>
                    {getEventDetails(selectedDay).length > 0 ? (
                      getEventDetails(selectedDay).map((event, idx) => (
                        <View key={idx} style={[styles.eventBadge, { backgroundColor: event.color + '20', borderColor: event.color }]}>
                          <Text style={[styles.eventText, { color: event.color }]}>
                            {event.title}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noEventsText}>No major holidays</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
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
    paddingBottom: 24,
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
    padding: 16,
  },
  navigationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  monthInfo: {
    alignItems: 'center',
    flex: 1,
  },
  gregorianMonthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  hijriMonthText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  todayButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 4,
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: '#DBEAFE',
  },
  selectedDayCell: {
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gregorianDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  hijriDayText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  otherMonthText: {
    color: '#D1D5DB',
  },
  otherMonthHijriText: {
    color: '#E5E7EB',
  },
  todayText: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
  todayHijriText: {
    color: '#059669',
    fontWeight: '700',
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  legendHijriBox: {
    backgroundColor: '#059669',
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
  },
  noteContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  noteText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    alignItems: 'center',
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bigDateText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 56,
  },
  fullDateText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  eventsContainer: {
    width: '100%',
    marginTop: 8,
    gap: 8,
    alignItems: 'center',
  },
  eventBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    minWidth: '60%',
    alignItems: 'center',
  },
  eventText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noEventsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});