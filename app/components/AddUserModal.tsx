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
import { X, User, Mail, Shield } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { User as UserType } from '@/stores/authStore';

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddUserModal({ visible, onClose }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as UserType['role'],
    mosqueId: '',
  });

  const { addUser } = useUserStore();

  const roles = [
    { value: 'user', label: 'Regular User', color: '#059669' },
    { value: 'mosque_admin', label: 'Mosque Admin', color: '#F59E0B' },
    { value: 'admin', label: 'Super Admin', color: '#EF4444' },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const userData: Omit<UserType, 'id'> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        mosqueId: formData.mosqueId || undefined,
      };

      await addUser(userData);
      Alert.alert('Success', 'User added successfully');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'user',
        mosqueId: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
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
          <Text style={styles.title}>Add New User</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="user@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Role *</Text>
            <View style={styles.roleContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    formData.role === role.value && styles.selectedRole,
                    formData.role === role.value && { borderColor: role.color },
                  ]}
                  onPress={() => setFormData({ ...formData, role: role.value })}
                >
                  <Shield 
                    size={16} 
                    color={formData.role === role.value ? role.color : '#6B7280'} 
                  />
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === role.value && { color: role.color },
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.role === 'mosque_admin' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mosque ID</Text>
              <TextInput
                style={styles.input}
                value={formData.mosqueId}
                onChangeText={(text) => setFormData({ ...formData, mosqueId: text })}
                placeholder="Enter mosque ID"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helpText}>
                Leave empty to assign later
              </Text>
            </View>
          )}

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              New users will receive an email with login instructions.
            </Text>
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
    backgroundColor: '#7C3AED',
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
  inputGroup: {
    marginBottom: 24,
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
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  roleContainer: {
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  selectedRole: {
    borderWidth: 2,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  noteContainer: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  noteText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
});