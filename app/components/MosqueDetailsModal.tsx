import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { X, MapPin, Phone, Clock, Users } from "lucide-react-native";
import { Mosque } from "@/stores/mosqueStore";

interface Props {
  mosque: Mosque | null;
  visible: boolean;
  onClose: () => void;
}

export default function MosqueDetailsModal({ mosque, visible, onClose }: Props) {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, { duration: 250 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250 });
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? "auto" : "none",
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!mosque) return null;

  return (
    <>
      {/* backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.name}>{mosque.name}</Text>
              <View style={styles?.rowItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.location}>{mosque.location}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* details */}
          <View style={styles.section}>
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={mosque.phone}
            />
            <InfoRow
              icon={<MapPin size={16} />}
              label="Address"
              value={mosque.address}
            />
            <InfoRow
              icon={<Users size={16} />}
              label="Capacity"
              value={`${mosque.capacity} people`}
            />
            <InfoRow
              icon={<Clock size={16} />}
              label="Imam"
              value={mosque.imam || "Not specified"}
            />
          </View>

          {/* prayer times */}
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          <View style={styles.timesRow}>
            {Object.entries(mosque.prayerTimes).map(([name, time]) => (
              <View key={name} style={styles.timeBox}>
                <Text style={styles.timeLabel}>{name}</Text>
                <Text style={styles.timeValue}>{time}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.rowItem}>
    <View style={styles.icon}>{icon}</View>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
  },
  scrollContent: { padding: 24, paddingBottom: 40 },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  rowItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  icon: { marginTop: 2, marginRight: 6 },
  label: { fontSize: 14, color: "#6B7280", width: 70 },
  value: { fontSize: 14, color: "#111827", flex: 1 },

  timesRow: { flexDirection: "row", flexWrap: "wrap" },
  timeBox: { width: "50%", paddingVertical: 6 },
  timeLabel: { fontSize: 13, color: "#6B7280", textTransform: "capitalize" },
  timeValue: { fontSize: 15, fontWeight: "600", color: "#059669" },
});
