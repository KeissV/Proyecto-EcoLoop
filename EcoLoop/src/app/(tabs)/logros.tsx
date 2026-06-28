import React from "react";
import {
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

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "Primer Paso",
      description: "Completaste tu primera lección ambiental.",
      unlocked: true,
      kind: "star",
    },
    {
      id: "2",
      title: "Reciclador\nNovato",
      description: "Separaste tus primeros 10 objetos.",
      unlocked: true,
      kind: "recycle",
    },
    {
      id: "3",
      title: "Racha Activa",
      description: "7 días seguidos aprendiendo en la app.",
      unlocked: true,
      kind: "fire",
      onPress: () => router.push("/logro-racha-activa"),
    },
    {
      id: "4",
      title: "Maestro\nCompost",
      description: "Crea tu primer compostaje en casa.",
      unlocked: false,
      kind: "compost",
    },
    {
      id: "5",
      title: "Cero Plástico",
      description: "Una semana sin plásticos de un solo uso.",
      unlocked: false,
      kind: "blocked",
    },
    {
      id: "6",
      title: "Héroe Local",
      description: "Participa en una limpieza comunitaria.",
      unlocked: false,
      kind: "walk",
    },
    {
      id: "7",
      title: "Ahorro Energía",
      description: "Reduce tu consumo eléctrico un 10%.",
      unlocked: false,
      kind: "energy",
    },
    {
      id: "8",
      title: "Guardián del\nAgua",
      description: "Completa el módulo de conservación de agua.",
      unlocked: false,
      kind: "water",
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Header />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Tus Logros</Text>
        <Text style={styles.pageSubtitle}>Has desbloqueado 3 de 8 medallas. ¡Sigue así!</Text>

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
            <Text style={styles.progressPercent}>38%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.grid}>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
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
    width: "38%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: C.green,
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
