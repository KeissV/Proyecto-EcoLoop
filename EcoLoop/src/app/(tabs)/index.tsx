import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../service/firebaseConfig";
import { obtenerUsuario } from "../../service/usuarioService";
import { obtenerHistorial } from "../../service/historialService";

const C = {
  green: "#3BAB4F",
  greenLight: "#E8F5E9",
  greenTip: "#A8D5A2",
  white: "#FFFFFF",
  bg: "#F7F7F7",
  text: "#1A1A1A",
  textMuted: "#888",
  yellow: "#F5C518",
  orange: "#FF8C00",
  blue: "#4A9EE0",
  tealIcon: "#38B2AC",
  border: "#E5E5E5",
};

const CHALLENGES = [
  { id: 1, icon: null, title: "Separa 3 tipos de residuos", current: 2, total: 3, points: 50, color: C.green, png: require("../../../assets/images/icons/icons8-reciclar-64.png") },
  { id: 2, icon: "search-outline", title: "Identifica un material reciclable", current: 0, total: 1, points: 30, color: C.blue, png: null },
  { id: 3, icon: "leaf-outline", title: "Comparte un tip ecológico", current: 1, total: 1, points: 25, color: C.yellow, png: null },
];

function Header() {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerLogo}>🌍</Text>
      </View>
      <Text style={styles.headerTitle}>EcoLoop</Text>
      <TouchableOpacity style={styles.bellBtn} onPress={() => router.push("../notificaciones" as any)}>
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

function ImpactCard({ co2 }: { co2: number }) {
  return (
    <View style={styles.impactCard}>
      <Text style={styles.impactLabel}>IMPACTO TOTAL</Text>
      <Text style={styles.impactValue}>
        {co2} <Text style={styles.impactUnit}>kg</Text>
      </Text>
      <Text style={styles.impactDelta}>CO2 ahorrado acumulado</Text>
      <Text style={styles.leafDecor}>🌿</Text>
    </View>
  );
}

function StatsRow({ puntos }: { puntos: number }) {
  const router = useRouter();
  return (
    <View style={styles.statsRow}>
      <TouchableOpacity
        style={styles.statCard}
        onPress={() => router.push("/(tabs)/historial" as any)}
      >
        <Text style={styles.statIcon}>⭐</Text>
        <Text style={styles.statValue}>{puntos.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Puntos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.statCard, { marginLeft: 12 }]}
        onPress={() => {
          // TODO: router.push("/(tabs)/racha") cuando esté lista
        }}
      >
        <Text style={styles.statIcon}>🔥</Text>
        <Text style={styles.statValue}>12 días</Text>
        <Text style={styles.statLabel}>Racha actual</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickActions() {
  const router = useRouter();
  const items = [
    { icon: "search-outline", label: "Buscar", color: C.blue, ruta: "/(tabs)/buscar", png: null },
    { icon: null, label: "Reto", color: C.tealIcon, ruta: "/(tabs)/retos", png: require("../../../assets/images/icons/icons8-goal-24.png") },
    { icon: "trophy-outline", label: "Logros", color: C.yellow, ruta: "/(tabs)/logros", png: null },
    { icon: null, label: "Impacto", color: C.green, ruta: "/(tabs)/impacto", png: require("../../../assets/images/icons/icons8-pino-24.png") },
  ];

  return (
    <View style={styles.quickRow}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.quickItem}
          onPress={() => item.ruta && router.push(item.ruta as any)}
        >
          <View style={[styles.quickCircle, { backgroundColor: item.color + "22" }]}>
            {item.png ? (
              <Image source={item.png} style={{ width: 28, height: 28 }} resizeMode="contain" />
            ) : (
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            )}
          </View>
          <Text style={styles.quickLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ChallengeRow({ challenge }: { challenge: (typeof CHALLENGES)[0] }) {
  const progress = challenge.current / challenge.total;
  return (
    <View style={styles.challengeRow}>
      <View style={[styles.challengeIconWrap, { backgroundColor: challenge.color + "22" }]}>
        {challenge.png ? (
          <Image source={challenge.png} style={{ width: 26, height: 26 }} resizeMode="contain" />
        ) : (
          <Ionicons name={challenge.icon as any} size={22} color={challenge.color} />
        )}
      </View>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: challenge.color }]} />
        </View>
        <Text style={styles.progressText}>{challenge.current}/{challenge.total}</Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsBolt}>⚡</Text>
        <Text style={styles.pointsNum}>{challenge.points}</Text>
      </View>
    </View>
  );
}

function TipCard() {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Text style={styles.tipBulb}>💡</Text>
        <Text style={styles.tipTitle}>TIP ECOLÓGICO DEL DÍA</Text>
      </View>
      <Text style={styles.tipBody}>
        Desconecta los cargadores y electrodomésticos que no estés usando para
        evitar el "consumo fantasma" de energía.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const [nombre, setNombre] = useState("Usuario");
  const [puntos, setPuntos] = useState(0);
  const [co2, setCo2] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const [usuario, historial] = await Promise.all([
          obtenerUsuario(user.uid),
          obtenerHistorial(user.uid),
        ]);

        if (usuario) {
          setNombre(usuario.nombre.split(" ")[0]);
          setCo2(usuario.co2_ahorrado_kg);
        }

        const totalPuntos = historial
          .flatMap((s) => s.items)
          .reduce((acc, item) => acc + item.puntos_ganados, 0);
        setPuntos(totalPuntos);
      } catch (error) {
        console.error("Error cargando home:", error);
      }
    });

    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>¡Hola, {nombre}!</Text>
        <Text style={styles.subGreeting}>¿Listo para sumar impacto positivo hoy?</Text>

        <ImpactCard co2={co2} />
        <StatsRow puntos={puntos} />

        <View style={styles.card}>
          <QuickActions />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Retos de hoy</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {CHALLENGES.map((ch, i) => (
            <View key={ch.id}>
              <ChallengeRow challenge={ch} />
              {i < CHALLENGES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TipCard />
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { width: 40 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a6027",
    fontFamily: "serif",
    textAlign: "center",
    flex: 1,
  },
  headerLogo: { fontSize: 22 },
  bellBtn: { padding: 4, width: 40, alignItems: "flex-end" },
  bellIcon: { fontSize: 20 },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  greeting: { fontSize: 24, fontWeight: "700", color: C.text, marginBottom: 2 },
  subGreeting: { fontSize: 14, color: C.textMuted, marginBottom: 16 },
  impactCard: {
    backgroundColor: C.green, borderRadius: 16, padding: 20,
    marginBottom: 16, overflow: "hidden", position: "relative",
  },
  impactLabel: { fontSize: 11, color: "#d4f5db", letterSpacing: 1, marginBottom: 4 },
  impactValue: { fontSize: 42, fontWeight: "800", color: C.white, lineHeight: 48 },
  impactUnit: { fontSize: 24, fontWeight: "600" },
  impactDelta: { fontSize: 13, color: "#c8f0ce", marginTop: 4 },
  leafDecor: { position: "absolute", right: 16, bottom: 8, fontSize: 64, opacity: 0.18 },
  statsRow: { flexDirection: "row", marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 16,
    alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statIcon: { fontSize: 26, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  quickRow: { flexDirection: "row", justifyContent: "space-around" },
  quickItem: { alignItems: "center", gap: 6 },
  quickCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, color: C.textMuted },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  seeAll: { fontSize: 13, color: C.green, fontWeight: "600" },
  challengeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 12 },
  challengeIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 13, fontWeight: "500", color: C.text, marginBottom: 6 },
  progressTrack: { height: 6, backgroundColor: "#E8E8E8", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11, color: C.textMuted },
  pointsBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  pointsBolt: { fontSize: 14 },
  pointsNum: { fontSize: 14, fontWeight: "700", color: C.text },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  tipCard: { backgroundColor: "#C8F0CE", borderRadius: 16, padding: 16, marginBottom: 4 },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  tipBulb: { fontSize: 18 },
  tipTitle: { fontSize: 12, fontWeight: "700", color: C.green, letterSpacing: 0.5 },
  tipBody: { fontSize: 14, color: "#2E6B35", lineHeight: 20 },
});