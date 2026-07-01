import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { fetchWasteDetail, type WasteDetail } from "../../../service/wasteSearch";

const C = {
  green: "#3BAB4F",
  bg: "#F7F7F7",
  white: "#FFFFFF",
  text: "#222222",
  textMuted: "#777777",
  border: "#E5E5E5",
  amber: "#D89200",
  blue: "#377FC9",
  lightGreen: "#E8F5E9",
};

const LOCAL_IMAGES: Record<string, any> = {
  "bottle-detail.jpeg": require("../../../../assets/images/icons/bottle-detail.jpeg"),
  "banana-detail.jpeg": require("../../../../assets/images/icons/banana-detail.jpeg"),
  "paper-carton.jpeg": require("../../../../assets/images/icons/paper-carton.jpeg"),
  "plastic.jpeg": require("../../../../assets/images/icons/plastic.jpeg"),
  "glass.jpeg": require("../../../../assets/images/icons/glass.jpeg"),
  "metal.jpeg": require("../../../../assets/images/icons/metal.jpeg"),
  "hazard.jpeg": require("../../../../assets/images/icons/hazard.jpeg"),
  "organic.jpeg": require("../../../../assets/images/icons/organic.jpeg"),
  "tab-search.jpeg": require("../../../../assets/images/icons/tab-search.jpeg"),
};

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function resolveLocalImage(item: WasteDetail) {
  if (item.imageKey && LOCAL_IMAGES[item.imageKey]) {
    return LOCAL_IMAGES[item.imageKey];
  }

  return null;
}

function resolveImageSource(item: WasteDetail, remoteFailed: boolean) {
  if (!remoteFailed && item.imageUrl) {
    return { uri: item.imageUrl };
  }

  const localImage = resolveLocalImage(item);

  if (localImage) {
    return localImage;
  }

  return null;
}

export default function ResiduoDetalleScreen() {
  const router = useRouter();
  const { id, rewardRetoId, rewardPoints, rewardLevelUp, rewardLevelName, rewardTitle, rewardDescription } = useLocalSearchParams<{
    id?: string;
    rewardRetoId?: string;
    rewardPoints?: string;
    rewardLevelUp?: string;
    rewardLevelName?: string;
    rewardTitle?: string;
    rewardDescription?: string;
  }>();
  const [item, setItem] = useState<WasteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [remoteImageFailed, setRemoteImageFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const detail = await fetchWasteDetail(id);

        if (active) {
          setItem(detail);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    setRemoteImageFailed(false);
  }, [item?.docId, item?.imageUrl]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={styles.centered}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={styles.feedback}>Cargando material...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={styles.centered}>
          <Text style={styles.feedback}>No se encontró este material en la base de datos.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.replace("/buscar")}>
            <Text style={styles.actionButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const imageSource = resolveImageSource(item, remoteImageFailed);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/buscar")}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoLoop</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rewardRetoId ? (
          <View style={styles.rewardNoticeCard}>
            <View style={styles.rewardNoticeHeader}>
              <Text style={styles.rewardNoticeEmoji}>{rewardTitle ? "🎉" : "✅"}</Text>
              <Text style={styles.rewardNoticeTitle}>
                {rewardTitle ? "Reto cumplido y medalla conseguida" : "Reto completado"}
              </Text>
            </View>
            <Text style={styles.rewardNoticeDescription}>
              {rewardTitle
                ? "Completaste uno de tus retos activos y ademas desbloqueaste una nueva medalla."
                : "Excelente, validar este material completo uno de tus retos activos."}
            </Text>
            <TouchableOpacity
              style={styles.rewardNoticeButton}
              onPress={() =>
                router.push({
                  pathname: "/reto-completado",
                  params: {
                    retoId: rewardRetoId,
                    points: rewardPoints ?? "0",
                    levelUp: rewardLevelUp ?? undefined,
                    levelName: rewardLevelName ?? undefined,
                    achievementTitle: rewardTitle ?? undefined,
                    achievementDescription: rewardDescription ?? undefined,
                  },
                })
              }
            >
              <Text style={styles.rewardNoticeButtonText}>Reclamar recompensa</Text>
              <Text style={styles.rewardNoticeButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : rewardTitle || rewardDescription ? (
          <View style={styles.rewardNoticeCard}>
            <View style={styles.rewardNoticeHeader}>
              <Text style={styles.rewardNoticeEmoji}>🏅</Text>
              <Text style={styles.rewardNoticeTitle}>Conseguiste una medalla</Text>
            </View>
            <Text style={styles.rewardNoticeDescription}>Ya ganaste una nueva medalla por tu progreso. Puedes verla ahora.</Text>
            <TouchableOpacity
              style={styles.rewardNoticeButton}
              onPress={() =>
                router.push({
                  pathname: "/medalla-conseguida",
                  params: {
                    title: rewardTitle,
                    description: rewardDescription,
                    next: "/buscar",
                  },
                })
              }
            >
              <Text style={styles.rewardNoticeButtonText}>Reclamar recompensa</Text>
              <Text style={styles.rewardNoticeButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.productCard}>
          <View style={styles.cardAccent} />
          <View style={styles.imageContainer}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.productImage}
                resizeMode="contain"
                onError={() => setRemoteImageFailed(true)}
              />
            ) : (
              <Text style={styles.heroEmoji}>{item.iconEmoji}</Text>
            )}
          </View>
          <Text style={styles.heroTitle}>{item.title}</Text>
          <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{item.recyclable ? "Altamente reciclable" : "Manejo especial"}</Text>
            </View>
          </View>
          <Text style={styles.heroDescription}>{item.description}</Text>
          <View style={styles.badgesRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>Categoría: {item.category}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Contenedor: {item.container}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Tipo: {item.materialType}</Text></View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleIcon}>✅</Text>
            <Text style={styles.sectionTitle}>Pasos para reciclar</Text>
          </View>
          {!item.steps.length ? (
            <Text style={styles.sectionHint}>No hay pasos específicos registrados para este material.</Text>
          ) : (
            item.steps
              .sort((a, b) => a.numero - b.numero)
              .map((step) => (
                <View key={`${item.docId}-${step.numero}`} style={styles.stepRow}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepNumber}>{step.numero}</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>{step.titulo}</Text>
                    <Text style={styles.stepDesc}>{step.descripcion}</Text>
                  </View>
                </View>
              ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Impacto ecológico</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatNumber(item.impact.co2Kg)} kg</Text>
              <Text style={styles.statLabel}>CO2 evitado</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: C.blue }]}>{formatNumber(item.impact.waterL)} L</Text>
              <Text style={styles.statLabel}>Agua preservada</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: C.amber }]}>{formatNumber(item.impact.energyKwh)} kWh</Text>
              <Text style={styles.statLabel}>Energía ahorrada</Text>
            </View>
          </View>
          {item.impact.note ? <Text style={styles.impactNote}>{item.impact.note}</Text> : null}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  feedback: {
    marginTop: 12,
    color: C.textMuted,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    width: 38,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
    gap: 14,
  },
  rewardNoticeCard: {
    backgroundColor: "#EAF8ED",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CAE7D0",
    padding: 14,
  },
  rewardNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardNoticeEmoji: {
    fontSize: 18,
  },
  rewardNoticeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E7D3A",
  },
  rewardNoticeDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: C.textMuted,
  },
  rewardNoticeButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardNoticeButtonText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
  rewardNoticeButtonArrow: {
    color: C.white,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 14,
  },
  productCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
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
    width: 128,
    height: 128,
    borderRadius: 30,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  productImage: {
    width: 98,
    height: 98,
  },
  heroEmoji: {
    fontSize: 62,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
  },
  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badgePill: {
    backgroundColor: "#A7F0A0",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  heroDescription: {
    marginTop: 10,
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
    textAlign: "center",
  },
  badgesRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: C.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeText: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  sectionTitleIcon: {
    fontSize: 17,
  },
  sectionHint: {
    color: C.textMuted,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "700",
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  stepDesc: {
    color: C.textMuted,
    lineHeight: 19,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    backgroundColor: "#F5FAF6",
    borderRadius: 14,
    padding: 12,
    minWidth: "31%",
    borderWidth: 1,
    borderColor: "#E1EFE4",
  },
  statValue: {
    color: C.green,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: C.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  impactNote: {
    marginTop: 12,
    color: C.text,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: C.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});