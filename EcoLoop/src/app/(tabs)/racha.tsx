import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { auth, db } from "../../service/firebaseConfig";

const C = {
  green: "#3BAB4F",
  white: "#FFFFFF",
  bg: "#F5F5F5",
  text: "#1A1A1A",
  textMuted: "#8A8A8A",
  border: "#E5E5E5",
  grayCircle: "#DDE3EA",
  grayText: "#A0A8B0",
  pill: "#EAEAEA",
};

const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay(); // 0=Dom, 1=Lun, ...
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday;
}

type DayStatus = "completed" | "current" | "future" | "inactive";

type WeekDay = {
  label: string;
  key: string;
  status: DayStatus;
};

function buildWeekDays(streakDays: number, ultimaFechaRacha: string | null): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);
  const monday = getMondayOfCurrentWeek();

  let streakStartKey: string | null = null;
  if (ultimaFechaRacha && streakDays > 0) {
    const [y, mo, d] = ultimaFechaRacha.split("-").map(Number);
    const lastDate = new Date(y, mo - 1, d);
    lastDate.setDate(lastDate.getDate() - (streakDays - 1));
    streakStartKey = toDateKey(lastDate);
  }

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const key = toDateKey(day);

    let status: DayStatus;
    if (key > todayKey) {
      status = "future";
    } else if (
      streakStartKey &&
      ultimaFechaRacha &&
      key >= streakStartKey &&
      key <= ultimaFechaRacha
    ) {
      status = key === todayKey ? "current" : "completed";
    } else {
      status = "inactive";
    }

    days.push({ label: WEEK_LABELS[i], key, status });
  }
  return days;
}

type StreakAchievement = {
  id: string;
  title: string;
  description: string;
  conditionValue: number;
  unlocked: boolean;
};

export default function RachaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [userName, setUserName] = useState("Usuario");
  const [ultimaFechaRacha, setUltimaFechaRacha] = useState<string | null>(null);
  const [streakAchievements, setStreakAchievements] = useState<StreakAchievement[]>([]);

  const loadData = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const [userSnap, globalSnap, userLogrosSnap] = await Promise.all([
        getDoc(doc(db, "usuarios", uid)),
        getDocs(collection(db, "logros")),
        getDocs(collection(db, "usuarios", uid, "logros_usuario")),
      ]);

      const userData = userSnap.exists() ? userSnap.data() : {};
      setStreakDays(typeof userData.racha_dias === "number" ? userData.racha_dias : 0);
      setUltimaFechaRacha(
        typeof userData.ultima_fecha_racha === "string" ? userData.ultima_fecha_racha : null
      );
      setUserName(
        typeof userData.nombre === "string" && userData.nombre ? userData.nombre : "Usuario"
      );

      const unlockedIds = new Set<string>();
      userLogrosSnap.forEach((d) => {
        if (d.data().desbloqueado === true) unlockedIds.add(d.id);
      });

      const logros: StreakAchievement[] = [];
      globalSnap.forEach((d) => {
        const data = d.data();
        if (data.condicion_tipo === "racha_dias" && data.activo !== false) {
          logros.push({
            id: d.id,
            title: typeof data.titulo === "string" ? data.titulo : "Logro",
            description: typeof data.descripcion === "string" ? data.descripcion : "",
            conditionValue: typeof data.condicion_valor === "number" ? data.condicion_valor : 0,
            unlocked: unlockedIds.has(d.id),
          });
        }
      });

      logros.sort((a, b) => a.conditionValue - b.conditionValue);
      setStreakAchievements(logros);
    } catch (e) {
      console.error("Error cargando datos de racha:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(loadData);

  const weekDays = buildWeekDays(streakDays, ultimaFechaRacha);
  const today = new Date();
  const monthLabel = MONTH_NAMES[today.getMonth()];
  const upcomingAchievements = streakAchievements.filter((a) => !a.unlocked);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoLoop</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.green} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero: llama + número */}
          <View style={styles.hero}>
            <View style={styles.flameOuterGlow}>
              <View style={styles.flameInnerCircle}>
                <Text style={styles.flameEmoji}>🔥</Text>
              </View>
            </View>
            <Text style={styles.streakNum}>{streakDays}</Text>
            <Text style={styles.streakSub}>Días de racha</Text>
            <View style={styles.encouragePill}>
              <Text style={styles.encourageText}>¡Sigue así, {userName}!</Text>
            </View>
          </View>

          {/* Tarjeta esta semana */}
          <View style={styles.weekCard}>
            <View style={styles.weekCardHeader}>
              <Text style={styles.weekCardTitle}>Esta semana</Text>
              <View style={styles.monthPill}>
                <Text style={styles.monthIcon}>📅</Text>
                <Text style={styles.monthText}>{monthLabel}</Text>
              </View>
            </View>
            <View style={styles.weekGrid}>
              {weekDays.map((day) => (
                <View key={day.key} style={styles.dayCol}>
                  <Text
                    style={[
                      styles.dayLabel,
                      (day.status === "completed" || day.status === "current") &&
                        styles.dayLabelActive,
                    ]}
                  >
                    {day.label}
                  </Text>

                  {day.status === "completed" ? (
                    <View style={styles.circleCompleted}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  ) : day.status === "current" ? (
                    <View style={styles.circleCurrent}>
                      <Text style={styles.checkmarkCurrent}>✓</Text>
                    </View>
                  ) : (
                    <View style={styles.circleLocked}>
                      <Text style={styles.lockEmoji}>🔒</Text>
                    </View>
                  )}

                  {day.status === "current" && <View style={styles.currentDot} />}
                </View>
              ))}
            </View>
          </View>

          {/* Próximas recompensas */}
          <Text style={styles.sectionTitle}>Próximas recompensas</Text>

          {upcomingAchievements.length === 0 ? (
            <View style={styles.allDoneCard}>
              <Text style={styles.allDoneText}>
                🏆 ¡Desbloqueaste todos los logros de racha!
              </Text>
            </View>
          ) : (
            upcomingAchievements.map((a, idx) => {
              const daysLeft = Math.max(a.conditionValue - streakDays, 0);
              const isNext = idx === 0;
              const progress = Math.min(streakDays / a.conditionValue, 1);

              return (
                <View
                  key={a.id}
                  style={[styles.rewardCard, !isNext && styles.rewardCardGray]}
                >
                  <View
                    style={[
                      styles.rewardIconWrap,
                      !isNext && styles.rewardIconWrapGray,
                    ]}
                  >
                    <Text style={styles.rewardEmoji}>{isNext ? "🏅" : "🔒"}</Text>
                  </View>
                  <View style={styles.rewardBody}>
                    <Text
                      style={[
                        styles.rewardTitle,
                        !isNext && styles.rewardTitleGray,
                      ]}
                    >
                      Insignia &quot;{a.title}&quot;
                    </Text>
                    <Text style={styles.rewardDesc}>{a.description}</Text>
                    {isNext && (
                      <>
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progress * 100}%` as any },
                            ]}
                          />
                        </View>
                        <Text style={styles.daysLeft}>
                          Faltan {daysLeft} día{daysLeft !== 1 ? "s" : ""}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, alignItems: "flex-start", justifyContent: "center" },
  backArrow: { fontSize: 32, color: C.text, lineHeight: 36, marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.green },

  // Loader
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Scroll
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16 },

  // Hero
  hero: { alignItems: "center", marginBottom: 28 },
  flameOuterGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFF4E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#FF9A00",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  flameInnerCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFE5B8",
    alignItems: "center",
    justifyContent: "center",
  },
  flameEmoji: { fontSize: 44 },
  streakNum: { fontSize: 58, fontWeight: "800", color: C.green, lineHeight: 66 },
  streakSub: { fontSize: 15, color: C.textMuted, marginTop: 4, marginBottom: 18 },
  encouragePill: {
    backgroundColor: "#E8EDF5",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  encourageText: { fontSize: 15, fontWeight: "500", color: C.text },

  // Week card
  weekCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 26,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  weekCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  weekCardTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  monthPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  monthIcon: { fontSize: 13 },
  monthText: { fontSize: 13, color: C.textMuted, fontWeight: "500" },

  // Week grid
  weekGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 },
  dayCol: { alignItems: "center", gap: 7 },
  dayLabel: { fontSize: 13, color: C.grayText, fontWeight: "500" },
  dayLabelActive: { color: C.green, fontWeight: "700" },

  circleCompleted: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: C.white, fontSize: 18, fontWeight: "700" },

  circleCurrent: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: C.green,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkCurrent: { color: C.green, fontSize: 18, fontWeight: "700" },

  circleLocked: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8EEF5",
    alignItems: "center",
    justifyContent: "center",
  },
  lockEmoji: { fontSize: 13 },

  currentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
    marginTop: -3,
  },

  // Section title
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },

  // Reward cards
  rewardCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rewardCardGray: { opacity: 0.6 },
  rewardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFE8C0",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rewardIconWrapGray: { backgroundColor: "#E4E9F0" },
  rewardEmoji: { fontSize: 24 },
  rewardBody: { flex: 1 },
  rewardTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 3 },
  rewardTitleGray: { color: C.textMuted },
  rewardDesc: { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  progressTrack: {
    height: 8,
    backgroundColor: "#DCE9DC",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: { height: 8, backgroundColor: C.green, borderRadius: 4 },
  daysLeft: { fontSize: 12, color: C.green, fontWeight: "700", textAlign: "right" },

  allDoneCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  allDoneText: { fontSize: 15, fontWeight: "600", color: C.text },
});
