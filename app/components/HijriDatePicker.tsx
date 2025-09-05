import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
interface HijriDatePickerProps {
  currentDate: any;
  onDateChange: (date: any) => void;
  onClose: () => void;
}

export default function HijriDatePicker({ 
  currentDate, 
  onDateChange, 
  onClose 
}: HijriDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<any>(currentDate);

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  const getDaysInMonth = (month: number) => {
    // Islamic months alternate between 29 and 30 days
    // This is a simplified version - in reality it depends on moon sighting
    return month % 2 === 1 ? 30 : 29;
  };

  const adjustDay = (increment: number) => {
    const maxDays = getDaysInMonth(selectedDate.month);
    let newDay = selectedDate.day + increment;
    
    if (newDay > maxDays) newDay = 1;
    if (newDay < 1) newDay = maxDays;
    
    setSelectedDate({ ...selectedDate, day: newDay });
  };

  const adjustMonth = (increment: number) => {
    let newMonth = selectedDate.month + increment;
    let newYear = selectedDate.year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    // Adjust day if it exceeds the new month's days
    const maxDays = getDaysInMonth(newMonth);
    const newDay = Math.min(selectedDate.day, maxDays);
    
    setSelectedDate({ day: newDay, month: newMonth, year: newYear });
  };

  const adjustYear = (increment: number) => {
    const newYear = Math.max(1, selectedDate.year + increment);
    setSelectedDate({ ...selectedDate, year: newYear });
  };

  const handleSave = () => {
    onDateChange(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Adjust Hijri Date</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Check size={24} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Adjust the Islamic date to match local moon sighting or official announcements.
        </Text>

        <View style={styles.dateContainer}>
          {/* Day Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>Day</Text>
            <View style={styles.picker}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => adjustDay(-1)}
              >
                <ChevronLeft size={20} color="#059669" />
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{selectedDate.day}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => adjustDay(1)}
              >
                <ChevronRight size={20} color="#059669" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Month Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.picker}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => adjustMonth(-1)}
              >
                <ChevronLeft size={20} color="#059669" />
              </TouchableOpacity>
              <View style={styles.monthContainer}>
                <Text style={styles.pickerValue}>{selectedDate.month}</Text>
                <Text style={styles.monthName}>
                  {islamicMonths[selectedDate.month - 1]}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => adjustMonth(1)}
              >
                <ChevronRight size={20} color="#059669" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Year Picker */}
          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>Year</Text>
            <View style={styles.picker}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => adjustYear(-1)}
              >
                <ChevronLeft size={20} color="#059669" />
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{selectedDate.year} AH</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => adjustYear(1)}
              >
                <ChevronRight size={20} color="#059669" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Selected Date:</Text>
          <Text style={styles.previewDate}>
            {selectedDate.day} {islamicMonths[selectedDate.month - 1]} {selectedDate.year} AH
          </Text>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ This adjustment will affect prayer times and Islamic calendar events for all users.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  dateContainer: {
    gap: 24,
    marginBottom: 32,
  },
  pickerSection: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 20,
    minWidth: 200,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  pickerButton: {
    padding: 8,
  },
  pickerValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
    minWidth: 60,
    textAlign: 'center',
  },
  monthContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  monthName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
});