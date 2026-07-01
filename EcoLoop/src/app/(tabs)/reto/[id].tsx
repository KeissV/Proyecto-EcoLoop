import React, { useEffect, useMemo, useState } from "react";
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

import { auth } from "../../../service/firebaseConfig";
import {
  addManualProgress,
  completeChallenge,
  canonicalCategoryKey,
  getChallengeById,
  getUserChallenge,
  hasCategoryRequirement,
  markChallengeInProgress,
  type ChallengeGlobal,
} from "../../../service/challengesService";
import { validateAndUnlockAchievements } from "../../../service/achievementsService";

const C = {
  green: "#2FC35B",
  darkGreen: "#219A46",
  white: "#FFFFFF",
  text: "#1F2533",
  muted: "#5E6470",
  border: "#D9DEE6",
  bg: "#EFF1F5",
  paleBlue: "#DEE6F8",
  gold: "#D8A627",
  paleGold: "#F7F0DA",
};

const ICONS: Record<string, any> = {
  "recycle-icon.png": require("../../../../assets/images/icons/recycle-icon.png"),
  "tab-search.jpeg": require("../../../../assets/images/icons/tab-search.jpeg"),
  "reto-accion.jpeg": require("../../../../assets/images/icons/reto-accion.jpeg"),
  "reto-social.jpeg": require("../../../../assets/images/icons/reto-social.jpeg"),
  "reto-clasificacion.jpeg": require("../../../../assets/images/icons/reto-clasificacion.jpeg"),
  "hazard.jpeg": require("../../../../assets/images/icons/hazard.jpeg"),
};

type Step = { id: string; title: string; description: string };

function resolveIcon(iconLocal: string) {
  return ICONS[iconLocal] || ICONS["tab-search.jpeg"];
}

function buildSteps(challenge: ChallengeGlobal): Step[] {
  if (challenge.validacion_accion === "buscar_material_especifico") {
    const targets = challenge.validacion_materiales.length
      ? challenge.validacion_materiales.join(", ")
      : "material objetivo";

    return [
      { id: "1", title: "Abre el buscador", description: "Accede a la seccion de busqueda desde el menu inferior." },
      { id: "2", title: "Busca el material", description: `Debes encontrar: ${targets}.` },
      { id: "3", title: "Abre la ficha", description: "Al abrir el detalle se valida el avance del reto." },
    ];
  }

  if (challenge.validacion_accion === "buscar_materiales_distintos") {
    return [
      { id: "1", title: "Abre el buscador", description: "Entra en Buscar desde la barra inferior." },
      {
        id: "2",
        title: "Busca materiales diferentes",
        description: `Necesitas validar ${challenge.validacion_objetivo} materiales distintos.`,
      },
      { id: "3", title: "Abre cada resultado", description: "Cada material nuevo suma progreso automaticamente." },
    ];
  }

  if (challenge.validacion_accion === "buscar_categoria") {
    return [
      { id: "1", title: "Abre el buscador", description: "Accede a la seccion Buscar." },
      {
        id: "2",
        title: "Filtra por categoria",
        description: `Encuentra un material de la categoria: ${challenge.validacion_categoria}.`,
      },
      { id: "3", title: "Confirma en el detalle", description: "La validacion se realiza al abrir la ficha." },
    ];
  }

  if (challenge.validacion_accion === "buscar_categorias_requeridas") {
    const categories = challenge.validacion_categorias.length
      ? challenge.validacion_categorias.join(", ")
      : "categorias requeridas";

    return [
      { id: "1", title: "Abre el buscador", description: "Entra a Buscar desde el menu principal." },
      { id: "2", title: "Valida categorias", description: `Debes validar materiales de: ${categories}.` },
      {
        id: "3",
        title: "Completa el objetivo",
        description: `Objetivo total: ${challenge.validacion_objetivo}.`,
      },
    ];
  }

  if (hasCategoryRequirement(challenge)) {
    const hasSpecificCategory =
      challenge.validacion_categorias.length > 0 || challenge.validacion_categoria.trim().length > 0;
    const categories = challenge.validacion_categorias.length
      ? challenge.validacion_categorias.join(", ")
      : challenge.validacion_categoria;

    return [
      { id: "1", title: "Abre el buscador", description: "Accede a la seccion Buscar desde el menu inferior." },
      {
        id: "2",
        title: hasSpecificCategory ? "Revisa la categoria" : "Elige una categoria",
        description: hasSpecificCategory
          ? `Entra a la guia de la categoria: ${categories}.`
          : "Selecciona cualquier categoria de residuos para repasar su clasificacion.",
      },
      { id: "3", title: "Confirma la revision", description: "El reto se valida automaticamente al abrir esa categoria." },
    ];
  }

  if (challenge.validacion_accion === "avance_manual") {
    return [
      { id: "1", title: "Realiza la actividad", description: challenge.descripcion },
      { id: "2", title: "Marca tu avance", description: "Pulsa el boton para sumar progreso del reto." },
      {
        id: "3",
        title: "Completa el objetivo",
        description: `Meta total: ${challenge.validacion_objetivo}.`,
      },
    ];
  }

  return [
    { id: "1", title: "Lee la mision", description: challenge.descripcion },
    { id: "2", title: "Realiza la accion", description: "Completa el reto en tu contexto real." },
    { id: "3", title: "Confirma finalizacion", description: "Pulsa el boton para validar el reto." },
  ];
}

function actionLabel(challenge: ChallengeGlobal, completed: boolean) {
  if (completed) {
    return "Reto completado";
  }

  if (
    challenge.validacion_accion === "buscar_materiales_distintos" ||
    challenge.validacion_accion === "buscar_material_especifico" ||
    challenge.validacion_accion === "buscar_categoria" ||
    challenge.validacion_accion === "buscar_categorias_requeridas"
  ) {
    return "Ir al buscador";
  }

  if (hasCategoryRequirement(challenge)) {
    const hasSpecificCategory =
      challenge.validacion_categorias.length > 0 || challenge.validacion_categoria.trim().length > 0;
    return hasSpecificCategory ? "Revisar categoria" : "Ir al buscador";
  }

  if (challenge.validacion_accion === "avance_manual") {
    return "Registrar avance";
  }

  return "Completar reto";
}

export default function RetoDinamicoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [challenge, setChallenge] = useState<ChallengeGlobal | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 1, completed: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const uid = auth.currentUser?.uid;

      if (!id || !uid) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const challengeData = await getChallengeById(id);

        if (!challengeData) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        await markChallengeInProgress(uid, id);
        const userChallenge = await getUserChallenge(uid, id, challengeData.validacion_objetivo);

        if (active) {
          setChallenge(challengeData);
          setProgress({
            current: userChallenge?.progreso_actual ?? 0,
            total: userChallenge?.progreso_total ?? challengeData.validacion_objetivo,
            completed: userChallenge?.completado ?? false,
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const steps = useMemo(() => (challenge ? buildSteps(challenge) : []), [challenge]);

  async function onPrimaryAction() {
    const uid = auth.currentUser?.uid;

    if (!uid || !challenge || !id) {
      return;
    }

    if (progress.completed) {
      router.push("/retos");
      return;
    }

    try {
      setSaving(true);

      if (
        challenge.validacion_accion === "buscar_materiales_distintos" ||
        challenge.validacion_accion === "buscar_material_especifico" ||
        challenge.validacion_accion === "buscar_categoria" ||
        challenge.validacion_accion === "buscar_categorias_requeridas"
      ) {
        router.push({
          pathname: "/buscar",
          params: { retoId: id },
        });
        return;
      }

      if (hasCategoryRequirement(challenge)) {
        const hasSpecificCategory =
          challenge.validacion_categorias.length > 0 || challenge.validacion_categoria.trim().length > 0;

        if (!hasSpecificCategory || challenge.validacion_categorias.length > 1) {
          router.push({
            pathname: "/buscar",
            params: { retoId: id },
          });
          return;
        }

        const targetCategory = challenge.validacion_categorias[0] || challenge.validacion_categoria;
        router.push({
          pathname: "/categoria/[slug]",
          params: { slug: canonicalCategoryKey(targetCategory), retoId: id },
        });
        return;
      }

      if (challenge.validacion_accion === "avance_manual") {
        const result = await addManualProgress(uid, id, 1);

        if (result.completed) {
          let achievementTitle: string | undefined;
          let achievementDescription: string | undefined;
          try {
            const unlocked = await validateAndUnlockAchievements(uid);
            if (unlocked.length > 0) {
              achievementTitle = unlocked[0].title;
              achievementDescription = unlocked[0].description;
            }
          } catch {}
          router.replace({
            pathname: "/reto-completado",
            params: {
              retoId: id,
              points: `${result.challenge.puntos}`,
              levelUp: result.levelUp ? "1" : undefined,
              levelName: result.levelName || undefined,
              achievementTitle,
              achievementDescription,
            },
          });
          return;
        }

        const refreshed = await getUserChallenge(uid, id, challenge.validacion_objetivo);
        setProgress({
          current: refreshed?.progreso_actual ?? 0,
          total: refreshed?.progreso_total ?? challenge.validacion_objetivo,
          completed: refreshed?.completado ?? false,
        });
        return;
      }

      const completed = await completeChallenge(uid, id);
      let achievementTitle: string | undefined;
      let achievementDescription: string | undefined;
      try {
        const unlocked = await validateAndUnlockAchievements(uid);
        if (unlocked.length > 0) {
          achievementTitle = unlocked[0].title;
          achievementDescription = unlocked[0].description;
        }
      } catch {}
      router.replace({
        pathname: "/reto-completado",
        params: {
          retoId: id,
          points: `${completed.puntos}`,
          levelUp: completed.levelUp ? "1" : undefined,
          levelName: completed.levelName || undefined,
          achievementTitle,
          achievementDescription,
        },
      });
    } finally {
      setSaving(false);
    }
  }

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

  if (!challenge) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyText}>No se encontro este reto.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/retos")}>
            <Text style={styles.ctaText}>Volver a Retos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/retos")}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoLoop</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={styles.heroIconWrap}>
            <Image source={resolveIcon(challenge.icono_local)} style={styles.heroIcon} resizeMode="contain" />
          </View>

          <Text style={styles.heroTitle}>{challenge.titulo}</Text>
          <Text style={styles.heroDesc}>{challenge.descripcion}</Text>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardLabel}>Recompensa al completar</Text>
            <Text style={styles.rewardTitle}>Puntos de Conocimiento</Text>
          </View>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardBadgeText}>⭐ +{challenge.puntos}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>¿Como completarlo?</Text>

        <View style={styles.stepsWrap}>
          {steps.map((step) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepBubble}>
                <Text style={styles.stepBubbleText}>{step.id}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressValue}>{progress.current}/{progress.total}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaButton, progress.completed && styles.ctaButtonDisabled]}
          onPress={onPrimaryAction}
          disabled={saving || progress.completed}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>{actionLabel(challenge, progress.completed)}</Text>
          )}
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
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: C.text,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.darkGreen,
    fontFamily: "serif",
  },
  headerSpacer: {
    width: 34,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  heroWrap: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: C.paleBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#CFD7E8",
  },
  heroIcon: {
    width: 54,
    height: 54,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 16,
    lineHeight: 24,
    color: C.muted,
    textAlign: "center",
    maxWidth: 360,
  },

  rewardCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rewardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: C.text,
  },
  rewardBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5C875",
    backgroundColor: C.paleGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rewardBadgeText: {
    color: C.gold,
    fontWeight: "700",
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: C.text,
    marginBottom: 10,
  },

  stepsWrap: {
    gap: 10,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepBubbleText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "800",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
  },

  progressInfo: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  progressLabel: {
    color: C.muted,
    fontWeight: "700",
    fontSize: 14,
  },
  progressValue: {
    color: C.text,
    fontWeight: "800",
    fontSize: 16,
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
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  ctaButton: {
    backgroundColor: C.green,
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonDisabled: {
    backgroundColor: C.muted,
  },
  ctaText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
  },
});