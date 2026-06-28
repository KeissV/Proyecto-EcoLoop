import React from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TouchableOpacity, Image,
} from "react-native";
import { useRouter } from "expo-router";

const C = {
  green: "#3BAB4F",
  darkGreen: "#1E7D3A",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F3F4F6",
  yellow: "#F5C518",
};

const steps = [
  {
    id: "1",
    title: "Abre el buscador",
    description: "Accede a la sección de búsqueda desde el menú inferior.",
  },
  {
    id: "2",
    title: "Busca un residuo",
    description: "Escribe el nombre de un objeto que tengas dudas de cómo reciclar.",
  },
  {
    id: "3",
    title: "Aprende y clasifica",
    description: "Lee la información de clasificación y guárdalo en tu historial.",
  },
];

export default function RetoAprendizajeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoLoop</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrap}>
            <Image
              source={require("../../../assets/images/icons/icons8-buscar-25.png")}
              style={styles.heroIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Identifica un material</Text>
          <Text style={styles.heroDesc}>
            Usa el buscador para aprender sobre diferentes tipos de materiales y cómo reciclarlos correctamente.
          </Text>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardLeft}>
            <Text style={styles.rewardLabel}>Recompensa al completar</Text>
            <Text style={styles.rewardTitle}>Puntos de{"\n"}Conocimiento</Text>
          </View>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardStar}>⭐</Text>
            <Text style={styles.rewardPoints}>+30</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>¿Cómo completarlo?</Text>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{step.id}</Text>
                </View>
                {index < steps.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/reto-completado")}>
          <Text style={styles.ctaText}>¡Completar Reto!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { fontSize: 28, color: C.text, lineHeight: 32 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.darkGreen },
  headerSpacer: { width: 36 },

  content: { padding: 20, paddingBottom: 100 },

  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#DDE8F5",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  heroIcon: { width: 52, height: 52 },
  heroTitle: {
    fontSize: 24, fontWeight: "800", color: C.text,
    marginBottom: 12, textAlign: "center",
  },
  heroDesc: {
    fontSize: 14, color: C.muted, textAlign: "center",
    lineHeight: 22,
  },

  rewardCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  rewardLeft: { flex: 1 },
  rewardLabel: { fontSize: 11, color: C.muted, marginBottom: 4 },
  rewardTitle: { fontSize: 17, fontWeight: "800", color: C.text, lineHeight: 24 },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9E7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  rewardStar: { fontSize: 20 },
  rewardPoints: { fontSize: 20, fontWeight: "800", color: C.yellow },

  sectionTitle: {
    fontSize: 18, fontWeight: "800", color: C.text,
    marginBottom: 16,
  },

  stepsContainer: { gap: 0 },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  stepLeft: { alignItems: "center", marginRight: 14, width: 30 },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.green,
    alignItems: "center", justifyContent: "center",
  },
  stepNumber: { color: C.white, fontWeight: "800", fontSize: 14 },
  stepLine: {
    width: 2, flex: 1, minHeight: 20,
    backgroundColor: C.border,
    marginVertical: 2,
  },
  stepBody: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  stepTitle: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: C.muted, lineHeight: 19 },

  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  ctaButton: {
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: C.white, fontSize: 17, fontWeight: "800" },
});
