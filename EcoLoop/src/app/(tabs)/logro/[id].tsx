import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";

import { auth, db } from "../../../service/firebaseConfig";

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

type AchievementGlobal = {
  id: string;
  title: string;
  description: string;
  type: string;
  conditionType: string;
  conditionValue: number;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function iconForType(type: string) {
  const t = normalizeText(type);

  if (t.includes("fire") || t.includes("fuego") || t.includes("racha")) {
    return require("../../../../assets/images/icons/icons8-fuego-64.png");
  }

  if (t.includes("recycle") || t.includes("recicl")) {
    return require("../../../../assets/images/icons/icons8-reciclar-48.png");
  }

  if (t.includes("energy") || t.includes("energia")) {
    return require("../../../../assets/images/icons/icons8-energía-verde-64.png");
  }

  if (t.includes("water") || t.includes("agua")) {
    return require("../../../../assets/images/icons/icons8-agua-50.png");
  }

  if (t.includes("compost")) {
    return require("../../../../assets/images/icons/icons8-compost-48.png");
  }

  return require("../../../../assets/images/icons/icons8-estrella-48.png");
}

function metricFromUser(user: Record<string, unknown>, conditionType: string) {
  const c = normalizeText(conditionType);

  if (c.includes("materiales") || c.includes("consultados")) {
    return typeof user.materiales_consultados === "number" ? user.materiales_consultados : 0;
  }

  if (c.includes("lecciones")) {
    return typeof user.lecciones_completadas === "number" ? user.lecciones_completadas : 0;
  }

  if (c.includes("racha")) {
    return typeof user.racha_dias === "number" ? user.racha_dias : 0;
  }

  if (c.includes("objetos") || c.includes("reciclados")) {
    return typeof user.objetos_reciclados === "number" ? user.objetos_reciclados : 0;
  }

  if (c.includes("retos")) {
    return typeof user.retos_completados === "number" ? user.retos_completados : 0;
  }

  if (c.includes("puntos")) {
    return typeof user.puntos_totales === "number" ? user.puntos_totales : 0;
  }

  return 0;
}

function labelForCondition(conditionType: string) {
  const c = normalizeText(conditionType);

  if (c.includes("racha")) {
    return "dias";
  }

  if (c.includes("retos")) {
    return "retos";
  }

  if (c.includes("materiales") || c.includes("consultados")) {
    return "materiales";
  }

  if (c.includes("lecciones")) {
    return "lecciones";
  }

  if (c.includes("objetos") || c.includes("reciclados")) {
    return "objetos";
  }

  if (c.includes("puntos")) {
    return "pts";
  }

  return "avance";
}

export default function LogroDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [loading, setLoading] = useState(true);
  const [achievement, setAchievement] = useState<AchievementGlobal | null>(null);
  const [currentValue, setCurrentValue] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockedDate, setUnlockedDate] = useState<Date | null>(null);
  const [nextThreshold, setNextThreshold] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const uid = auth.currentUser?.uid;
      if (!uid || !id) {
        if (active) setLoading(false);
        return;
      }

      try {
        const [achievementSnap, userSnap, userAchievementSnap, allAchievementsSnap] = await Promise.all([
          getDoc(doc(db, "logros", id)),
          getDoc(doc(db, "usuarios", uid)),
          getDoc(doc(db, "usuarios", uid, "logros_usuario", id)),
          getDocs(collection(db, "logros")),
        ]);

        if (!achievementSnap.exists()) {
          if (active) setLoading(false);
          return;
        }

        const data = achievementSnap.data() as Record<string, unknown>;
        const ach: AchievementGlobal = {
          id: achievementSnap.id,
          title: typeof data.titulo === "string" ? data.titulo : "Logro",
          description: typeof data.descripcion === "string" ? data.descripcion : "",
          type: typeof data.tipo === "string" ? data.tipo : "star",
          conditionType: typeof data.condicion_tipo === "string" ? data.condicion_tipo : "",
          conditionValue: typeof data.condicion_valor === "number" ? data.condicion_valor : 1,
        };

        const userData = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
        const metricValue = metricFromUser(userData, ach.conditionType);
        const isUnlocked = metricValue >= ach.conditionValue;

        let unlockedAt: Date | null = null;
        if (userAchievementSnap.exists()) {
          const userAchievement = userAchievementSnap.data() as Record<string, unknown>;
          const dateValue = userAchievement.fecha_desbloqueo;
          if (dateValue instanceof Timestamp) {
            unlockedAt = dateValue.toDate();
          }
        }

        const sameTrack: number[] = [];
        allAchievementsSnap.forEach((item) => {
          const itemData = item.data() as Record<string, unknown>;
          const activeBadge = typeof itemData.activo === "boolean" ? itemData.activo : true;
          if (!activeBadge) {
            return;
          }

          const conditionType = typeof itemData.condicion_tipo === "string" ? itemData.condicion_tipo : "";
          if (normalizeText(conditionType) !== normalizeText(ach.conditionType)) {
            return;
          }

          const threshold = typeof itemData.condicion_valor === "number" ? itemData.condicion_valor : 0;
          if (threshold > 0) {
            sameTrack.push(threshold);
          }
        });

        sameTrack.sort((a, b) => a - b);
        const next = sameTrack.find((threshold) => threshold > metricValue) ?? null;

        if (active) {
          setAchievement(ach);
          setCurrentValue(metricValue);
          setUnlocked(isUnlocked);
          setUnlockedDate(unlockedAt);
          setNextThreshold(next);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const unitLabel = useMemo(() => (achievement ? labelForCondition(achievement.conditionType) : "avance"), [achievement]);

  const progressPct = useMemo(() => {
    if (!achievement) return 0;

    if (!nextThreshold) {
      return 100;
    }

    const base = achievement.conditionValue;
    const range = Math.max(1, nextThreshold - base);
    const advanced = Math.max(0, currentValue - base);

    return Math.max(0, Math.min(100, Math.round((advanced / range) * 100)));
  }, [achievement, currentValue, nextThreshold]);

  const achievedDateText = useMemo(() => {
    if (!unlockedDate) {
      return "Aun no conseguida";
    }

    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(unlockedDate);
  }, [unlockedDate]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!achievement) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyText}>No se encontro esta medalla.</Text>
          <TouchableOpacity style={styles.shareButton} onPress={() => router.replace("/logros")}>
            <Text style={styles.shareText}>Volver a Logros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/logros")}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Logro</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.title}>{achievement.title}</Text>
          <View style={[styles.badge, unlocked ? null : styles.badgeLocked]}>
            <Text style={[styles.badgeDot, unlocked ? null : styles.badgeDotLocked]}>●</Text>
            <Text style={[styles.badgeText, unlocked ? null : styles.badgeTextLocked]}>{unlocked ? "Conseguida" : "En progreso"}</Text>
          </View>

          <View style={styles.medalCircle}>
            <Image source={iconForType(achievement.type)} style={styles.medalIcon} resizeMode="contain" />
          </View>

          <Text style={styles.dateText}>{unlocked ? `Conseguida el ${achievedDateText}` : `Meta: ${achievement.conditionValue} ${unitLabel}`}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Siguiente nivel</Text>
            {nextThreshold ? (
              <Text style={styles.progressDesc}>Llega a {nextThreshold} {unitLabel} para la siguiente medalla.</Text>
            ) : (
              <Text style={styles.progressDesc}>Ya alcanzaste el maximo nivel de esta categoria.</Text>
            )}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{currentValue} {unitLabel}</Text>
              <Text style={styles.progressLabel}>{nextThreshold ?? achievement.conditionValue} {unitLabel}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={() => router.replace("/logros")}>
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: C.muted,
    marginBottom: 12,
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
    fontSize: 28,
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
  badgeLocked: {
    backgroundColor: "#EEF2F7",
  },
  badgeDot: {
    fontSize: 10,
    color: C.green,
    marginRight: 6,
  },
  badgeDotLocked: {
    color: C.muted,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
  },
  badgeTextLocked: {
    color: C.muted,
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
    width: "0%",
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
