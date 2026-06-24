import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const C = {
  green: "#3BAB4F",
  bg: "#F7F7F7",
  white: "#FFFFFF",
  text: "#222222",
  textMuted: "#777777",
  border: "#E5E5E5",
  yellow: "#F5C518",
  orange: "#FF8C00",
  blue: "#4A9EE0",
  purple: "#A76BE9",
};

const recentSearches = ["Botella de plástico", "Cáscara de banana"];
const categories = [
  { icon: require("../../../assets/images/icons/organic.jpeg"), label: "Orgánico" },
  { icon: require("../../../assets/images/icons/plastic.jpeg"), label: "Plástico" },
  { icon: require("../../../assets/images/icons/paper-carton.jpeg"), label: "Papel/Cartón" },
  { icon: require("../../../assets/images/icons/glass.jpeg"), label: "Vidrio" },
  { icon: require("../../../assets/images/icons/metal.jpeg"), label: "Metal" },
  { icon: require("../../../assets/images/icons/hazard.jpeg"), label: "Peligroso" },
];
const popularItems = [
  { icon: "🧴", title: "Botella PET", subtitle: "Plástico", color: C.yellow },
  { icon: "🍌", title: "Cáscara de fruta", subtitle: "Orgánico", color: C.green },
  { icon: "📰", title: "Periódico", subtitle: "Papel", color: C.blue },
  { icon: "🥫", title: "Lata de refresco", subtitle: "Aluminio", color: C.orange },
  { icon: "📦", title: "Caja de cartón", subtitle: "Papel", color: C.purple },
];

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

export default function BuscarScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Buscar residuo</Text>

        <View style={styles.searchCard}>
          <Image
            source={require("../../../assets/images/icons/tab-search.jpeg")}
            style={styles.searchIconImage}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué quieres reciclar?"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require("../../../assets/images/icons/camera.jpeg")}
              style={styles.iconButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require("../../../assets/images/icons/mic.jpeg")}
              style={styles.iconButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.blockHeader}>
          <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
          <TouchableOpacity>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentRow}>
          {recentSearches.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.recentChip}
              onPress={item === "Cáscara de banana" ? () => router.push("/cascara-banana") : undefined}
            >
              <Text style={styles.recentText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryCard}
              onPress={cat.label === "Plástico" ? () => router.push("/plasticos") : undefined}
            >
              <Image source={cat.icon} style={styles.categoryIconImage} resizeMode="contain" />
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Más buscados</Text>
        <View style={styles.list}>
          {popularItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.popularRow}
              onPress={
                item.title === "Botella PET"
                  ? () => router.push("/botella-pet")
                  : undefined
              }
            >
              <View style={styles.popularLeft}>
                <View style={styles.popularIconWrap}>
                  {typeof item.icon === "string" ? (
                    <Text style={styles.popularIcon}>{item.icon}</Text>
                  ) : (
                    <Image source={item.icon} style={styles.popularIconImage} resizeMode="contain" />
                  )}
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularTitle}>{item.title}</Text>
                  <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={[styles.statusDot, { backgroundColor: item.color }]} />
            </TouchableOpacity>
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
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    marginBottom: 18,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchIconImage: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: C.text,
    minHeight: 40,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  iconButtonText: {
    fontSize: 18,
  },
  iconButtonImage: {
    width: 18,
    height: 18,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.green,
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
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  recentChip: {
    backgroundColor: C.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
    marginBottom: 8,
  },
  recentText: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    minHeight: 110,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryIconImage: {
    width: 36,
    height: 36,
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  list: {
    marginTop: 8,
  },
  popularRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  popularLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  popularIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F4F8F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  popularIcon: {
    fontSize: 22,
  },
  popularIconImage: {
    width: 26,
    height: 26,
  },
  popularInfo: {
    justifyContent: "center",
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  popularSubtitle: {
    fontSize: 13,
    color: C.textMuted,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});