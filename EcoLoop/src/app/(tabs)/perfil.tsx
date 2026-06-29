import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";

import { auth } from "../../service/firebaseConfig";

export default function PerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const displayName = useMemo(() => {
    if (user?.displayName && user.displayName.trim().length > 0) {
      return user.displayName;
    }

    if (user?.email) {
      return user.email;
    }

    return "Usuario";
  }, [user]);

  async function handleLogout() {
    try {
      setLoading(true);
      await signOut(auth);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>{displayName}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.logoutText}>Cerrar sesion</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 24,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#3BAB4F", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  logoutButton: {
    minWidth: 190,
    borderRadius: 12,
    backgroundColor: "#3BAB4F",
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});