import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export type AchievementUnlocked = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type AchievementGlobal = {
  id: string;
  title: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  type: string;
  active: boolean;
  order: number;
};

type UserMetrics = {
  lecciones_completadas: number;
  materiales_consultados: number;
  racha_dias: number;
  objetos_reciclados: number;
  retos_completados: number;
  puntos_totales: number;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toAchievementGlobal(id: string, data: Record<string, unknown>): AchievementGlobal {
  return {
    id,
    title: typeof data.titulo === "string" ? data.titulo : "Logro",
    description: typeof data.descripcion === "string" ? data.descripcion : "",
    conditionType: typeof data.condicion_tipo === "string" ? data.condicion_tipo : "",
    conditionValue: typeof data.condicion_valor === "number" ? data.condicion_valor : 1,
    type: typeof data.tipo === "string" ? data.tipo : "star",
    active: typeof data.activo === "boolean" ? data.activo : true,
    order: typeof data.orden === "number" ? data.orden : 999,
  };
}

function readMetricValue(metrics: UserMetrics, conditionType: string) {
  const normalized = normalizeText(conditionType);

  if (normalized.includes("materiales") || normalized.includes("consultados")) {
    return metrics.materiales_consultados;
  }

  if (normalized.includes("lecciones")) {
    return metrics.lecciones_completadas;
  }

  if (normalized.includes("racha")) {
    return metrics.racha_dias;
  }

  if (normalized.includes("objetos") || normalized.includes("reciclados")) {
    return metrics.objetos_reciclados;
  }

  if (normalized.includes("retos")) {
    return metrics.retos_completados;
  }

  if (normalized.includes("puntos")) {
    return metrics.puntos_totales;
  }

  return 0;
}

async function fetchMetrics(uid: string): Promise<UserMetrics> {
  const userSnap = await getDoc(doc(db, "usuarios", uid));
  const user = userSnap.exists() ? userSnap.data() : {};

  return {
    lecciones_completadas: typeof user.lecciones_completadas === "number" ? user.lecciones_completadas : 0,
    materiales_consultados: typeof user.materiales_consultados === "number" ? user.materiales_consultados : 0,
    racha_dias: typeof user.racha_dias === "number" ? user.racha_dias : 0,
    objetos_reciclados: typeof user.objetos_reciclados === "number" ? user.objetos_reciclados : 0,
    retos_completados: typeof user.retos_completados === "number" ? user.retos_completados : 0,
    puntos_totales: typeof user.puntos_totales === "number" ? user.puntos_totales : 0,
  };
}

export async function validateAndUnlockAchievements(uid: string) {
  const [metrics, globalSnap] = await Promise.all([
    fetchMetrics(uid),
    getDocs(collection(db, "logros")),
  ]);

  const globalAchievements: AchievementGlobal[] = [];
  globalSnap.forEach((item) => {
    const parsed = toAchievementGlobal(item.id, item.data() as Record<string, unknown>);
    if (parsed.active) {
      globalAchievements.push(parsed);
    }
  });

  globalAchievements.sort((a, b) => a.order - b.order);

  // Solo nos interesan los logros cuya condicion ya se cumple con las metricas actuales.
  const candidates = globalAchievements.filter((achievement) => {
    const value = readMetricValue(metrics, achievement.conditionType);
    return value >= achievement.conditionValue;
  });

  const newUnlocked: AchievementUnlocked[] = [];

  for (const achievement of candidates) {
    const achievementRef = doc(db, "usuarios", uid, "logros_usuario", achievement.id);

    // Esta funcion se llama desde varias pantallas (buscar, retos, logros...) y puede
    // dispararse casi al mismo tiempo mas de una vez. Antes se hacia un simple
    // "leer todos los logros ya desbloqueados" y luego "escribir" por separado, lo que
    // permitia que dos llamadas casi simultaneas leyeran el logro como "todavia no
    // desbloqueado" y las dos lo entregaran de nuevo (por eso la primera medalla podia
    // repetirse). Usando una transaccion, Firestore garantiza que, sin importar cuantas
    // veces o que tan seguido se llame esta funcion, cada logro solo se pueda marcar
    // como "recien desbloqueado" una unica vez para siempre.
    const wasJustUnlocked = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(achievementRef);

      if (snap.exists() && snap.data().desbloqueado === true) {
        return false;
      }

      transaction.set(
        achievementRef,
        {
          logro_id: achievement.id,
          desbloqueado: true,
          fecha_desbloqueo: serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    });

    if (wasJustUnlocked) {
      newUnlocked.push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        type: achievement.type,
      });
    }
  }

  return newUnlocked;
}
