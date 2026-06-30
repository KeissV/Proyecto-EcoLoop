import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const API_KEY = "AIzaSyDGl0cgsIuzi7K53lLNZg_wKoX6anC7iqw";
const email = "demo.ecoloop.app@gmail.com";
const password = "EcoLoop#2026";

async function authenticate() {
  const signupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const signup = await signupRes.json();

  if (signup.localId) {
    return signup;
  }

  if (signup?.error?.message === "EMAIL_EXISTS") {
    const signinRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const signin = await signinRes.json();

    if (signin.localId) {
      return signin;
    }

    throw new Error(signin?.error?.message || "SIGNIN_FAILED");
  }

  throw new Error(signup?.error?.message || "SIGNUP_FAILED");
}

async function run() {
  const user = await authenticate();

  const app = initializeApp({
    apiKey: API_KEY,
    authDomain: "ecoloop-5eaec.firebaseapp.com",
    projectId: "ecoloop-5eaec",
    storageBucket: "ecoloop-5eaec.firebasestorage.app",
    messagingSenderId: "805318585727",
    appId: "1:805318585727:web:70ad23b1e1124d78debe4a",
  });

  const db = getFirestore(app);

  await setDoc(
    doc(db, "usuarios", user.localId),
    {
      nombre: "Usuario Demo",
      correo: email,
      foto_url: null,
      puntos_totales: 2450,
      nivel: "Eco Avanzado",
      co2_ahorrado_kg: 124.5,
      racha_dias: 7,
      lecciones_completadas: 12,
      retos_completados: 18,
      objetos_reciclados: 43,
      ultimo_ingreso: serverTimestamp(),
      fecha_registro: serverTimestamp(),
      activo: true,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "impacto", user.localId),
    {
      residuos_reciclados_kg: 32,
      agua_preservada_l: 180,
      energia_ahorrada_kwh: 54,
      arboles_equivalentes: 6,
      ultima_actualizacion: serverTimestamp(),
    },
    { merge: true }
  );

  console.log("DEMO_READY");
  console.log(`email=${email}`);
  console.log(`uid=${user.localId}`);
}

run().catch((error) => {
  console.error("DEMO_ERROR", error?.message || error);
  process.exit(1);
});
