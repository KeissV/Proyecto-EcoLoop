import React, { useEffect } from "react";
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
import { auth } from "../../service/firebaseConfig";
import { validateAndUnlockAchievements } from "../../service/achievementsService";

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
  const { points } = useLocalSearchParams<{ points?: string }>();
  const rewardPoints = points && !Number.isNaN(Number(points)) ? Number(points) : 50;

  useEffect(() => {
    let active = true;

    async function validateAchievements() {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        return;
      }

      const unlocked = await validateAndUnlockAchievements(uid);

      if (active && unlocked.length > 0) {
        const first = unlocked[0];
        router.replace({
          pathname: "/medalla-conseguida",
          params: { title: first.title, description: first.description },
        });
      }
    }

    validateAchievements();

    return () => {
      active = false;
    };
  }, [router]);

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
            Has completado tu reto de la semana.
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
              <Text style={styles.rewardName}>Defensor</Text>
              <Text style={styles.rewardLabel}>Nuevo Nivel</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/retos")}>
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
    fontSize: 18,
    fontWeight: "800",
    color: C.darkGreen,
    marginBottom: 2,
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
