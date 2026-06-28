import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";
const AMBER = "#F5A623";
const AMBER_LIGHT = "#FFF8EC";
const BLUE_LIGHT = "#EAF4FB";
const BLUE = "#3B8FD4";
const YELLOW_LIGHT = "#FEFCE8";

export default function MiImpacto() {
  const router = useRouter();
  const progreso = 0.7;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoLoop</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Mi Impacto</Text>
        <Text style={styles.sub}>
          Cada pequeña acción cuenta. Mira cómo estás ayudando al planeta hoy.
        </Text>

        <View style={styles.co2Card}>
          <Ionicons name="leaf-outline" size={32} color="#fff" />
          <Text style={styles.co2Label}>CO2 AHORRADO</Text>
          <Text style={styles.co2Value}>12.5 kg</Text>
          <Text style={styles.co2Sub}>Impacto total acumulado</Text>
        </View>

        <View style={styles.arbolesCard}>
          <View style={styles.arbolesLeft}>
            <View style={styles.arbolesIcon}>
              <Ionicons name="triangle-outline" size={22} color={AMBER} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.arbolesTitle}>
                Has salvado el equivalente a 3 árboles
              </Text>
              <Text style={styles.arbolesHint}>
                ¡Faltan 1.5kg para tu próximo árbol virtual!
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progreso * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="refresh-outline" size={28} color={GREEN} />
            <Text style={styles.statValue}>45 kg</Text>
            <Text style={styles.statLabel}>Residuos Reciclados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BLUE_LIGHT }]}>
            <Ionicons name="water-outline" size={28} color={BLUE} />
            <Text style={[styles.statValue, { color: BLUE }]}>150 L</Text>
            <Text style={styles.statLabel}>Agua Preservada</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: YELLOW_LIGHT }]}>
            <Ionicons name="flash-outline" size={28} color="#D4A017" />
            <Text style={[styles.statValue, { color: "#D4A017" }]}>20 kWh</Text>
            <Text style={styles.statLabel}>Energía Ahorrada</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: GREEN_LIGHT }]}>
            <Ionicons name="bulb-outline" size={28} color={GREEN} />
            <Text style={[styles.statValue, { color: GREEN }]}>Eco+</Text>
            <Text style={styles.statLabel}>Nivel actual</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.shareText}>¡Compartir Impacto!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: GREEN,
  },
  scroll: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  sub: {
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
  },
  co2Card: {
    backgroundColor: GREEN,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  co2Label: {
    fontSize: 11,
    color: "#C8EFD0",
    letterSpacing: 1,
    marginTop: 4,
  },
  co2Value: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  co2Sub: {
    fontSize: 13,
    color: "#C8EFD0",
  },
  arbolesCard: {
    backgroundColor: AMBER_LIGHT,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F5E0B0",
  },
  arbolesLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  arbolesIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0D0",
    alignItems: "center",
    justifyContent: "center",
  },
  arbolesTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8B5E00",
    marginBottom: 4,
  },
  arbolesHint: {
    fontSize: 12,
    color: "#B07E20",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0D080",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    backgroundColor: AMBER,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
    padding: 16,
    alignItems: "flex-start",
    gap: 6,
    width: "47%",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: GREEN,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  shareButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  shareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
