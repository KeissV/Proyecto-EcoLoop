import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../service/firebaseConfig";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";
const AMBER = "#F5A623";
const AMBER_LIGHT = "#FFF8EC";
const BLUE_LIGHT = "#EAF4FB";
const BLUE = "#3B8FD4";
const YELLOW_LIGHT = "#FEFCE8";

type ImpactoData = {
  residuos_reciclados_kg: number;
  agua_preservada_l: number;
  energia_ahorrada_kwh: number;
  arboles_equivalentes: number;
};

export default function MiImpacto() {
  const router = useRouter();
  const [datos, setDatos] = useState<ImpactoData | null>(null);
  const [co2, setCo2] = useState<number>(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const impactoSnap = await getDoc(doc(db, "impacto", uid));
        if (impactoSnap.exists()) {
          console.log("datos impacto:", impactoSnap.data());
          setDatos(impactoSnap.data() as ImpactoData);
        }

        const usuarioSnap = await getDoc(doc(db, "usuarios", uid));
        if (usuarioSnap.exists()) {
          setCo2(usuarioSnap.data().co2_ahorrado_kg ?? 0);
        }
      } catch (error) {
        console.error("Error cargando impacto:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const progreso = datos ? (datos.arboles_equivalentes % 1 === 0 
  ? (datos.arboles_equivalentes % 5) / 5 
  : datos.arboles_equivalentes / 5) : 0;

  if (cargando) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

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
          <Text style={styles.co2Value}>{co2} kg</Text>
          <Text style={styles.co2Sub}>Impacto total acumulado</Text>
        </View>

        <View style={styles.arbolesCard}>
          <View style={styles.arbolesLeft}>
            <View style={styles.arbolesIcon}>
              <Ionicons name="leaf" size={22} color={AMBER} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.arbolesTitle}>
                Has salvado el equivalente a {datos?.arboles_equivalentes ?? 0} arboles
              </Text>
              <Text style={styles.arbolesHint}>
                Sigue asi para plantar tu proximo arbol virtual!
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progreso * 100}%` as any }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="refresh-outline" size={28} color={GREEN} />
            <Text style={styles.statValue}>{datos?.residuos_reciclados_kg ?? 0} kg</Text>
            <Text style={styles.statLabel}>Residuos Reciclados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BLUE_LIGHT }]}>
            <Ionicons name="water-outline" size={28} color={BLUE} />
            <Text style={[styles.statValue, { color: BLUE }]}>{datos?.agua_preservada_l ?? 0} L</Text>
            <Text style={styles.statLabel}>Agua Preservada</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: YELLOW_LIGHT }]}>
            <Ionicons name="flash-outline" size={28} color="#D4A017" />
            <Text style={[styles.statValue, { color: "#D4A017" }]}>{datos?.energia_ahorrada_kwh ?? 0} kWh</Text>
            <Text style={styles.statLabel}>Energia Ahorrada</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: GREEN_LIGHT }]}>
            <Ionicons name="bulb-outline" size={28} color={GREEN} />
            <Text style={[styles.statValue, { color: GREEN }]}>Eco+</Text>
            <Text style={styles.statLabel}>Nivel actual</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.shareText}>Compartir Impacto!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F7F7F7" },
  loadingWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEE",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: GREEN },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  titulo: { fontSize: 24, fontWeight: "700", color: "#222" },
  sub: { fontSize: 14, color: "#888", lineHeight: 20 },
  co2Card: {
    backgroundColor: GREEN, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 6,
  },
  co2Label: { fontSize: 11, color: "#C8EFD0", letterSpacing: 1, marginTop: 4 },
  co2Value: { fontSize: 36, fontWeight: "700", color: "#fff" },
  co2Sub: { fontSize: 13, color: "#C8EFD0" },
  arbolesCard: {
    backgroundColor: AMBER_LIGHT, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#F5E0B0",
  },
  arbolesLeft: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  arbolesIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF0D0",
    alignItems: "center", justifyContent: "center",
  },
  arbolesTitle: { fontSize: 15, fontWeight: "700", color: "#8B5E00", marginBottom: 4 },
  arbolesHint: { fontSize: 12, color: "#B07E20", marginBottom: 10 },
  progressBar: { height: 8, backgroundColor: "#F0D080", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: AMBER, borderRadius: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    backgroundColor: GREEN_LIGHT, borderRadius: 14, padding: 16,
    alignItems: "flex-start", gap: 6, width: "47%",
  },
  statValue: { fontSize: 22, fontWeight: "700", color: GREEN },
  statLabel: { fontSize: 12, color: "#666" },
  shareButton: {
    backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginTop: 4,
  },
  shareText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
