import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const C = {
  green: "#22C55E",
  deepGreen: "#0D8A3A",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E3EAF4",
  bg: "#EFF2F7",
  paleBlue: "#EDF4FF",
  paleGreen: "#DDF7E2",
  paleYellow: "#FFD77A",
};

export default function LogroRachaActivaScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Logro</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.title}>Racha Activa</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeDot}>●</Text>
            <Text style={styles.badgeText}>Conseguida</Text>
          </View>

          <View style={styles.medalCircle}>
            <Image source={require("../../../assets/images/icons/icons8-fuego-64.png")} style={styles.medalIcon} resizeMode="contain" />
          </View>

          <Text style={styles.dateText}>Conseguida el 15 de Mayo, 2026</Text>
          <Text style={styles.description}>
            ¡Felicidades! Has mantenido una{"\n"}
            racha de 7 días seguidos{"\n"}
            aprendiendo en EcoLoop.
          </Text>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Siguiente Nivel</Text>
            <Text style={styles.progressDesc}>Llega a 14 días para la medalla de Plata</Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>7 días</Text>
              <Text style={styles.progressLabel}>14 días</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={() => router.push("/logros")}>
            <Text style={styles.shareText}>↪ Compartir logro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: C.text,
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
  },
  headerSpacer: {
    width: 32,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginTop: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.paleGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 18,
  },
  badgeDot: {
    fontSize: 10,
    color: C.green,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
  },
  medalCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.paleYellow,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  medalIcon: {
    width: 42,
    height: 42,
  },
  dateText: {
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: C.muted,
    textAlign: "center",
    marginBottom: 18,
  },
  progressCard: {
    backgroundColor: C.paleBlue,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 18,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  progressDesc: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DCE9FF",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: C.green,
    borderRadius: 999,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 11,
    color: C.muted,
  },
  shareButton: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  shareText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
