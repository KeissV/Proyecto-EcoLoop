import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const C = {
  overlay: "rgba(16, 24, 40, 0.38)",
  card: "#FFFFFF",
  green: "#22C55E",
  dark: "#1F2937",
  muted: "#6B7280",
};

export default function MedallaConseguidaScreen() {
  const router = useRouter();
  const { title, description, next } = useLocalSearchParams<{ title?: string; description?: string; next?: string }>();
  const nextRoute = next && next.startsWith("/") ? next : "/logros";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.overlay} />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badge}>🏅</Text>
          </View>

          <Text style={styles.title}>Nueva medalla conseguida</Text>
          <Text style={styles.medalTitle}>{title || "Medalla desbloqueada"}</Text>
          <Text style={styles.description}>{description || "Has cumplido una condicion de logro."}</Text>

          <TouchableOpacity style={styles.button} onPress={() => router.replace(nextRoute)}>
            <Text style={styles.buttonText}>Genial</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.overlay },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: C.card,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: "center",
  },
  badgeWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAFBEF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  badge: { fontSize: 36 },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: C.dark,
    marginBottom: 8,
    textAlign: "center",
  },
  medalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.green,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
    textAlign: "center",
    marginBottom: 18,
  },
  button: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
