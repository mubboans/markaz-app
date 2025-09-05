import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Plus, Shield, UserCheck, Building } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useMosqueStore } from '@/stores/mosqueStore';
import UserCard from '@/components/UserCard';
import AddUserModal from '@/components/AddUserModal';

export default function AdminScreen() {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'users' | 'mosques'>('users');
  const { user } = useAuthStore();
  const { users, fetchUsers } = useUserStore();
  const { mosques, fetchMosques } = useMosqueStore();

  const isAdmin = user?.role === 'admin';
  const isMosqueAdmin = user?.role === 'mosque_admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchMosques();
    }
  }, [isAdmin]);

  if (!isAdmin && !isMosqueAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Shield size={48} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access this section.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      color: '#059669',
    },
    {
      title: 'Mosques',
      value: mosques.length.toString(),
      icon: Building,
      color: '#1E3A8A',
    },
    {
      title: 'Admins',
      value: users.filter(u => u.role === 'mosque_admin').length.toString(),
      icon: UserCheck,
      color: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAdmin ? 'Admin Dashboard' : 'Mosque Management'}
        </Text>
        <Text style={styles.subtitle}>
          {isAdmin ? 'Manage users and mosques' : 'Manage your mosque'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isAdmin && (
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={stat.title} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <stat.icon size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              ))}
            </View>
          )}

          {isAdmin && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'users' && styles.activeTab,
                ]}
                onPress={() => setSelectedTab('users')}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'users' && styles.activeTabText,
                  ]}
                >
                  Users
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'mosques' && styles.activeTab,
                ]}
                onPress={() => setSelectedTab('mosques')}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'mosques' && styles.activeTabText,
                  ]}
                >
                  Mosques
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedTab === 'users' ? 'Users' : 'Mosques'}
            </Text>
            {isAdmin && selectedTab === 'users' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddUserModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add User</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedTab === 'users' ? (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <UserCard user={item} />}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <FlatList
              data={mosques}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.mosqueCard}>
                  <Text style={styles.mosqueName}>{item.name}</Text>
                  <Text style={styles.mosqueLocation}>{item.location}</Text>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </ScrollView>

      <AddUserModal
        visible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#7C3AED',
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
    color: '#C4B5FD',
  },
  content: {
    padding: 20,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    gap: 12,
  },
  mosqueCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mosqueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  mosqueLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
});