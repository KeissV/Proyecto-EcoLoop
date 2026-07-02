import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebaseConfig";

// Sistema de racha (dias consecutivos usando la app / completando acciones).
//
// Antes, el campo "racha_dias" del usuario solo se LEIA (en retos.tsx, logros.tsx,
// achievementsService.ts) pero nunca se escribia en ningun lugar del proyecto, asi
// que siempre mostraba el mismo valor (normalmente 0). Este servicio es el que
// realmente calcula y actualiza la racha en base a la fecha.

export type StreakResult = {
  racha_dias: number;
  changed: boolean;
};

function todayKey(date: Date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetweenKeys(fromKey: string, toKey: string) {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);

  if ([fy, fm, fd, ty, tm, td].some((n) => Number.isNaN(n))) {
    return null;
  }

  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / 86400000);
}

/**
 * Registra actividad del usuario para el dia de hoy y recalcula su racha de
 * dias consecutivos.
 *
 * Reglas:
 * - Si hoy ya se habia registrado actividad, no cambia nada (evita que abrir
 *   la app varias veces el mismo dia infle la racha).
 * - Si la ultima actividad registrada fue AYER, la racha sube en 1.
 * - Si la ultima actividad fue hace 2 o mas dias (o nunca hubo), la racha se
 *   reinicia a 1 (hoy cuenta como el primer dia de la nueva racha).
 *
 * Es seguro llamarla desde varias pantallas (ej. al entrar a "Retos" o al
 * completar un reto): solo tiene efecto una vez por dia real.
 */
export async function registerDailyActivity(uid: string): Promise<StreakResult> {
  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};

  const previousStreak = typeof data.racha_dias === "number" ? data.racha_dias : 0;
  const lastActivityKey = typeof data.ultima_fecha_racha === "string" ? data.ultima_fecha_racha : null;
  const today = todayKey();

  if (lastActivityKey === today) {
    return { racha_dias: previousStreak, changed: false };
  }

  const gap = lastActivityKey ? daysBetweenKeys(lastActivityKey, today) : null;
  const nextStreak = gap === 1 ? previousStreak + 1 : 1;

  await setDoc(
    userRef,
    {
      racha_dias: nextStreak,
      ultima_fecha_racha: today,
      ultimo_ingreso: serverTimestamp(),
    },
    { merge: true }
  );

  return { racha_dias: nextStreak, changed: true };
}
