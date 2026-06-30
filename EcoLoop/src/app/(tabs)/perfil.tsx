import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nivel 1</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={20} color="#3BAB4F" />
            <Text style={styles.statValue}>2,450</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={20} color="#3BAB4F" />
            <Text style={styles.statValue}>0 días</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={20} color="#3BAB4F" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Insignias</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flag-outline" size={20} color="#3BAB4F" />
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Retos</Text>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.menuContainer}>
          {[
            { icon: "settings-outline", label: "Configuración", route: "/configuracion" },
            { icon: "bar-chart-outline", label: "Ranking", route: "/ranking" },
            { icon: "people-outline", label: "Amigos", route: "/amigos" },
            { icon: "book-outline", label: "Tutorial", route: "/tutorial" },
            { icon: "information-circle-outline", label: "Acerca de", route: "/acerca-de" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route)}
            >
              <Ionicons name={item.icon as any} size={22} color="#3BAB4F" style={{ marginRight: 12 }} />
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#777" />
            </TouchableOpacity>
          ))}

          {/* Botón cerrar sesión en rojo */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3BAB4F", // verde encendido exacto
    paddingVertical: 50, // más grueso
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: { marginLeft: 12 },
  userName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  userEmail: { color: "#E0E0E0", fontSize: 14 },
  levelBadge: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  levelText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    margin: 16,
    elevation: 3,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontWeight: "700", fontSize: 16, color: "#000" },
  statLabel: { fontSize: 12, color: "#555" },
  menuContainer: { padding: 16 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  menuText: { flex: 1, fontSize: 15, color: "#000", fontWeight: "500" },
  logoutButton: {
    borderRadius: 12,
    backgroundColor: "#E74C3C", // rojo
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});

