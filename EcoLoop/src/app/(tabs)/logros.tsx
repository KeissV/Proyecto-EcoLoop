import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { auth, db } from "../../service/firebaseConfig";
import { validateAndUnlockAchievements } from "../../service/achievementsService";

const C = {
  green: "#22C55E",
  deepGreen: "#0D8A3A",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E6ECF5",
  bg: "#F5FAF2",
  paleBlue: "#ECF3FF",
  paleGreen: "#EDF9EE",
  paleYellow: "#FFF1C4",
  grayIcon: "#B7C0CC",
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  kind: "star" | "recycle" | "fire" | "compost" | "blocked" | "walk" | "energy" | "water";
  onPress?: () => void;
};

type AchievementDoc = {
  id: string;
  titulo: string;
  descripcion: string;
  condicionTipo: string;
  condicionValor: number;
  orden: number;
  ruta?: string;
  tipo: "star" | "recycle" | "fire" | "compost" | "blocked" | "walk" | "energy" | "water";
};

type UserMetrics = {
  lecciones_completadas: number;
  materiales_consultados: number;
  racha_dias: number;
  objetos_reciclados: number;
  retos_completados: number;
  puntos_totales: number;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function mapBadgeKind(tipo: string): AchievementDoc["tipo"] {
  const normalized = normalizeText(tipo);

  if (normalized.includes("fire") || normalized.includes("fuego") || normalized.includes("racha")) {
    return "fire";
  }

  if (normalized.includes("recycle") || normalized.includes("recicl")) {
    return "recycle";
  }

  if (normalized.includes("water") || normalized.includes("agua")) {
    return "water";
  }

  if (normalized.includes("energy") || normalized.includes("energia")) {
    return "energy";
  }

  if (normalized.includes("compost")) {
    return "compost";
  }

  if (normalized.includes("walk") || normalized.includes("camina")) {
    return "walk";
  }

  return "star";
}

function readMetricValue(metrics: UserMetrics, condicionTipo: string) {
  const normalized = normalizeText(condicionTipo);

  if (normalized.includes("lecciones")) {
    return metrics.lecciones_completadas;
  }

  if (normalized.includes("materiales") || normalized.includes("consultados")) {
    return metrics.materiales_consultados;
  }

  if (normalized.includes("racha")) {
    return metrics.racha_dias;
  }

  if (normalized.includes("objetos") || normalized.includes("reciclados")) {
    return metrics.objetos_reciclados;
  }

  if (normalized.includes("retos")) {
    return metrics.retos_completados;
  }

  if (normalized.includes("puntos")) {
    return metrics.puntos_totales;
  }

  return 0;
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerLogo}>🌍</Text>
        <Text style={styles.headerTitle}>EcoLoop</Text>
      </View>
      <TouchableOpacity style={styles.bellBtn}>
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const iconNode = achievement.kind === "star"
    ? <Image source={require("../../../assets/images/icons/icons8-estrella-48.png")} style={styles.achievementIcon} resizeMode="contain" />
    : achievement.kind === "recycle"
      ? <Image source={require("../../../assets/images/icons/icons8-reciclar-48.png")} style={styles.achievementIcon} resizeMode="contain" />
      : achievement.kind === "fire"
        ? <Image source={require("../../../assets/images/icons/icons8-fuego-64.png")} style={styles.achievementIcon} resizeMode="contain" />
        : achievement.kind === "compost"
          ? <Image source={require("../../../assets/images/icons/icons8-compost-48.png")} style={styles.achievementIcon} resizeMode="contain" />
          : achievement.kind === "blocked"
            ? <Image source={require("../../../assets/images/icons/icons8-prohibido-64.png")} style={styles.achievementIcon} resizeMode="contain" />
            : achievement.kind === "walk"
              ? <Image source={require("../../../assets/images/icons/icons8-piel-hiperactiva-tipo-2-48.png")} style={styles.achievementIcon} resizeMode="contain" />
              : achievement.kind === "energy"
                ? <Image source={require("../../../assets/images/icons/icons8-energía-verde-64.png")} style={styles.achievementIcon} resizeMode="contain" />
                : <Image source={require("../../../assets/images/icons/icons8-agua-50.png")} style={styles.achievementIcon} resizeMode="contain" />;

  return (
    <TouchableOpacity
      style={[styles.achievementCard, !achievement.unlocked && styles.achievementCardLocked]}
      onPress={achievement.onPress}
      activeOpacity={achievement.onPress ? 0.75 : 1}
    >
      <View style={[styles.achievementIconCircle, !achievement.unlocked && styles.achievementIconCircleLocked]}>
        {iconNode}
      </View>
      <Text style={[styles.achievementTitle, !achievement.unlocked && styles.achievementTitleLocked]}>{achievement.title}</Text>
      <Text style={[styles.achievementDesc, !achievement.unlocked && styles.achievementDescLocked]}>{achievement.description}</Text>
    </TouchableOpacity>
  );
}

export default function LogrosScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const loadData = useCallback(async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let unlockedNow: Awaited<ReturnType<typeof validateAndUnlockAchievements>> = [];
      try {
        unlockedNow = await validateAndUnlockAchievements(uid);
      } catch {
        // Si falla la validacion (ej. sin conexion), seguimos mostrando los logros normalmente.
      }

      if (unlockedNow.length > 0) {
        const first = unlockedNow[0];
        router.push({
          pathname: "/medalla-conseguida",
          params: { title: first.title, description: first.description, next: "/logros" },
        });
      }

      const [logrosSnap, userSnap] = await Promise.all([
        getDocs(collection(db, "logros")),
        getDoc(doc(db, "usuarios", uid)),
      ]);

      const userData = userSnap.exists() ? userSnap.data() : {};
     const metrics: UserMetrics = {
        lecciones_completadas: typeof userData.lecciones_completadas === "number" ? userData.lecciones_completadas : 0,
        materiales_consultados: typeof userData.materiales_consultados === "number" ? userData.materiales_consultados : 0,
        racha_dias: typeof userData.racha_dias === "number" ? userData.racha_dias : 0,
        objetos_reciclados: typeof userData.objetos_reciclados === "number" ? userData.objetos_reciclados : 0,
        retos_completados: typeof userData.retos_completados === "number" ? userData.retos_completados : 0,
        puntos_totales: typeof userData.puntos_totales === "number" ? userData.puntos_totales : 0,
      };

      const docs: AchievementDoc[] = [];

      logrosSnap.forEach((snap) => {
        const data = snap.data() as Record<string, unknown>;
        const activo = typeof data.activo === "boolean" ? data.activo : true;
        if (!activo) {
          return;
        }

        docs.push({
          id: snap.id,
          titulo: typeof data.titulo === "string" ? data.titulo : "Logro",
          descripcion: typeof data.descripcion === "string" ? data.descripcion : "",
          condicionTipo: typeof data.condicion_tipo === "string" ? data.condicion_tipo : "",
          condicionValor: typeof data.condicion_valor === "number" ? data.condicion_valor : 1,
          orden: typeof data.orden === "number" ? data.orden : 999,
          ruta: typeof data.ruta === "string" ? data.ruta : undefined,
          tipo: mapBadgeKind(typeof data.tipo === "string" ? data.tipo : "star"),
        });
      });

      const mapped: Achievement[] = docs
        .sort((a, b) => {
          if (a.orden !== b.orden) {
            return a.orden - b.orden;
          }
          return a.titulo.localeCompare(b.titulo, "es");
        })
        .map((item) => {
          const metricValue = readMetricValue(metrics, item.condicionTipo);
          const unlocked = metricValue >= item.condicionValor;

          return {
            id: item.id,
            title: item.titulo,
            description: item.descripcion,
            unlocked,
            kind: item.tipo,
            onPress:
              unlocked
                ? () =>
                    router.push({
                      pathname: "/logro/[id]",
                      params: { id: item.id },
                    })
                : undefined,
          };
        });

      setAchievements(mapped);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const unlockedCount = useMemo(() => achievements.filter((item) => item.unlocked).length, [achievements]);
  const totalCount = achievements.length;
  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Tus Logros</Text>
        <Text style={styles.pageSubtitle}>Has desbloqueado {unlockedCount} de {totalCount} medallas. ¡Sigue asi!</Text>

        <TouchableOpacity style={styles.impactCard} activeOpacity={0.8}>
          <View style={styles.impactLeft}>
            <View style={styles.impactIconWrap}>
              <Image source={require("../../../assets/images/icons/icons8-hoja-48.png")} style={styles.impactIcon} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.impactTitle}>Mi Impacto</Text>
              <Text style={styles.impactDesc}>Descubre cómo estás ayudando al planeta</Text>
            </View>
          </View>
          <Text style={styles.impactArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={styles.progressLeft}>
              <View style={styles.progressIconWrap}>
                <Image source={require("../../../assets/images/icons/icons8-estrella-24.png")} style={styles.progressIcon} resizeMode="contain" />
              </View>
              <Text style={styles.progressLabel}>Camino de aprendizaje</Text>
            </View>
            <Text style={styles.progressPercent}>{percent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={C.green} size="large" />
          </View>
        ) : (
          <View style={styles.grid}>
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerLogo: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.green,
  },
  bellBtn: {
    padding: 4,
  },
  bellIcon: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  impactCard: {
    backgroundColor: C.deepGreen,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  impactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  impactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  impactIcon: {
    width: 20,
    height: 20,
    tintColor: C.white,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.white,
    marginBottom: 2,
  },
  impactDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 15,
  },
  impactArrow: {
    fontSize: 24,
    color: C.white,
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  progressIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.paleYellow,
    alignItems: "center",
    justifyContent: "center",
  },
  progressIcon: {
    width: 16,
    height: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DCE9FF",
    overflow: "hidden",
  },
  progressFill: {
    width: "0%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: C.green,
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  achievementCard: {
    width: "47%",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    minHeight: 122,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7F4E8",
  },
  achievementCardLocked: {
    backgroundColor: "#FAFDF8",
  },
  achievementIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.paleYellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  achievementIconCircleLocked: {
    backgroundColor: "#EEF3F7",
  },
  achievementIcon: {
    width: 24,
    height: 24,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
    marginBottom: 6,
  },
  achievementTitleLocked: {
    color: "#A7B1BD",
  },
  achievementDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: C.muted,
    textAlign: "center",
  },
  achievementDescLocked: {
    color: "#B0BAC7",
  },
});
