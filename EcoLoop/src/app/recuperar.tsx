import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../service/firebaseConfig";
import Alerta from "../components/Alerta";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";

export default function Recuperar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje: string; tipo: "error" | "exito" | "info" }>({
    visible: false, titulo: "", mensaje: "", tipo: "info",
  });

  const mostrarAlerta = (titulo: string, mensaje: string, tipo: "error" | "exito" | "info" = "info") => {
    setAlerta({ visible: true, titulo, mensaje, tipo });
  };

  const handleEnviar = async () => {
    if (!email) {
      mostrarAlerta("Campo vacío", "Por favor ingresa tu correo.", "error");
      return;
    }

    try {
      setCargando(true);
      await sendPasswordResetEmail(auth, email);
      router.push({ pathname: "/correo-enviado", params: { email } });
    } catch (error: any) {
      const mensajes: Record<string, string> = {
        "auth/invalid-email": "El correo no es válido.",
        "auth/user-not-found": "No existe una cuenta con ese correo.",
      };
      mostrarAlerta("Error", mensajes[error.code] ?? "Ocurrió un error, intenta de nuevo.", "error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Alerta
        visible={alerta.visible}
        titulo={alerta.titulo}
        mensaje={alerta.mensaje}
        tipo={alerta.tipo}
        onClose={() => setAlerta((a) => ({ ...a, visible: false }))}
      />

      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={40} color={GREEN} />
        </View>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.sub}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@correo.com"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, cargando && { opacity: 0.7 }]}
          onPress={handleEnviar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar instrucciones</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#fff",
    paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40,
  },
  back: { marginBottom: 32 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: GREEN_LIGHT,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#222", textAlign: "center", marginBottom: 10 },
  sub: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 21, marginBottom: 32 },
  label: { fontSize: 13, color: "#444", fontWeight: "500", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#DDD", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#222", marginBottom: 24,
  },
  button: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
