import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export type ImpactoData = {
  residuos_reciclados_kg: number;
  agua_preservada_l: number;
  energia_ahorrada_kwh: number;
  arboles_equivalentes: number;
};

export type ImpactoCompleto = {
  impacto: ImpactoData | null;
  co2_ahorrado_kg: number;
};

export async function obtenerImpacto(uid: string): Promise<ImpactoCompleto> {
  const [impactoSnap, usuarioSnap] = await Promise.all([
    getDoc(doc(db, "impacto", uid)),
    getDoc(doc(db, "usuarios", uid)),
  ]);

  const impacto = impactoSnap.exists()
    ? (impactoSnap.data() as ImpactoData)
    : null;

  const co2_ahorrado_kg = usuarioSnap.exists()
    ? (usuarioSnap.data().co2_ahorrado_kg ?? 0)
    : 0;

  return { impacto, co2_ahorrado_kg };
}