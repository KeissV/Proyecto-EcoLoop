import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export type UsuarioData = {
  nombre: string;
  correo: string;
  foto_url: string | null;
  puntos_totales: number;
  nivel: string;
  co2_ahorrado_kg: number;
  racha_dias: number;
};

export async function obtenerUsuario(uid: string): Promise<UsuarioData | null> {
  const snap = await getDoc(doc(db, "usuarios", uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    nombre: data.nombre ?? "Usuario",
    correo: data.correo ?? "",
    foto_url: data.foto_url ?? null,
    puntos_totales: data.puntos_totales ?? 0,
    nivel: data.nivel ?? "Principiante",
    co2_ahorrado_kg: data.co2_ahorrado_kg ?? 0,
    racha_dias: data.racha_dias ?? 0,
  };
}