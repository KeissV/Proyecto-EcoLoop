import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ensureUserChallenges,
  fetchGlobalChallenges,
  fetchUserChallenges,
  getUserActiveDays,
  mergeChallenges,
  type ChallengeView,
} from "../../service/challengesService";
import { auth, db } from "../../service/firebaseConfig";
import { getLevelForPoints } from "../../service/levelService";

const C = {
  green: "#3BAB4F",
  darkGreen: "#1E7D3A",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F3F4F6",
  yellow: "#F5C518",
  olive: "#7B6F2E",
  oliveCard: "#6B6226",
};

type Tab = "En curso" | "Disponibles" | "Terminados";

const ICONS: Record<string, any> = {
  "recycle-icon.png": require("../../../assets/images/icons/recycle-icon.png"),
  "tab-search.jpeg": require("../../../assets/images/icons/tab-search.jpeg"),
  "reto-accion.jpeg": require("../../../assets/images/icons/reto-accion.jpeg"),
  "reto-social.jpeg": require("../../../assets/images/icons/reto-social.jpeg"),
  "reto-clasificacion.jpeg": require("../../../assets/images/icons/reto-clasificacion.jpeg"),
};

function resolveIcon(iconLocal: string) {
  if (ICONS[iconLocal]) {
    return ICONS[iconLocal];
  }

  return ICONS["recycle-icon.png"];
}

function RetoCard({ reto, onPress }: { reto: ChallengeView; onPress?: () => void }) {
  const pct = reto.total > 0 ? reto.progress / reto.total : 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconWrap}>
          <Image source={resolveIcon(reto.iconLocal)} style={styles.cardIcon} resizeMode="contain" />
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.cardTagRow}>
            <View style={[styles.tag, { backgroundColor: reto.tagBg }]}>
              <Text style={[styles.tagText, { color: reto.tagColor }]}>{reto.tag}</Text>
            </View>
            <Text style={styles.cardTime}>⏱ {reto.time}</Text>
          </View>
          <Text style={styles.cardTitle}>{reto.title}</Text>
          <Text style={styles.cardDesc}>{reto.description}</Text>
        </View>
        <Text style={styles.cardPoints}>⚡{reto.points}</Text>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
        </View>
        {reto.done ? (
          <Text style={styles.doneCheck}>✅</Text>
        ) : (
          <Text style={styles.progressLabel}>{reto.progress}/{reto.total}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function RetosScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Disponibles");
  const [retos, setRetos] = useState<ChallengeView[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [levelInfo, setLevelInfo] = useState<{ number: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  // Retos bloqueados: cuantos y en cuantos dias se desbloquean los proximos
  const [nextUnlockInfo, setNextUnlockInfo] = useState<{ count: number; daysUntil: number } | null>(null);
  const [bonusEarned, setBonusEarned] = useState(false);

  const loadData = useCallback(async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      setRetos([]);
      setStreakDays(0);
      setLevelInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const globalChallenges = await fetchGlobalChallenges();

      // Desbloqueo diario: filtrar segun dias activos del usuario
      const daysActive = await getUserActiveDays(uid);
      const available = globalChallenges.filter((c) => c.dia_desbloqueo <= daysActive);
      const locked = globalChallenges.filter((c) => c.dia_desbloqueo > daysActive);

      if (locked.length > 0) {
        const minDay = Math.min(...locked.map((c) => c.dia_desbloqueo));
        setNextUnlockInfo({ count: locked.filter((c) => c.dia_desbloqueo === minDay).length, daysUntil: minDay - daysActive });
      } else {
        setNextUnlockInfo(null);
      }

      await ensureUserChallenges(uid, available);
      const userChallenges = await fetchUserChallenges(uid);
      const merged = mergeChallenges(available, userChallenges);

      const userSnap = await getDoc(doc(db, "usuarios", uid));
      const points =
        userSnap.exists() && typeof userSnap.data().puntos_totales === "number"
          ? userSnap.data().puntos_totales
          : 0;

      // La racha se actualiza en la pantalla de inicio (index.tsx) al entrar a la app.
      // Aqui solo leemos el valor ya calculado.
      const streak = userSnap.exists() && typeof userSnap.data().racha_dias === "number"
        ? userSnap.data().racha_dias
        : 0;

      setRetos(merged);
      setStreakDays(streak);
      const level = getLevelForPoints(points);
      setLevelInfo({ number: level.level, name: level.name });

      // Bonus: si todos los retos disponibles estan completados, otorgar 50 pts una vez por dia
      const allDone = merged.length > 0 && merged.every((r) => r.done);
      const today = new Date().toISOString().split("T")[0];
      if (allDone) {
        const userData = userSnap.exists() ? userSnap.data() : {};
        if (userData.ultima_fecha_bonus === today) {
          setBonusEarned(true); // Ya se otorgo hoy
        } else {
          try {
            const currentPoints = typeof userData.puntos_totales === "number" ? userData.puntos_totales : 0;
            await setDoc(
              doc(db, "usuarios", uid),
              { puntos_totales: currentPoints + 50, ultima_fecha_bonus: today },
              { merge: true }
            );
            setBonusEarned(true);
          } catch {
            // Si falla el bonus, no interrumpir la vista
          }
        }
      } else {
        setBonusEarned(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const visibleRetos = useMemo(() => {
    if (activeTab === "Terminados") {
      return retos.filter((r) => r.done || r.status === "terminado");
    }

    if (activeTab === "Disponibles") {
      return retos.filter((r) => !r.done && r.progress === 0);
    }

    return retos.filter((r) => !r.done && r.progress > 0);
  }, [activeTab, retos]);

  const doneCount = retos.filter((r) => r.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.darkGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogo}>🌍</Text>
          <Text style={styles.headerTitle}>EcoLoop</Text>
        </View>
        <TouchableOpacity
        style={styles.bellBtn}
        onPress={() => router.push("/notificaciones")}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Racha */}
        <View style={styles.rachaCard}>
          <View style={styles.rachaLeft}>
            <View style={styles.rachaIconWrap}>
              <Image source={require("../../../assets/images/icons/icons8-fuego-64.png")} style={styles.rachaIcon} resizeMode="contain" />
            </View>
            <View style={styles.rachaTextWrap}>
              <Text style={styles.rachaTitle}>Tu Racha</Text>
              <Text style={styles.rachaSubtitle}>¡{streakDays} días seguidos cuidando el planeta!</Text>
            </View>
          </View>
          <Image source={require("../../../assets/images/icons/icons8-hoja-48.png")} style={styles.rachaWatermark} resizeMode="contain" />
        </View>

        {levelInfo ? (
          <View style={styles.levelCard}>
            <Text style={styles.levelText}>
              Nivel {levelInfo.number} · {levelInfo.name}
            </Text>
          </View>
        ) : null}

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {(["En curso", "Disponibles", "Terminados"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={C.green} size="large" />
          </View>
        ) : null}

        {/* Retos */}
        {!loading && visibleRetos.map((r) => (
          <RetoCard
            key={r.id}
            reto={r}
            onPress={
              r.id
                ? () =>
                    router.push({
                      pathname: "/reto/[id]",
                      params: {
                        id: r.id,
                      },
                    })
                : undefined
            }
          />
        ))}

        {!loading && !visibleRetos.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay retos en esta pestaña por ahora.</Text>
          </View>
        ) : null}

        {/* Proximos retos bloqueados */}
        {!loading && nextUnlockInfo ? (
          <View style={styles.nextUnlockCard}>
            <Text style={styles.nextUnlockIcon}>🔒</Text>
            <View style={styles.nextUnlockText}>
              <Text style={styles.nextUnlockTitle}>
                {nextUnlockInfo.count} reto{nextUnlockInfo.count !== 1 ? "s" : ""} nuevo{nextUnlockInfo.count !== 1 ? "s" : ""} próximamente
              </Text>
              <Text style={styles.nextUnlockSub}>
                {nextUnlockInfo.daysUntil === 1
                  ? "Se desbloquea mañana"
                  : `Se desbloquea en ${nextUnlockInfo.daysUntil} días`}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Reto Bonus */}
        <View style={[styles.bonusCard, bonusEarned && styles.bonusCardEarned]}>
          <View style={styles.bonusHeader}>
            <Image source={require("../../../assets/images/icons/icons8-estrellas-24.png")} style={styles.bonusStar} resizeMode="contain" />
            <Text style={styles.bonusTag}>{bonusEarned ? "¡BONUS GANADO!" : "RETO BONUS"}</Text>
          </View>
          <Text style={styles.bonusTitle}>
            {bonusEarned ? "¡Completaste todos los retos!" : "¡Completa todos los retos!"}
          </Text>
          <Text style={styles.bonusDesc}>
            {bonusEarned
              ? "Ya obtuviste los 50 puntos extra de hoy. ¡Vuelve mañana para nuevos retos!"
              : "Gana 50 puntos extra al completar todos los retos activos del día."}
          </Text>
          <View style={styles.bonusFooter}>
            <Text style={styles.bonusBtnText}>{bonusEarned ? "✅ Ganado" : "Progreso"}</Text>
            <Text style={styles.bonusProgress}>{doneCount}/{retos.length} completados</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
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
  headerTitle: { 
  fontSize: 18, 
  fontWeight: "700", 
  color: "#1a6027",
  fontFamily: "serif",
},
  bellBtn: { padding: 4 },
  bellIcon: { fontSize: 20 },
  content: { padding: 14, paddingBottom: 28 },

  rachaCard: {
    backgroundColor: C.green,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  rachaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  rachaIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  rachaIcon: { width: 32, height: 32 },
  rachaTextWrap: { flex: 1 },
  rachaTitle: { fontSize: 20, fontWeight: "800", color: C.white },
  rachaSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 4, lineHeight: 18 },
  rachaWatermark: {
    width: 92,
    height: 92,
    opacity: 0.16,
    position: "absolute",
    right: -6,
    top: -4,
    tintColor: "#FFFFFF",
  },

  levelCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  levelText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.darkGreen,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  tabBtn: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#E8EDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: { backgroundColor: C.darkGreen, paddingVertical: 14 },
  tabText: { fontSize: 13, fontWeight: "600", color: C.muted },
  tabTextActive: { color: C.white, fontWeight: "700", fontSize: 13 },

  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  cardIconWrap: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: "#EEF7EE", alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  cardIcon: { width: 28, height: 28 },
  cardMeta: { flex: 1 },
  cardTagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 10, fontWeight: "700" },
  cardTime: { fontSize: 11, color: C.muted },
  cardTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 3 },
  cardDesc: { fontSize: 12, color: C.muted, lineHeight: 17 },
  cardPoints: { fontSize: 15, fontWeight: "800", color: "#5C6B1E", marginLeft: 8 },

  loadingWrap: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyText: {
    color: C.muted,
    fontSize: 13,
    textAlign: "center",
  },

  nextUnlockCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 12,
  },
  nextUnlockIcon: { fontSize: 24 },
  nextUnlockText: { flex: 1 },
  nextUnlockTitle: { fontSize: 14, fontWeight: "700", color: C.darkGreen },
  nextUnlockSub: { fontSize: 12, color: C.muted, marginTop: 2 },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  progressTrack: {
    flex: 1, height: 8, borderRadius: 4, backgroundColor: "#E5E7EB",
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: C.darkGreen },
  progressLabel: { fontSize: 11, color: C.muted, minWidth: 28, textAlign: "right" },
  doneCheck: { fontSize: 14 },

  bonusCard: {
    backgroundColor: "#7A6520",
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
  },
  bonusCardEarned: {
    backgroundColor: "#1E7D3A",
  },
  bonusHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  bonusStar: { width: 18, height: 18, tintColor: "#F5C518" },
  bonusTag: { fontSize: 11, fontWeight: "800", color: "#F5C518", letterSpacing: 0.5 },
  bonusTitle: { fontSize: 22, fontWeight: "800", color: C.white, marginBottom: 8 },
  bonusDesc: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 19, marginBottom: 18 },
  bonusFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bonusBtnText: { fontSize: 15, fontWeight: "700", color: C.white },
  bonusProgress: { fontSize: 15, fontWeight: "700", color: C.white },
});
