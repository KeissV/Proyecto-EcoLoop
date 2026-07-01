import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../service/firebaseConfig";
import { getLevelForPoints } from "../../service/levelService";

const C = {
  green: "#22C55E",
  darkGreen: "#0E7A34",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#5F6B7A",
  border: "#D7E3F3",
  bg: "#F3F6FB",
  paleBlue: "#EDF4FF",
  yellow: "#E7B008",
};

export default function RetoCompletadoScreen() {
  const router = useRouter();
  const { points, levelUp, achievementTitle, achievementDescription } = useLocalSearchParams<{
    points?: string;
    levelUp?: string;
    levelName?: string;
    achievementTitle?: string;
    achievementDescription?: string;
  }>();
  const rewardPoints = points && !Number.isNaN(Number(points)) ? Number(points) : 50;
  const didLevelUp = levelUp === "1";
  // El nivel (nombre + numero) se calcula siempre desde los puntos guardados en
  // Firestore, para que "Nivel 1", "Nivel 2", etc. sea consistente sin importar
  // desde que pantalla se llego aqui (reto manual, reto de busqueda, categoria...).
  const [levelInfo, setLevelInfo] = useState<{ number: number; name: string } | null>(null);
  // El logro solo viene como param; esta pantalla NO verifica logros por su cuenta.
  const pendingAchievement = achievementTitle
    ? { title: achievementTitle, description: achievementDescription ?? "" }
    : null;

  useEffect(() => {
    let active = true;

    async function loadCurrentLevel() {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "usuarios", uid));
        const userPoints =
          userSnap.exists() && typeof userSnap.data().puntos_totales === "number" ? userSnap.data().puntos_totales : 0;

        if (active) {
          const level = getLevelForPoints(userPoints);
          setLevelInfo({ number: level.level, name: level.name });
        }
      } catch {
        // Si falla, se deja sin nivel; no interrumpe la pantalla de recompensa.
      }
    }

    loadCurrentLevel();

    return () => {
      active = false;
    };
  }, []);

  function handleContinue() {
    if (pendingAchievement) {
      router.replace({
        pathname: "/medalla-conseguida",
        params: { title: pendingAchievement.title, description: pendingAchievement.description, next: "/retos" },
      });
      return;
    }

    router.replace("/retos");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.title}>¡Lo lograste!</Text>
          <Text style={styles.description}>
            Has completado un reto con éxito.
            {"\n"}
            Cada pequeña acción cuenta para un
            {"\n"}
            planeta más verde.
          </Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardBox}>
              <View style={styles.rewardIconCircle}>
                <Image
                  source={require("../../../assets/images/icons/icons8-estrella-24.png")}
                  style={styles.rewardIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.rewardValue}>+{rewardPoints}</Text>
              <Text style={styles.rewardLabel}>Puntos</Text>
            </View>

            <View style={styles.rewardBox}>
              <View style={[styles.rewardIconCircle, styles.rewardIconGreenCircle]}>
                <Image
                  source={require("../../../assets/images/icons/icons8-verificado-30.png")}
                  style={styles.rewardIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.rewardName}>{levelInfo ? `Nivel ${levelInfo.number} · ${levelInfo.name}` : "..."}</Text>
              <Text style={styles.rewardLabel}>{didLevelUp ? "Nuevo Nivel" : "Nivel actual"}</Text>
            </View>
          </View>

         <TouchableOpacity style={styles.ctaButton} onPress={handleContinue}>
              <Text style={styles.ctaText}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  checkCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  checkIcon: {
    fontSize: 42,
    lineHeight: 42,
    color: C.darkGreen,
    fontWeight: "900",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 25,
    color: C.muted,
    textAlign: "center",
    marginBottom: 22,
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 26,
  },
  rewardBox: {
    flex: 1,
    backgroundColor: C.paleBlue,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },
  rewardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7E9AE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  rewardIconGreenCircle: {
    backgroundColor: "#CFF4DC",
  },
  rewardIcon: {
    width: 20,
    height: 20,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: C.yellow,
    marginBottom: 2,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: "800",
    color: C.darkGreen,
    marginBottom: 2,
    textAlign: "center",
  },
  rewardLabel: {
    fontSize: 13,
    color: C.text,
    textAlign: "center",
  },
  ctaButton: {
    width: "100%",
    backgroundColor: C.darkGreen,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: C.white,
    fontSize: 18,
    fontWeight: "800",
  },
});