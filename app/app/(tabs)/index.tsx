import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, Search, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Mosque, useMosqueStore } from '@/stores/mosqueStore';
import { useAuthStore } from '@/stores/authStore';
import MosqueCard from '@/components/MosqueCard';
import AddMosqueModal from '@/components/AddMosqueModal';
import { useToast } from '../providers/ToastProvider';
import MosqueDetailsModal from '@/components/MosqueDetailsModal';

export default function MosquesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject>();
  const { mosques, fetchMosques, fetchMosquesByLocation, fetchMosquesByArea } = useMosqueStore();
  const { user } = useAuthStore();
  const toast = useToast();
  const canAddMosque = user?.role === 'admin' || user?.role === 'mosque_admin';
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  useEffect(() => {
    fetchMosques();
    requestLocationPermission();
  }, []);

  // Request location permission when component mounts
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();      
      if (status !== 'granted') {
        // Automatically fetch mosques based on current location when permission is granted
        toast.show('Please enable location services to find mosques near you.');
        return;
    }
    getUserLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.show('Failed to request location permission');
    }
  };

  // Handle search by area name
  const handleSearchInput = (text: string) => {
    setSearchQuery(text);
  };

  // Handle location-based search
  const handleLocationPress = async () => {
    setIsLoading(true);
    if (searchQuery.trim().length > 2) {
      setIsLoading(true);
      try {
        await fetchMosquesByArea(searchQuery.trim());
      } catch (error) {
        console.error("Error searching mosques by area:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (searchQuery.trim().length === 0) {
      // Reset to all mosques when search is cleared
      fetchMosques();
    }
  };
  const getUserLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        // accuracy: Location.Accuracy.High,
      });
      if (!currentLocation) {
        toast.show('Failed to get your current location');
        setIsLoading(false);
        return;
      }
      const { latitude, longitude } = currentLocation.coords;
      setLocation(currentLocation);
      await fetchMosquesByLocation(latitude, longitude);
      setSearchQuery(''); // Clear search query when using location
    } catch (error) {
      console.error('Error getting current location:', error);
      toast.show('Failed to get your location');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mosques Near You</Text>
        <Text style={styles.subtitle}>Find prayer times and locations</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Navigation size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mosques by area name..."
            value={searchQuery}
            onChangeText={handleSearchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[styles.locationButton, isLoading && styles.disabledButton]}
          onPress={handleLocationPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Search size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>
            {isLoading
              ? "Loading mosques..."
              : `Found ${mosques.length} Mosques`}
          </Text>
          {canAddMosque && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Finding mosques...</Text>
          </View>
        ) : (
          <FlatList
            data={mosques}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MosqueCard
                mosque={item}
                onPress={() => setSelectedMosque(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No mosques found</Text>
                <Text style={styles.emptySubtext}>
                  Try a different search or location
                </Text>
              </View>
            }
          />
        )}
      </View>
      <MosqueDetailsModal
        mosque={selectedMosque}
        visible={!!selectedMosque}
        onClose={() => setSelectedMosque(null)}
      />
      <AddMosqueModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 20,
    backgroundColor: "#059669",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#A7F3D0",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    width: 48,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    width: 48,
    height: 48,
  },
  locationButton: {
    backgroundColor: "#059669",
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#10B981",
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});