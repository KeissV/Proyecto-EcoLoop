import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="leaf" size={48} color="#fff" />
      </View>
      <Text style={styles.title}>EcoLoop</Text>
      <Text style={styles.subtitle}>El ciclo empieza aquí</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: GREEN,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
});
