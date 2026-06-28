import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";

export default function CorreoEnviado() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.successCircle}>
        <Ionicons name="mail-open-outline" size={48} color={GREEN} />
      </View>

      <Text style={styles.title}>¡Revisa tu correo!</Text>
      <Text style={styles.sub}>
        Enviamos instrucciones para restablecer tu contraseña a:
      </Text>
      <Text style={styles.emailDestino}>{email}</Text>
      <Text style={styles.hint}>
        Si no lo ves en unos minutos, revisa tu carpeta de spam.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.buttonText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reenviarRow}
        onPress={() => router.replace("/recuperar")}
      >
        <Text style={styles.reenviarText}>¿Correo incorrecto? </Text>
        <Text style={styles.reenviarLink}>Intenta de nuevo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
  },
  sub: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 21,
  },
  emailDestino: {
    fontSize: 15,
    fontWeight: "600",
    color: GREEN,
    textAlign: "center",
    marginVertical: 8,
  },
  hint: {
    fontSize: 13,
    color: "#AAA",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reenviarRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  reenviarText: {
    fontSize: 14,
    color: "#888",
  },
  reenviarLink: {
    fontSize: 14,
    color: GREEN,
    fontWeight: "600",
  },
});
