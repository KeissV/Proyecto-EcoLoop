import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../service/firebaseConfig";
import { registerDailyActivity } from "../../service/streakService";

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
  {
    id: 1,
    icon: "♻️",
    title: "Separa 3 tipos de residuos",
    current: 2,
    total: 3,
    points: 50,
    color: C.green,
  },
  {
    id: 2,
    icon: "🔍",
    title: "Identifica un material reciclable",
    current: 0,
    total: 1,
    points: 30,
    color: C.blue,
  },
  {
    id: 3,
    icon: "🌿",
    title: "Comparte un tip ecológico",
    current: 1,
    total: 1,
    points: 25,
    color: C.yellow,
  },
];

function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerLogo}>🌍</Text>
        <Text style={styles.headerTitle}>EcoLoop</Text>
      </View>
      <TouchableOpacity
        style={styles.bellBtn}
        onPress={() => router.push("../notificaciones")}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

function ImpactCard() {
  return (
    <View style={styles.impactCard}>
      <Text style={styles.impactLabel}>IMPACTO TOTAL</Text>
      <Text style={styles.impactValue}>
        124.5 <Text style={styles.impactUnit}>kg</Text>
      </Text>
      <Text style={styles.impactDelta}>+2.4 kg esta semana</Text>
      {/* decorative leaf */}
      <Text style={styles.leafDecor}>🌿</Text>
    </View>
  );
}

function StatsRow({ points, streakDays }: { points: number; streakDays: number }) {
  const router = useRouter();
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statIcon}>⭐</Text>
        <Text style={styles.statValue}>{points.toLocaleString("es")}</Text>
        <Text style={styles.statLabel}>Puntos</Text>
      </View>
      <TouchableOpacity
        style={[styles.statCard, { marginLeft: 12 }]}
        onPress={() => router.push("/(tabs)/racha" as any)}
        activeOpacity={0.75}
      >
        <Text style={styles.statIcon}>🔥</Text>
        <Text style={styles.statValue}>{streakDays} días</Text>
        <Text style={styles.statLabel}>Racha actual</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuickActions() {
  const router = useRouter();
  const items = [
      { icon: "🔍", label: "Buscar", color: C.blue, ruta: null },
      { icon: "🎯", label: "Reto", color: C.tealIcon, ruta: null },
      { icon: "🏆", label: "Logros", color: C.yellow, ruta: null },
      { icon: "🌱", label: "Impacto", color: C.green, ruta: "/(tabs)/impacto" },
    ];
  return (
    <View style={styles.quickRow}>
      {items.map((item) => (
        <TouchableOpacity key={item.label} style={styles.quickItem} onPress={() => item.ruta && router.push(item.ruta as any)}>
          <View style={[styles.quickCircle, { backgroundColor: item.color + "22" }]}>
            <Text style={styles.quickIcon}>{item.icon}</Text>
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
        <Text style={styles.challengeIcon}>{challenge.icon}</Text>
      </View>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: challenge.color },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {challenge.current}/{challenge.total}
        </Text>
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
        evitar el &quot;consumo fantasma&quot; de energía.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const [streakDays, setStreakDays] = useState(0);
  const [points, setPoints] = useState(0);
  const [userName, setUserName] = useState("Usuario");

  const loadData = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Registra actividad y recalcula racha en la pantalla de inicio
      const streakResult = await registerDailyActivity(uid);
      setStreakDays(streakResult.racha_dias);
    } catch {
      // Si falla la escritura de racha, leemos el ultimo valor guardado
    }

    try {
      const userSnap = await getDoc(doc(db, "usuarios", uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (typeof data.racha_dias === "number") setStreakDays(data.racha_dias);
        if (typeof data.puntos_totales === "number") setPoints(data.puntos_totales);
        if (typeof data.nombre === "string" && data.nombre) setUserName(data.nombre);
      }
    } catch {
      // Mantener valores por defecto si falla la lectura
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>¡Hola, {userName}!</Text>
        <Text style={styles.subGreeting}>¿Listo para sumar impacto positivo hoy?</Text>

        {/* Impact card */}
        <ImpactCard />

        {/* Stats */}
        <StatsRow points={points} streakDays={streakDays} />

        {/* Quick actions */}
        <View style={styles.card}>
          <QuickActions />
        </View>

        {/* Challenges */}
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
  safe: {
    flex: 1,
    backgroundColor: C.white,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerLogo: { fontSize: 22 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.green },
  bellBtn: { padding: 4 },
  bellIcon: { fontSize: 20 },

  // Scroll
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },

  // Greeting
  greeting: { fontSize: 24, fontWeight: "700", color: C.text, marginBottom: 2 },
  subGreeting: { fontSize: 14, color: C.textMuted, marginBottom: 16 },

  // Impact card
  impactCard: {
    backgroundColor: C.green,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  impactLabel: { fontSize: 11, color: "#d4f5db", letterSpacing: 1, marginBottom: 4 },
  impactValue: { fontSize: 42, fontWeight: "800", color: C.white, lineHeight: 48 },
  impactUnit: { fontSize: 24, fontWeight: "600" },
  impactDelta: { fontSize: 13, color: "#c8f0ce", marginTop: 4 },
  leafDecor: {
    position: "absolute",
    right: 16,
    bottom: 8,
    fontSize: 64,
    opacity: 0.18,
  },

  statsRow: { flexDirection: "row", marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statIcon: { fontSize: 26, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  quickRow: { flexDirection: "row", justifyContent: "space-around" },
  quickItem: { alignItems: "center", gap: 6 },
  quickCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  quickIcon: { fontSize: 22 },
  quickLabel: { fontSize: 12, color: C.textMuted },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  seeAll: { fontSize: 13, color: C.green, fontWeight: "600" },

  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  challengeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeIcon: { fontSize: 18 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 13, fontWeight: "500", color: C.text, marginBottom: 6 },
  progressTrack: {
    height: 6,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11, color: C.textMuted },
  pointsBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  pointsBolt: { fontSize: 14 },
  pointsNum: { fontSize: 14, fontWeight: "700", color: C.text },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },

  tipCard: {
    backgroundColor: "#C8F0CE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  tipBulb: { fontSize: 18 },
  tipTitle: { fontSize: 12, fontWeight: "700", color: C.green, letterSpacing: 0.5 },
  tipBody: { fontSize: 14, color: "#2E6B35", lineHeight: 20 },

});