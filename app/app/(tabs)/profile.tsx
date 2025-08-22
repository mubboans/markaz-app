import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Shield,
  Settings,
  LogOut,
  HelpCircle,
  Mail,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
    
  };

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

  const menuItems = [
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage prayer alerts',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings coming soon'),
    },
    {
      icon: Settings,
      title: 'App Settings',
      subtitle: 'Customize your experience',
      onPress: () => Alert.alert('Coming Soon', 'App settings coming soon'),
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      onPress: () => Alert.alert('Coming Soon', 'Help center coming soon'),
    },
    {
      icon: Mail,
      title: 'Contact Us',
      subtitle: 'Send us your feedback',
      onPress: () => Alert.alert('Coming Soon', 'Contact form coming soon'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.roleContainer}>
                <Shield size={16} color={getRoleColor(user?.role || 'user')} />
                <Text style={[styles.roleText, { color: getRoleColor(user?.role || 'user') }]}>
                  {getRoleLabel(user?.role || 'user')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuIconContainer}>
                  <item.icon size={24} color="#059669" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>
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
    backgroundColor: '#059669',
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
    color: '#A7F3D0',
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});