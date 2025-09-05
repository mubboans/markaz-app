import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { X, MapPin, Phone, Star, Navigation, Clock } from "lucide-react-native";

export interface GooglePlaceMosque {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean };
  geometry: { location: { lat: number; lng: number } };
}

interface Props {
  mosque: GooglePlaceMosque | null;
  visible: boolean;
  onClose: () => void;
}

export default function MosqueDetailsModal({
  mosque,
  visible,
  onClose,
}: Props) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  /* entrance / exit */
  useEffect(() => {
    scale.value = visible
      ? withSpring(1, { damping: 15, stiffness: 160 })
      : withTiming(0, { duration: 200 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!mosque) return null;

  const openMaps = () => {
    const { lat, lng } = mosque.geometry.location;
    const url = Platform.select({
      ios: `maps://d?daddr=${lat},${lng}`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    Linking.openURL(
      url ?? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    ).catch(() => Linking.openURL(`geo:${lat},${lng}`));
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, backdropStyle]}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      {/* centered card */}
      <View style={styles.centerWrap}>
        <Animated.View style={[styles.card, cardStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* header */}
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.name}>{mosque.name}</Text>
                <View style={styles.rowItem}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.location}>{mosque.vicinity}</Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* info rows */}
            <View style={styles.section}>
              <InfoRow
                icon={<Phone size={16} />}
                label="Phone"
                value="Not provided"
              />
              <InfoRow
                icon={<MapPin size={16} />}
                label="Address"
                value={mosque.vicinity}
              />
              <InfoRow
                icon={<Star size={16} />}
                label="Rating"
                value={
                  mosque.rating
                    ? `${mosque.rating}  (${
                        mosque.user_ratings_total ?? 0
                      } reviews)`
                    : "No reviews"
                }
              />
              <InfoRow
                icon={<Clock size={16} />}
                label="Status"
                value={mosque.opening_hours?.open_now ? "Open now" : "Closed"}
              />
            </View>

            {/* CTA */}
            <View style={styles.ctaRow}>
              <TouchableOpacity style={styles.directionsBtn} onPress={openMaps}>
                <Navigation size={16} color="#FFF" />
                <Text style={styles.btnTxt}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/* ------------------------------ helpers ----------------------------- */
const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.rowItem}>
    <View style={styles.icon}>{icon}</View>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

/* ------------------------------ styles ------------------------------ */
const styles = StyleSheet.create({
  container: { backgroundColor: "rgba(0,0,0,0.45)" },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  scrollContent: { padding: 24, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerText: { flex: 1, paddingRight: 12 },
  name: { fontSize: 22, fontWeight: "700", color: "#111827" },
  location: { fontSize: 14, color: "#6B7280", marginLeft: 4 },
  closeButton: { padding: 4 },
  section: { marginBottom: 20 },
  rowItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  icon: { marginTop: 2, marginRight: 6 },
  label: { fontSize: 14, color: "#6B7280", width: 70 },
  value: { fontSize: 14, color: "#111827", flex: 1 },
  ctaRow: { marginTop: 8 },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnTxt: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
