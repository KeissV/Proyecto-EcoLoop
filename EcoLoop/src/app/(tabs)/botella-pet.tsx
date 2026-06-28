import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const C = {
  green: "#3BAB4F",
  white: "#FFFFFF",
  text: "#222222",
  textMuted: "#777777",
  border: "#E5E5E5",
  lightGreen: "#E8F5E9",
  yellow: "#F5C518",
  blue: "#4A9EE0",
  gray: "#F7F7F7",
  darkGray: "#6E6E6E",
};

export default function BotellaPetScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.gray} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoLoop</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productCard}>
          <View style={styles.cardAccent} />
          <View style={styles.imageContainer}>
            <Image source={require("../../../assets/images/icons/bottle-detail.jpeg")} style={styles.productImage} resizeMode="contain" />
          </View>
          <Text style={styles.productTitle}>Botella PET</Text>
          <Text style={styles.productSubtitle}>Plástico Tipo 1 (Polietileno Tereftalato)</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Image source={require("../../../assets/images/icons/recycle-icon.png")} style={styles.badgeIcon} resizeMode="contain" />
              <Text style={styles.badgeText}>Altamente Reciclable</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Image source={require("../../../assets/images/icons/checklist-icon.jpeg")} style={styles.sectionIcon} resizeMode="contain" />
            <Text style={styles.sectionTitle}>Pasos para reciclar</Text>
          </View>
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleGreen]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Vacía el contenido</Text>
                <Text style={styles.stepDescription}>Asegúrate de que no queden líquidos.</Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleGreen]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Aplasta la botella</Text>
                <Text style={styles.stepDescription}>Reduce su volumen para ahorrar espacio.</Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleGreen]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Tápala de nuevo</Text>
                <Text style={styles.stepDescription}>Conserva la tapa puesta para reciclarla junta.</Text>
              </View>
            </View>
            <View style={[styles.stepItem, styles.stepItemLast]}>
              <View style={[styles.stepCircle, styles.stepCircleYellow]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Contenedor Amarillo</Text>
                <Text style={styles.stepDescription}>Depósitala en el punto de reciclaje adecuado.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impacto ecológico</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Image source={require("../../../assets/images/icons/impact-energy.jpeg")} style={styles.statIconSmall} resizeMode="contain" />
              <Text style={styles.statValue}>-60%</Text>
              <Text style={styles.statLabel}>Menos energía en producción</Text>
            </View>
            <View style={[styles.statCard, styles.statCardYellow]}>
              <Image source={require("../../../assets/images/icons/impact-water.jpeg")} style={styles.statIconSmall} resizeMode="contain" />
              <Text style={[styles.statValue, styles.statValueYellow]}>20L</Text>
              <Text style={styles.statLabel}>Agua ahorrada por kilo</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/")}>
          <Image source={require("../../../assets/images/icons/map-pin.png")} style={styles.actionButtonIcon} resizeMode="contain" />
          <Text style={styles.actionButtonText}>Encontrar punto de reciclaje</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: C.green,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  productCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    backgroundColor: "rgba(59, 186, 79, 0.08)",
    borderBottomLeftRadius: 100,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 30,
    backgroundColor: C.gray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  productImage: {
    width: 110,
    height: 110,
  },
  productTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
  },
  productSubtitle: {
    fontSize: 14,
    color: C.darkGray,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#A7F0A0",
  },
  badgePillAlt: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
  },
  badgeTextAlt: {
    color: C.text,
  },
  section: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 16,
  },
  stepsContainer: {
    paddingVertical: 6,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    position: "relative",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  stepCircleGreen: {
    backgroundColor: C.green,
  },
  stepCircleYellow: {
    backgroundColor: C.yellow,
  },
  stepNumber: {
    color: C.white,
    fontWeight: "700",
  },
  stepLine: {
    position: "absolute",
    left: 16,
    top: 40,
    width: 2,
    bottom: 0,
    backgroundColor: C.border,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  stepItemLast: {
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.lightGreen,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  statCardAlt: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  statCardYellow: {
    backgroundColor: "#FFF7E0",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  statIconSmall: {
    width: 28,
    height: 28,
    marginBottom: 12,
  },
  statValueYellow: {
    color: C.yellow,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.green,
    borderRadius: 18,
    minHeight: 88,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  actionButtonIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  actionButtonText: {
    color: C.white,
    fontSize: 19,
    fontWeight: "700",
  },
});