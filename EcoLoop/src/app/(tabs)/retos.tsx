import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TouchableOpacity, Image,
} from "react-native";

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

type Reto = {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  icon: any;
  time: string;
  points: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  done?: boolean;
};

const retos: Reto[] = [
  {
    id: "1",
    tag: "CLASIFICACIÓN",
    tagColor: "#3BAB4F",
    tagBg: "#E8F5E9",
    icon: require("../../../assets/images/icons/recycle-icon.png"),
    time: "10 min",
    points: "50",
    title: "Separa 3 tipos de residuos",
    description: "Clasifica correctamente tus desechos hoy.",
    progress: 2,
    total: 3,
  },
  {
    id: "2",
    tag: "APRENDIZAJE",
    tagColor: "#4A9EE0",
    tagBg: "#E8F4FF",
    icon: require("../../../assets/images/icons/tab-search.jpeg"),
    time: "5 min",
    points: "30",
    title: "Identifica un material",
    description: "Usa el buscador para aprender sobre el PET.",
    progress: 0,
    total: 1,
  },
  {
    id: "3",
    tag: "ACCIÓN",
    tagColor: "#B45309",
    tagBg: "#FEF3C7",
    icon: require("../../../assets/images/icons/reto-accion.jpeg"),
    time: "30 min",
    points: "100",
    title: "Crea una botella eco-brick",
    description: "Rellena una botella PET con plásticos.",
    progress: 1,
    total: 10,
  },
  {
    id: "4",
    tag: "SOCIAL",
    tagColor: "#059669",
    tagBg: "#D1FAE5",
    icon: require("../../../assets/images/icons/reto-social.jpeg"),
    time: "5 min",
    points: "25",
    title: "Comparte un tip ecológico",
    description: "Enseña a alguien algo nuevo hoy.",
    progress: 1,
    total: 1,
    done: true,
  },
];

function RetoCard({ reto, onPress }: { reto: Reto; onPress?: () => void }) {
  const pct = reto.total > 0 ? reto.progress / reto.total : 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconWrap}>
          <Image source={reto.icon} style={styles.cardIcon} resizeMode="contain" />
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
  const [activeTab, setActiveTab] = useState<Tab>("En curso");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.darkGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogo}>🌍</Text>
          <Text style={styles.headerTitle}>EcoLoop</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
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
              <Text style={styles.rachaSubtitle}>¡7 días seguidos cuidando el planeta!</Text>
            </View>
          </View>
          <Image source={require("../../../assets/images/icons/icons8-hoja-48.png")} style={styles.rachaWatermark} resizeMode="contain" />
        </View>

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

        {/* Retos */}
        {retos.map((r) => (
          <RetoCard
            key={r.id}
            reto={r}
            onPress={r.title === "Identifica un material" ? () => router.push("/reto-aprendizaje") : undefined}
          />
        ))}

        {/* Reto Bonus */}
        <View style={styles.bonusCard}>
          <View style={styles.bonusHeader}>
            <Image source={require("../../../assets/images/icons/icons8-estrellas-24.png")} style={styles.bonusStar} resizeMode="contain" />
            <Text style={styles.bonusTag}>RETO BONUS</Text>
          </View>
          <Text style={styles.bonusTitle}>¡Completa todos los retos!</Text>
          <Text style={styles.bonusDesc}>Gana 50 puntos extra al completar los 4 retos del día.</Text>
          <View style={styles.bonusFooter}>
            <Text style={styles.bonusBtnText}>Progreso</Text>
            <Text style={styles.bonusProgress}>1/4 completados</Text>
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.darkGreen },
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
