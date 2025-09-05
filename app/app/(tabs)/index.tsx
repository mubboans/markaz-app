import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Plus, Search, Navigation } from "lucide-react-native";
import * as Location from "expo-location";
import { useAuthStore } from "@/stores/authStore";
import MosqueCard, { GooglePlaceMosque } from "@/components/MosqueCard";
import AddMosqueModal from "@/components/AddMosqueModal";
import { useToast } from "../providers/ToastProvider";
import MosqueDetailsModal from "@/components/MosqueDetailsModal";
import Mosque_Json from "@/assets/json/output-1.json";
import Fuse from "fuse.js";

/* ------------------------------------------------------------------ */
export default function MosquesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // start loading
  const [selectedMosque, setSelectedMosque] =
    useState<GooglePlaceMosque | null>(null);

  const { user } = useAuthStore();
  const toast = useToast();
  const canAddMosque = user?.role === "admin" || user?.role === "mosque_admin";

  /* -------------- search index (built once) ----------------------- */
  const fuse = useMemo(
    () =>
      new Fuse(Mosque_Json, {
        keys: ["vicinity", "name"],
        threshold: 0.4,
      }),
    []
  );

  /* -------------- filtered list ---------------------------------- */
  const displayedMosques = useMemo(() => {
    if (!searchQuery.trim()) return Mosque_Json;
    return fuse.search(searchQuery).map((r) => r.item);
  }, [searchQuery, fuse]);

  /* -------------- location permission / fetch -------------------- */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        toast.show("Please enable location to find nearby mosques.");
        setIsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      /* TODO: call your backend with loc.coords.latitude/longitude */
      setIsLoading(false);
    })();
  }, []);

  /* -------------- debounced search ------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery((q) => q), 300); // cheap debounce
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* -------------- UI ------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mosques Near You</Text>
        <Text style={styles.subtitle}>Find prayer times and locations</Text>
      </View>

      {/* search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mosques by area or name…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[styles.locationButton, isLoading && styles.disabledButton]}
          onPress={() => toast.show("Location search coming soon…")}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Navigation size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* list header */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>
            {isLoading
              ? "Loading…"
              : `Found ${displayedMosques.length} Mosques`}
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

        {/* list or empty */}
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 40 }}
            size="large"
            color="#059669"
          />
        ) : (
          <FlatList
            data={displayedMosques}
            keyExtractor={(item) => item.reference}
            renderItem={({ item }) => (
              <MosqueCard
                mosque={item}
                onPress={() => setSelectedMosque(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No mosques found</Text>
                <Text style={styles.emptySub}>Try a different search</Text>
              </View>
            }
          />
        )}
      </View>

      {/* modals */}
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

/* ------------------------------ styles ------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20, backgroundColor: "#059669" },
  title: { fontSize: 28, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#A7F3D0" },
  searchContainer: { flexDirection: "row", padding: 20, gap: 12 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#111827" },
  locationButton: {
    backgroundColor: "#059669",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: { opacity: 0.7 },
  content: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  listContainer: { paddingBottom: 20 },
  emptyBox: {
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
  emptySub: { fontSize: 14, color: "#6B7280", textAlign: "center" },
});
