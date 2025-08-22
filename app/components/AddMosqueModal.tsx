import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MapPin, Clock, User, Building } from 'lucide-react-native';
import { useMosqueStore, Mosque } from '@/stores/mosqueStore';

interface AddMosqueModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddMosqueModal({ visible, onClose }: AddMosqueModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    imam: '',
    capacity: '',
    latitude: '',
    longitude: '',
    prayerTimes: {
      fajr: '05:30',
      sunrise: '06:45',
      dhuhr: '12:15',
      asr: '15:30',
      maghrib: '18:45',
      isha: '20:00',
    },
  });

  const { addMosque } = useMosqueStore();

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.imam) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const mosqueData: Omit<Mosque, 'id'> = {
        name: formData.name,
        location: formData.location,
        coordinates: {
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
        },
        address: formData.address,
        phone: formData.phone,
        imam: formData.imam,
        capacity: parseInt(formData.capacity) || 100,
        prayerTimes: formData.prayerTimes,
        announcements: [],
      };

      await addMosque(mosqueData);
      Alert.alert('Success', 'Mosque added successfully');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        address: '',
        phone: '',
        imam: '',
        capacity: '',
        latitude: '',
        longitude: '',
        prayerTimes: {
          fajr: '05:30',
          sunrise: '06:45',
          dhuhr: '12:15',
          asr: '15:30',
          maghrib: '18:45',
          isha: '20:00',
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add mosque');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Mosque</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mosque Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter mosque name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="e.g., Downtown Manhattan"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Address</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter complete address"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  placeholder="40.7128"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  placeholder="-74.0060"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact & Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Imam Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.imam}
                onChangeText={(text) => setFormData({ ...formData, imam: text })}
                placeholder="Enter imam's name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Capacity</Text>
                <TextInput
                  style={styles.input}
                  value={formData.capacity}
                  onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                  placeholder="500"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Times</Text>
            
            {Object.entries(formData.prayerTimes).map(([prayer, time]) => (
              <View key={prayer} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                </Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={(text) => 
                    setFormData({
                      ...formData,
                      prayerTimes: { ...formData.prayerTimes, [prayer]: text }
                    })
                  }
                  placeholder="HH:MM"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
});