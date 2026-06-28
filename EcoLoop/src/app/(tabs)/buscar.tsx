import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";

import {
  fetchWasteItems,
  filterWasteItems,
  rankMostSearched,
  registerWasteSearch,
  type WasteSearchItem,
} from "../../service/wasteSearch";
import { auth, db } from "../../service/firebaseConfig";
import { validateSearchForChallenges } from "../../service/challengesService";
import { validateAndUnlockAchievements } from "../../service/achievementsService";

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

const CATEGORY_META: Record<string, { icon: any; emoji: string; color: string }> = {
  "Orgánico": {
    icon: require("../../../assets/images/icons/organic.jpeg"),
    emoji: "🍌",
    color: C.green,
  },
  "Plástico": {
    icon: require("../../../assets/images/icons/plastic.jpeg"),
    emoji: "🧴",
    color: C.yellow,
  },
  "Papel/Cartón": {
    icon: require("../../../assets/images/icons/paper-carton.jpeg"),
    emoji: "📦",
    color: C.blue,
  },
  Vidrio: {
    icon: require("../../../assets/images/icons/glass.jpeg"),
    emoji: "🍾",
    color: C.blue,
  },
  Metal: {
    icon: require("../../../assets/images/icons/metal.jpeg"),
    emoji: "🥫",
    color: C.orange,
  },
  Peligroso: {
    icon: require("../../../assets/images/icons/hazard.jpeg"),
    emoji: "⚠️",
    color: C.purple,
  },
  General: {
    icon: require("../../../assets/images/icons/tab-search.jpeg"),
    emoji: "♻️",
    color: C.green,
  },
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

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getCategoryMeta(category: string) {
  const normalized = normalizeText(category);

  if (normalized.includes("organ")) {
    return CATEGORY_META["Orgánico"];
  }

  if (normalized.includes("plastic")) {
    return CATEGORY_META["Plástico"];
  }

  if (normalized.includes("papel") || normalized.includes("carton")) {
    return CATEGORY_META["Papel/Cartón"];
  }

  if (normalized.includes("vidrio")) {
    return CATEGORY_META.Vidrio;
  }

  if (normalized.includes("metal") || normalized.includes("alumin")) {
    return CATEGORY_META.Metal;
  }

  if (normalized.includes("pelig") || normalized.includes("hazard")) {
    return CATEGORY_META.Peligroso;
  }

  return CATEGORY_META.General;
}

function Thumbnail({ item }: { item: WasteSearchItem }) {
  const meta = getCategoryMeta(item.category);

  if (item.imageUrl) {
    return <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="cover" />;
  }

  return (
    <View style={[styles.thumbFallback, { backgroundColor: `${meta.color}22` }]}>
      <Text style={styles.thumbEmoji}>{meta.emoji}</Text>
    </View>
  );
}

export default function BuscarScreen() {
  const router = useRouter();
  const { retoId } = useLocalSearchParams<{ retoId?: string }>();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<WasteSearchItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWasteItems() {
      try {
        setLoading(true);
        setError(null);
        const loadedItems = await fetchWasteItems();

        if (!active) {
          return;
        }

        setItems(loadedItems);
      } catch {
        if (!active) {
          return;
        }

        setError("No se pudo cargar la información desde la base de datos.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadWasteItems();

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setQuery("");
    }, [])
  );

  const results = filterWasteItems(items, query);
  const categoryItems = items
    .reduce<{ label: string; total: number }[]>((acc, item) => {
      const existing = acc.find((entry) => normalizeText(entry.label) === normalizeText(item.category));

      if (existing) {
        existing.total += 1;
        return acc;
      }

      acc.push({ label: item.category, total: 1 });
      return acc;
    }, [])
    .sort((left, right) => right.total - left.total)
    .slice(0, 6);
  const popularItems = rankMostSearched(items).slice(0, 5);

  async function openItem(item: WasteSearchItem) {
    setQuery(item.title);

    setRecentSearches((current) => {
      const next = [item.title, ...current.filter((entry) => entry !== item.title)];
      return next.slice(0, 5);
    });

    setItems((current) =>
      current.map((entry) =>
        entry.docId === item.docId
          ? { ...entry, popularity: entry.popularity + 1 }
          : entry
      )
    );

    registerWasteSearch(item, query || item.title).catch(() => {
      // No interrumpe la navegación si falla el contador global.
    });

    const uid = auth.currentUser?.uid;

    if (uid) {
      try {
        await setDoc(
          doc(db, "usuarios", uid),
          {
            lecciones_completadas: increment(1),
            materiales_consultados: increment(1),
            ultimo_ingreso: serverTimestamp(),
          },
          { merge: true }
        );

        const completed = await validateSearchForChallenges(
          uid,
          { materialId: item.docId, category: item.category },
          retoId
        );

        if (completed.length > 0) {
          const first = completed[0];
          router.replace({
            pathname: "/reto-completado",
            params: {
              retoId: first.id,
              points: `${first.puntos}`,
            },
          });
          return;
        }

        const unlocked = await validateAndUnlockAchievements(uid);
        if (unlocked.length > 0) {
          const first = unlocked[0];
          router.push({
            pathname: "/medalla-conseguida",
            params: { title: first.title, description: first.description },
          });
          return;
        }
      } catch {
        // Mantener navegación normal si falla validación.
      }
    }

    router.push({ pathname: "/residuo/[id]", params: { id: item.docId } });
  }

  function openRecentSearch(label: string) {
    setQuery(label);
    const matchedItem = items.find((item) => normalizeText(item.title) === normalizeText(label));

    if (matchedItem) {
      openItem(matchedItem);
    }
  }

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
            value={query}
            onChangeText={setQuery}
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

        {query.trim() ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Resultados</Text>

            {loading ? (
              <View style={styles.feedbackCard}>
                <ActivityIndicator size="small" color={C.green} />
                <Text style={styles.feedbackText}>Consultando la base de datos...</Text>
              </View>
            ) : error ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>{error}</Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>No hay coincidencias para tu búsqueda en Firestore.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {results.map((item) => {
                  const meta = getCategoryMeta(item.category);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.popularRow}
                      onPress={() => openItem(item)}
                    >
                      <Thumbnail item={item} />
                      <View style={styles.popularInfo}>
                        <Text style={styles.popularTitle}>{item.title}</Text>
                        <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
                      </View>
                      <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.blockHeader}>
          <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
          <TouchableOpacity onPress={() => setRecentSearches([])}>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentRow}>
          {recentSearches.map((item) => (
            <TouchableOpacity key={item} style={styles.recentChip} onPress={() => openRecentSearch(item)}>
              <Text style={styles.recentText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!recentSearches.length ? (
          <Text style={styles.emptyRecentText}>Tus búsquedas seleccionadas aparecerán aquí.</Text>
        ) : null}

        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.grid}>
          {categoryItems.map((cat) => {
            const meta = getCategoryMeta(cat.label);

            return (
              <TouchableOpacity key={cat.label} style={styles.categoryCard} onPress={() => setQuery(cat.label)}>
                <Image source={meta.icon} style={styles.categoryIconImage} resizeMode="contain" />
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={styles.categoryCount}>{cat.total} residuos</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!loading && !categoryItems.length ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>No hay categorías disponibles porque Firestore no devolvió residuos.</Text>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Más buscados</Text>
        <View style={styles.list}>
          {popularItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.popularRow} onPress={() => openItem(item)}>
              <View style={styles.popularLeft}>
                <Thumbnail item={item} />
                <View style={styles.popularInfo}>
                  <Text style={styles.popularTitle}>{item.title}</Text>
                  <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={[styles.statusDot, { backgroundColor: getCategoryMeta(item.category).color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {!loading && !popularItems.length ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>Aún no hay búsquedas globales registradas.</Text>
          </View>
        ) : null}
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
  sectionBlock: {
    marginBottom: 20,
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
    marginBottom: 10,
  },
  emptyRecentText: {
    color: C.textMuted,
    fontSize: 14,
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
  categoryCount: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 6,
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
    flex: 1,
  },
  thumbImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
    backgroundColor: "#F1F5F9",
  },
  thumbFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  thumbEmoji: { fontSize: 20 },
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
  popularInfo: {
    justifyContent: "center",
    flex: 1,
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
    marginLeft: 12,
  },
  feedbackCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  feedbackText: {
    flex: 1,
    color: C.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});