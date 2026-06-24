import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const C = {
  green: "#2FBF6B",
  deepGreen: "#089047",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F2F4F7",
  cardBlue: "#EAF1FF",
  cardGreen: "#3ACB74",
  amber: "#E5A100",
  red: "#E04646",
};

type PlasticCode = {
  id: string;
  short: string;
  title: string;
  description: string;
  idColor: string;
  statusIcon: string;
  status: string;
  statusColor: string;
};

const codes: PlasticCode[] = [
  {
    id: "1",
    short: "PET",
    title: "Polietileno Tereftalato",
    description: "Botellas de agua, refrescos, envases de aceite.",
    idColor: C.deepGreen,
    statusIcon: "◉",
    status: "ALTAMENTE RECICLABLE",
    statusColor: C.deepGreen,
  },
  {
    id: "2",
    short: "HDPE",
    title: "Polietileno de Alta Densidad",
    description: "Envases de leche, detergentes, champú.",
    idColor: C.deepGreen,
    statusIcon: "◉",
    status: "ALTAMENTE RECICLABLE",
    statusColor: C.deepGreen,
  },
  {
    id: "3",
    short: "PVC",
    title: "Cloruro de Polivinilo",
    description: "Tuberías, cables, algunos blísteres.",
    idColor: C.red,
    statusIcon: "△",
    status: "DIFÍCIL DE RECICLAR",
    statusColor: C.red,
  },
  {
    id: "4",
    short: "LDPE",
    title: "Polietileno de Baja Densidad",
    description: "Bolsas de supermercado, film transparente.",
    idColor: C.amber,
    statusIcon: "ⓘ",
    status: "REQUIERE PUNTOS ESPECIALES",
    statusColor: C.amber,
  },
  {
    id: "5",
    short: "PP",
    title: "Polipropileno",
    description: "Tapas de botellas, envases de yogur, pajitas.",
    idColor: C.deepGreen,
    statusIcon: "◉",
    status: "RECICLABLE",
    statusColor: C.deepGreen,
  },
];

export default function PlasticosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plásticos</Text>
        <TouchableOpacity style={styles.headerIconButton}>
          <Text style={styles.headerIcon}>⌂</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroCircle}>
            <Image source={require("../../../assets/images/icons/recycle-icon.png")} style={styles.heroIcon} resizeMode="contain" />
          </View>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>GUÍA DE MATERIAL</Text>
          </View>
          <Text style={styles.heroTitle}>Entendiendo los Plásticos</Text>
          <Text style={styles.heroDesc}>
            No todos los plásticos son iguales. Aprende a identificarlos para un reciclaje efectivo y evita la contaminación cruzada.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>ANTES DE RECICLAR</Text>

        <View style={styles.beforeRow}>
          <View style={styles.beforeCard}>
            <Image source={require("../../../assets/images/icons/rinse-icon.png")} style={styles.beforeIcon} resizeMode="contain" />
            <Text style={styles.beforeTitle}>Enjuaga</Text>
            <Text style={styles.beforeHint}>Quita restos</Text>
          </View>
          <View style={styles.beforeCard}>
            <Image source={require("../../../assets/images/icons/dry-icon.png")} style={styles.beforeIcon} resizeMode="contain" />
            <Text style={styles.beforeTitle}>Seca</Text>
            <Text style={styles.beforeHint}>Evita moho</Text>
          </View>
        </View>

        <View style={styles.flattenCard}>
          <Image source={require("../../../assets/images/icons/flatten-icon.png")} style={styles.flattenIcon} resizeMode="contain" />
          <View>
            <Text style={styles.flattenTitle}>Aplasta el envase</Text>
            <Text style={styles.flattenHint}>Ahorra espacio en el contenedor</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CÓDIGOS DE IDENTIFICACIÓN</Text>

        {codes.map((item) => (
          <View key={item.id} style={styles.codeCard}>
            <View style={styles.codeIdBox}>
              <Text style={[styles.codeId, { color: item.idColor }]}>{item.id}</Text>
              <Text style={styles.codeShort}>{item.short}</Text>
            </View>
            <View style={styles.codeBody}>
              <Text style={styles.codeTitle}>{item.title}</Text>
              <Text style={styles.codeDesc}>{item.description}</Text>
              <Text style={[styles.codeStatus, { color: item.statusColor }]}>{item.statusIcon} {item.status}</Text>
            </View>
          </View>
        ))}
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
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerIconButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 22,
    color: C.text,
  },
  headerTitle: {
    fontSize: 24 / 1.6,
    fontWeight: "700",
    color: C.text,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  heroCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  heroIcon: {
    width: 28,
    height: 28,
  },
  tagPill: {
    backgroundColor: "#E8EDF3",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  heroTitle: {
    fontSize: 22 / 1.3,
    fontWeight: "800",
    color: C.text,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 16 / 1.35,
    color: C.muted,
    textAlign: "center",
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 8,
    marginTop: 4,
  },
  beforeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  beforeCard: {
    flex: 1,
    backgroundColor: C.cardBlue,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  beforeIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  beforeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  beforeHint: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  flattenCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  flattenIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  flattenTitle: {
    color: "#0B5E33",
    fontSize: 13,
    fontWeight: "800",
  },
  flattenHint: {
    color: "#1C7A44",
    fontSize: 10,
    marginTop: 2,
  },
  codeCard: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  codeIdBox: {
    width: 56,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ECF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  codeId: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 16,
  },
  codeShort: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 2,
  },
  codeBody: {
    flex: 1,
  },
  codeTitle: {
    fontSize: 16 / 1.1,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  codeDesc: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 6,
  },
  codeStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
});
