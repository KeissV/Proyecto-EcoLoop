import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../service/firebaseConfig";
import Alerta from "../components/Alerta";

const GREEN = "#3BAB4F";

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje: string; tipo: "error" | "exito" | "info" }>({
    visible: false, titulo: "", mensaje: "", tipo: "info",
  });

  const mostrarAlerta = (titulo: string, mensaje: string, tipo: "error" | "exito" | "info" = "info") => {
    setAlerta({ visible: true, titulo, mensaje, tipo });
  };

  const handleRegistro = async () => {
    if (!nombre || !email || !password) {
      mostrarAlerta("Campos incompletos", "Por favor llena todos los campos.", "error");
      return;
    }
    if (!aceptaTerminos) {
      mostrarAlerta("Términos", "Debes aceptar los términos y condiciones.", "error");
      return;
    }
    if (password.length < 8) {
      mostrarAlerta("Contraseña débil", "La contraseña debe tener al menos 8 caracteres.", "error");
      return;
    }

    try {
      setCargando(true);
      const credencial = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credencial.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        nombre,
        correo: email,
        foto_url: null,
        puntos_totales: 0,
        nivel: "Principiante",
        co2_ahorrado_kg: 0,
        fecha_registro: serverTimestamp(),
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      const mensajes: Record<string, string> = {
        "auth/email-already-in-use": "Ese correo ya está registrado.",
        "auth/invalid-email": "El correo no es válido.",
        "auth/weak-password": "La contraseña es muy débil.",
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

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#444" />
        </TouchableOpacity>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.sub}>
          Únete a EcoLoop y comienza tu camino hacia un mundo más verde.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#bbb"
            value={nombre}
            onChangeText={setNombre}
          />

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

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAceptaTerminos((v) => !v)}
          >
            <View style={[styles.checkbox, aceptaTerminos && styles.checkboxOn]}>
              {aceptaTerminos && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.checkText}>
              Acepto los{" "}
              <Text style={styles.link}>Términos y Condiciones</Text> y la{" "}
              <Text style={styles.link}>Política de Privacidad</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, cargando && { opacity: 0.7 }]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#222", marginBottom: 6 },
  sub: { fontSize: 14, color: "#888", marginBottom: 28, lineHeight: 20 },
  form: { gap: 6 },
  label: { fontSize: 13, color: "#444", marginTop: 10, marginBottom: 4, fontWeight: "500" },
  input: {
    borderWidth: 1, borderColor: "#DDD", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#222",
  },
  inputRow: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#DDD", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, gap: 8,
  },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 14 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
    borderColor: "#CCC", alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  checkboxOn: { backgroundColor: GREEN, borderColor: GREEN },
  checkText: { flex: 1, fontSize: 13, color: "#555", lineHeight: 19 },
  link: { color: GREEN, fontWeight: "500" },
  button: {
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 16, alignItems: "center", marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  loginText: { fontSize: 14, color: "#888" },
  loginLink: { fontSize: 14, color: GREEN, fontWeight: "600" },
});
