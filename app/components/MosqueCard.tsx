import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { MapPin, Phone, Star, Navigation } from "lucide-react-native";

/* ------------------------------------------------------------------ */
/*  TYPE that matches the NEW Google Places payload                    */
/* ------------------------------------------------------------------ */
export interface GooglePlaceMosque {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean };
  geometry: { location: { lat: number; lng: number } };
  // optional – if you ever fetch phone from Place-Details
  formatted_phone_number?: string;
}

interface Props {
  mosque: GooglePlaceMosque;
  onPress?: () => void; // you can still use this for modal open
}

export default function MosqueCard({ mosque, onPress }: Props) {
  const scale = useSharedValue(1);

  /* ---------- animations ---------- */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = () => (scale.value = withSpring(0.97, { damping: 15 }));
  const pressOut = () => (scale.value = withSpring(1, { damping: 15 }));

  /* ---------- universal map link ---------- */
  const openMaps = () => {
    const { lat, lng } = mosque.geometry.location;
    // Apple Maps on iOS, Google Maps on Android – both open turn-by-turn
    const url = Platform.select({
      ios: `maps://d?daddr=${lat},${lng}`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    console.log(url,'check url');
    
    Linking.openURL(
      url ?? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    ).catch(() => {
      // fallback to generic geo: link
      Linking.openURL(`geo:${lat},${lng}`);
    });
  };

  /* ---------- phone dial ---------- */
  const dialPhone = () => {
    if (!mosque.formatted_phone_number) return;
    Linking.openURL(`tel:${mosque.formatted_phone_number}`);
  };

  /* ---------- helpers ------------- */
  const truncate = (str: string, n = 20) =>
    str.length > n ? `${str.slice(0, n)}…` : str;

  /* ---------- ui ------------------ */
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* ---- top row ---- */}
        <View style={styles.header}>
          <View style={styles.titleSide}>
            <Text style={styles.name}>{truncate(mosque.name)}</Text>

            <View style={styles.vicinityWrap}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.vicinity}>{mosque.vicinity}</Text>
            </View>
          </View>

          {mosque.rating && (
            <View style={styles.ratingBadge}>
              <Star size={12} color="#F59E0B" />
              <Text style={styles.ratingTxt}>
                {mosque.rating}
                {mosque.user_ratings_total
                  ? ` (${mosque.user_ratings_total})`
                  : ""}
              </Text>
            </View>
          )}
        </View>

        {/* ---- bottom row ---- */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.status,
              mosque.opening_hours?.open_now ? styles.open : styles.closed,
            ]}
          >
            {mosque.opening_hours?.open_now ? "Open now" : "Closed"}
          </Text>

          <View style={styles.actions}>
            {/* phone button (only if we have one) */}
            {mosque.formatted_phone_number && (
              <TouchableOpacity style={styles.iconBtn} onPress={dialPhone}>
                <Phone size={16} color="#059669" />
              </TouchableOpacity>
            )}

            {/* directions button */}
            <TouchableOpacity style={styles.directionsBtn} onPress={openMaps}>
              <Navigation size={16} color="#FFF" />
              <Text style={styles.btnTxt}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ------------------------------ styles ------------------------------ */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleSide: { flex: 1, paddingRight: 8 },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  vicinityWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vicinity: {
    fontSize: 13,
    color: "#6B7280",
    flexShrink: 1,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  status: { fontSize: 14, fontWeight: "600" },
  open: { color: "#059669" },
  closed: { color: "#DC2626" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnTxt: { color: "#FFF", fontSize: 13, fontWeight: "600" },
});
