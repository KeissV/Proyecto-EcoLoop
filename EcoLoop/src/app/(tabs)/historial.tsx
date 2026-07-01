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
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../service/firebaseConfig";
import { obtenerHistorial, HistorialSeccion } from "../../service/historialService";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";

export default function Historial() {
  const router = useRouter();
  const [secciones, setSecciones] = useState<HistorialSeccion[]>([]);
  const [totalPuntos, setTotalPuntos] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const data = await obtenerHistorial(user.uid);
        setSecciones(data);

        const total = data
          .flatMap((s) => s.items)
          .reduce((acc, item) => acc + item.puntos_ganados, 0);
        setTotalPuntos(total);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setCargando(false);
      }
    });

    return () => unsub();
  }, []);

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHoras < 1) return "Hace unos minutos";
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;

    return fecha.toLocaleDateString("es-CR", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL ACUMULADO</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalPts}>
              {totalPuntos.toLocaleString()}{" "}
              <Text style={styles.ptsLabel}>pts</Text>
            </Text>
            <View style={styles.leafBadge}>
              <Ionicons name="leaf-outline" size={20} color={GREEN} />
            </View>
          </View>
        </View>

        {secciones.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No hay actividad registrada aún.</Text>
          </View>
        ) : (
          secciones.map((seccion) => (
            <View key={seccion.titulo} style={styles.seccion}>
              <View style={styles.seccionHeader}>
                <View
                  style={[
                    styles.dot,
                    seccion.titulo === "Hoy" && styles.dotActive,
                  ]}
                />
                <Text style={styles.seccionTitulo}>{seccion.titulo}</Text>
              </View>

              {seccion.items.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                    <View style={styles.cardTexts}>
                      <Text style={styles.cardTitulo}>{item.titulo}</Text>
                      <Text style={styles.cardDesc}>{item.descripcion}</Text>
                      <Text style={styles.cardTiempo}>
                        {formatearFecha(item.fecha)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.puntos}>+{item.puntos_ganados} pts</Text>
                </View>
              ))}
            </View>
          ))
        )}
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
  headerTitle: { 
  fontSize: 18, 
  fontWeight: "700", 
  color: "#1a6027",
  fontFamily: "serif",
},
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  totalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  totalLabel: { fontSize: 11, color: "#888", letterSpacing: 0.5, marginBottom: 6 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalPts: { fontSize: 32, fontWeight: "700", color: "#222" },
  ptsLabel: { fontSize: 18, fontWeight: "400", color: GREEN },
  leafBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: GREEN_LIGHT, alignItems: "center", justifyContent: "center",
  },
  seccion: { gap: 10 },
  seccionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#CCC" },
  dotActive: { backgroundColor: GREEN },
  seccionTitulo: { fontSize: 14, color: "#888", fontWeight: "500" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", gap: 12, flex: 1 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: GREEN,
    alignItems: "center", justifyContent: "center", marginTop: 2,
  },
  cardTexts: { flex: 1, gap: 2 },
  cardTitulo: { fontSize: 14, fontWeight: "600", color: "#222" },
  cardDesc: { fontSize: 13, color: "#555" },
  cardTiempo: { fontSize: 12, color: "#AAA", marginTop: 2 },
  puntos: { fontSize: 13, fontWeight: "600", color: GREEN },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: "#AAA" },
});