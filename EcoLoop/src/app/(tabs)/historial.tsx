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

type HistorialItem = {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  puntos: number;
};

type Seccion = {
  titulo: string;
  items: HistorialItem[];
};

const DATA: Seccion[] = [
  {
    titulo: "Hoy",
    items: [
      {
        id: "1",
        titulo: "Reciclaje de PET",
        descripcion: "3 botellas plásticas en contenedor amarillo.",
        tiempo: "Hace 2 horas",
        puntos: 15,
      },
      {
        id: "2",
        titulo: "Lectura Completada",
        descripcion: 'Módulo: "El ciclo del agua".',
        tiempo: "Hace 5 horas",
        puntos: 10,
      },
    ],
  },
  {
    titulo: "Ayer",
    items: [
      {
        id: "3",
        titulo: "Quiz Superado",
        descripcion: "Puntaje perfecto en quiz de residuos.",
        tiempo: "14:30 PM",
        puntos: 25,
      },
    ],
  },
  {
    titulo: "Esta semana",
    items: [
      {
        id: "4",
        titulo: "Caminata Ecológica",
        descripcion: "Registro de 5km en zona verde.",
        tiempo: "Lunes, 09:00 AM",
        puntos: 50,
      },
    ],
  },
];

export default function Historial() {
  const router = useRouter();

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
              2,450 <Text style={styles.ptsLabel}>pts</Text>
            </Text>
            <View style={styles.leafBadge}>
              <Ionicons name="leaf-outline" size={20} color={GREEN} />
            </View>
          </View>
        </View>

        {DATA.map((seccion) => (
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
                    <Text style={styles.cardTiempo}>{item.tiempo}</Text>
                  </View>
                </View>
                <Text style={styles.puntos}>+{item.puntos} pts</Text>
              </View>
            ))}
          </View>
        ))}
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
    gap: 20,
    paddingBottom: 40,
  },
  totalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  totalLabel: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalPts: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
  },
  ptsLabel: {
    fontSize: 18,
    fontWeight: "400",
    color: GREEN,
  },
  leafBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  seccion: {
    gap: 10,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CCC",
  },
  dotActive: {
    backgroundColor: GREEN,
  },
  seccionTitulo: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardTexts: {
    flex: 1,
    gap: 2,
  },
  cardTitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  cardDesc: {
    fontSize: 13,
    color: "#555",
  },
  cardTiempo: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 2,
  },
  puntos: {
    fontSize: 13,
    fontWeight: "600",
    color: GREEN,
  },
});
