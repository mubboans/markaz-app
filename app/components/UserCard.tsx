import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Shield, Mail, Building } from 'lucide-react-native';
import { User as UserType } from '@/stores/authStore';

interface UserCardProps {
  user: UserType;
  onPress?: () => void;
}

export default function UserCard({ user, onPress }: UserCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#EF4444';
      case 'mosque_admin':
        return '#F59E0B';
      default:
        return '#059669';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Super Admin';
      case 'mosque_admin':
        return 'Mosque Admin';
      default:
        return 'User';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <User size={24} color="#FFFFFF" />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.emailContainer}>
          <Mail size={14} color="#6B7280" />
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        
        <View style={styles.roleContainer}>
          <Shield size={12} color={getRoleColor(user.role)} />
          <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
            {getRoleLabel(user.role)}
          </Text>
        </View>
        
        {user.mosqueId && (
          <View style={styles.mosqueContainer}>
            <Building size={12} color="#6B7280" />
            <Text style={styles.mosqueText}>Mosque ID: {user.mosqueId}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mosqueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mosqueText: {
    fontSize: 12,
    color: '#6B7280',
  },
});