import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../service/firebaseConfig";
import Alerta from "../components/Alerta";
import { SvgXml } from "react-native-svg";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#eafaec";

const googleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
`;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [alerta, setAlerta] = useState<{ visible: boolean; titulo: string; mensaje: string; tipo: "error" | "exito" | "info" }>({
    visible: false, titulo: "", mensaje: "", tipo: "info",
  });

  const mostrarAlerta = (titulo: string, mensaje: string, tipo: "error" | "exito" | "info" = "info") => {
    setAlerta({ visible: true, titulo, mensaje, tipo });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      mostrarAlerta("Campos incompletos", "Por favor llena todos los campos.", "error");
      return;
    }
    try {
      setCargando(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      const mensajes: Record<string, string> = {
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/invalid-email": "El correo no es válido.",
        "auth/user-not-found": "No existe una cuenta con ese correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
      };
      mostrarAlerta("Error", mensajes[error.code] ?? "Ocurrió un error, intenta de nuevo.", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setCargandoGoogle(true);
      const resultado = await signInWithPopup(auth, googleProvider);
      const user = resultado.user;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nombre: user.displayName ?? "Usuario",
          correo: user.email,
          foto_url: user.photoURL ?? null,
          puntos_totales: 0,
          nivel: "Principiante",
          co2_ahorrado_kg: 0,
          fecha_registro: serverTimestamp(),
        });
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        mostrarAlerta("Error", "No se pudo iniciar sesión con Google.", "error");
      }
    } finally {
      setCargandoGoogle(false);
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
        contentContainerStyle={styles.outer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.logo}>EcoLoop</Text>
          <Text style={styles.welcome}>¡Qué bueno verte de nuevo! Continúa tu camino verde.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
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
              style={styles.forgotRow}
              onPress={() => router.push("/recuperar")}
            >
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, cargando && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>O continúa con</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, cargandoGoogle && { opacity: 0.7 }]}
              onPress={handleGoogle}
              disabled={cargandoGoogle}
            >
              {cargandoGoogle ? (
                <ActivityIndicator color="#555" />
              ) : (
                <>
                  <SvgXml xml={googleSvg} width={20} height={20} />
                  <Text style={styles.googleText}>Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/registro")}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexGrow: 1,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logo: {
    fontSize: 30,
    fontFamily: "serif",
    fontWeight: "700",
    color: "#1a6027",
    textAlign: "center",
    marginBottom: 6,
  },
  welcome: { fontSize: 16, fontWeight: "600", color: "#888", textAlign: "center" },
  sub: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 24 },
  form: { gap: 8 },
  label: { fontSize: 13, color: "#444", marginTop: 10, marginBottom: 4, fontWeight: "500" },
  inputRow: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#DDD", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: "#222" },
  forgotRow: { alignSelf: "flex-end", marginTop: 4 },
  forgot: { fontSize: 13, color: GREEN },
  button: {
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 16, alignItems: "center", marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: "#EEE" },
  dividerText: { fontSize: 13, color: "#888" },
  googleButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#DDD", borderRadius: 12, paddingVertical: 14, gap: 10,
  },
  googleText: { fontSize: 15, color: "#444" },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  registerText: { fontSize: 14, color: "#888" },
  registerLink: { fontSize: 14, color: GREEN, fontWeight: "600" },
});
