import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export type HistorialItem = {
  id: string;
  titulo: string;
  descripcion: string;
  puntos_ganados: number;
  fecha: Date;
  tipo: string;
};

export type HistorialSeccion = {
  titulo: string;
  items: HistorialItem[];
};

function clasificarFecha(fecha: Date): "Hoy" | "Ayer" | "Esta semana" | "Antes" {
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());

  const fechaSolo = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

  if (fechaSolo.getTime() === hoy.getTime()) return "Hoy";
  if (fechaSolo.getTime() === ayer.getTime()) return "Ayer";
  if (fechaSolo >= inicioSemana) return "Esta semana";
  return "Antes";
}

export async function obtenerHistorial(uid: string): Promise<HistorialSeccion[]> {
  const q = query(
    collection(db, "historial"),
    where("uid_usuario", "==", uid)
  );

  const snap = await getDocs(q);

  const items: HistorialItem[] = snap.docs.map((doc) => {
    const data = doc.data();
    const fecha =
      data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date();

    return {
      id: doc.id,
      titulo: data.titulo ?? "",
      descripcion: data.descripcion ?? "",
      puntos_ganados: data.puntos_ganados ?? 0,
      fecha,
      tipo: data.tipo ?? "reto",
    };
  });

  items.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const secciones: Record<string, HistorialItem[]> = {
    Hoy: [],
    Ayer: [],
    "Esta semana": [],
    Antes: [],
  };

  items.forEach((item) => {
    const seccion = clasificarFecha(item.fecha);
    secciones[seccion].push(item);
  });

  return Object.entries(secciones)
    .filter(([, items]) => items.length > 0)
    .map(([titulo, items]) => ({ titulo, items }));
}