import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

type ChallengeStatus = "disponible" | "en_curso" | "terminado";

export type ChallengeValidationAction =
  | "manual_confirmacion"
  | "avance_manual"
  | "buscar_materiales_distintos"
  | "buscar_material_especifico"
  | "buscar_categoria"
  | "buscar_categorias_requeridas";

export type ChallengeGlobal = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  puntos: number;
  tiempo_min: number;
  progreso_total: number;
  tag: string;
  tag_color: string;
  tag_bg: string;
  icono_local: string;
  ruta: string;
  activo: boolean;
  destacado: boolean;
  orden: number;
  validacion_accion: ChallengeValidationAction;
  estado_inicial: ChallengeStatus;
  validacion_objetivo: number;
  validacion_materiales: string[];
  validacion_categoria: string;
  validacion_categorias: string[];
};

export type ChallengeUser = {
  reto_id: string;
  estado: ChallengeStatus;
  progreso_actual: number;
  progreso_total: number;
  completado: boolean;
  fecha_inicio?: unknown;
  fecha_completado?: unknown;
  puntos_otorgados: number;
};

export type ChallengeView = {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  iconLocal: string;
  time: string;
  points: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  done: boolean;
  status: ChallengeStatus;
  route?: string;
  validationAction: ChallengeValidationAction;
  validationTarget: number;
};

export type SearchEvidence = {
  materialId: string;
  category: string;
};

const SEARCH_VALIDATION_ACTIONS: ChallengeValidationAction[] = [
  "buscar_materiales_distintos",
  "buscar_material_especifico",
  "buscar_categoria",
  "buscar_categorias_requeridas",
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function isSearchValidation(action: ChallengeValidationAction) {
  return SEARCH_VALIDATION_ACTIONS.includes(action);
}

function parseChallengeGlobal(id: string, data: Record<string, unknown>): ChallengeGlobal | null {
  const titulo = typeof data.titulo === "string" ? data.titulo : "";

  if (!titulo) {
    return null;
  }

  const actionRaw = typeof data.validacion_accion === "string" ? data.validacion_accion : "manual_confirmacion";
  const validationAction: ChallengeValidationAction =
    actionRaw === "avance_manual" ||
    actionRaw === "buscar_materiales_distintos" ||
    actionRaw === "buscar_material_especifico" ||
    actionRaw === "buscar_categoria" ||
    actionRaw === "buscar_categorias_requeridas" ||
    actionRaw === "manual_confirmacion"
      ? actionRaw
      : "manual_confirmacion";

  const progressTotal = typeof data.progreso_total === "number" ? data.progreso_total : 1;
  const validationTargetRaw = typeof data.validacion_objetivo === "number" ? data.validacion_objetivo : progressTotal;

  return {
    id,
    titulo,
    descripcion: typeof data.descripcion === "string" ? data.descripcion : "",
    tipo: typeof data.tipo === "string" ? data.tipo : "general",
    puntos: typeof data.puntos === "number" ? data.puntos : 0,
    tiempo_min: typeof data.tiempo_min === "number" ? data.tiempo_min : 0,
    progreso_total: progressTotal,
    tag: typeof data.tag === "string" ? data.tag : "RETO",
    tag_color: typeof data.tag_color === "string" ? data.tag_color : "#3BAB4F",
    tag_bg: typeof data.tag_bg === "string" ? data.tag_bg : "#E8F5E9",
    icono_local: typeof data.icono_local === "string" ? data.icono_local : "recycle-icon.png",
    ruta: typeof data.ruta === "string" ? data.ruta : "",
    activo: typeof data.activo === "boolean" ? data.activo : true,
    destacado: typeof data.destacado === "boolean" ? data.destacado : false,
    orden: typeof data.orden === "number" ? data.orden : 0,
    validacion_accion: validationAction,
    estado_inicial: data.estado_inicial === "en_curso" ? "en_curso" : "disponible",
    validacion_objetivo: validationTargetRaw > 0 ? validationTargetRaw : 1,
    validacion_materiales: parseStringArray(data.validacion_materiales),
    validacion_categoria: typeof data.validacion_categoria === "string" ? data.validacion_categoria : "",
    validacion_categorias: parseStringArray(data.validacion_categorias),
  };
}

function parseChallengeUser(data: Record<string, unknown>, fallbackId: string, fallbackTotal: number): ChallengeUser {
  const progressCurrent = typeof data.progreso_actual === "number" ? data.progreso_actual : 0;
  const progressTotal = typeof data.progreso_total === "number" ? data.progreso_total : fallbackTotal;
  const completed = typeof data.completado === "boolean" ? data.completado : false;

  return {
    reto_id: typeof data.reto_id === "string" ? data.reto_id : fallbackId,
    estado:
      data.estado === "en_curso" || data.estado === "terminado" || data.estado === "disponible"
        ? data.estado
        : completed
          ? "terminado"
          : progressCurrent > 0
            ? "en_curso"
            : "disponible",
    progreso_actual: progressCurrent,
    progreso_total: progressTotal,
    completado: completed,
    fecha_inicio: data.fecha_inicio,
    fecha_completado: data.fecha_completado,
    puntos_otorgados: typeof data.puntos_otorgados === "number" ? data.puntos_otorgados : 0,
  };
}

export async function fetchGlobalChallenges() {
  const snapshot = await getDocs(collection(db, "retos"));
  const list: ChallengeGlobal[] = [];

  snapshot.forEach((docSnap) => {
    const parsed = parseChallengeGlobal(docSnap.id, docSnap.data() as Record<string, unknown>);

    if (parsed && parsed.activo) {
      list.push(parsed);
    }
  });

  return list.sort((a, b) => a.orden - b.orden);
}

export async function ensureUserChallenges(uid: string, globals: ChallengeGlobal[]) {
  await Promise.all(
    globals.map(async (challenge) => {
      const userChallengeRef = doc(db, "usuarios", uid, "retos_usuario", challenge.id);
      const current = await getDoc(userChallengeRef);

      if (!current.exists()) {
        await setDoc(userChallengeRef, {
          reto_id: challenge.id,
          estado: challenge.estado_inicial,
          progreso_actual: 0,
          progreso_total: challenge.validacion_objetivo,
          completado: false,
          fecha_inicio: serverTimestamp(),
          fecha_completado: null,
          puntos_otorgados: 0,
        });
      }
    })
  );
}

export async function fetchUserChallenges(uid: string) {
  const snapshot = await getDocs(collection(db, "usuarios", uid, "retos_usuario"));
  const byId = new Map<string, ChallengeUser>();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const retoId = typeof data.reto_id === "string" ? data.reto_id : docSnap.id;
    byId.set(retoId, parseChallengeUser(data, retoId, 1));
  });

  return byId;
}

export function mergeChallenges(globals: ChallengeGlobal[], userById: Map<string, ChallengeUser>) {
  return globals.map((challenge): ChallengeView => {
    const userData = userById.get(challenge.id);

    const current = userData?.progreso_actual ?? 0;
    const total = userData?.progreso_total ?? challenge.validacion_objetivo;
    const done = userData?.completado ?? false;
    const status = userData?.estado ?? (done ? "terminado" : current > 0 ? "en_curso" : "disponible");

    return {
      id: challenge.id,
      tag: challenge.tag,
      tagColor: challenge.tag_color,
      tagBg: challenge.tag_bg,
      iconLocal: challenge.icono_local,
      time: `${challenge.tiempo_min} min`,
      points: `${challenge.puntos}`,
      title: challenge.titulo,
      description: challenge.descripcion,
      progress: current,
      total,
      done,
      status,
      route: challenge.ruta || undefined,
      validationAction: challenge.validacion_accion,
      validationTarget: challenge.validacion_objetivo,
    };
  });
}

export async function getChallengeById(challengeId: string) {
  const challengeSnap = await getDoc(doc(db, "retos", challengeId));

  if (!challengeSnap.exists()) {
    return null;
  }

  return parseChallengeGlobal(challengeSnap.id, challengeSnap.data() as Record<string, unknown>);
}

export async function getUserChallenge(uid: string, challengeId: string, fallbackTotal = 1) {
  const userChallengeSnap = await getDoc(doc(db, "usuarios", uid, "retos_usuario", challengeId));

  if (!userChallengeSnap.exists()) {
    return null;
  }

  return parseChallengeUser(userChallengeSnap.data() as Record<string, unknown>, challengeId, fallbackTotal);
}

export async function markChallengeInProgress(uid: string, challengeId: string) {
  await setDoc(
    doc(db, "usuarios", uid, "retos_usuario", challengeId),
    {
      reto_id: challengeId,
      estado: "en_curso",
      fecha_inicio: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function addManualProgress(uid: string, challengeId: string, step = 1) {
  const challenge = await getChallengeById(challengeId);

  if (!challenge) {
    throw new Error("Reto no encontrado");
  }

  const current = await getUserChallenge(uid, challengeId, challenge.validacion_objetivo);
  const currentValue = current?.progreso_actual ?? 0;
  const total = current?.progreso_total ?? challenge.validacion_objetivo;

  if (current?.completado) {
    return { completed: true, challenge };
  }

  const next = Math.min(total, currentValue + Math.max(1, step));
  const completed = next >= total;

  await setDoc(
    doc(db, "usuarios", uid, "retos_usuario", challengeId),
    {
      reto_id: challengeId,
      estado: completed ? "terminado" : "en_curso",
      progreso_actual: next,
      progreso_total: total,
      completado: completed,
      fecha_completado: completed ? serverTimestamp() : null,
      puntos_otorgados: completed ? challenge.puntos : 0,
    },
    { merge: true }
  );

  if (completed) {
    await completeChallenge(uid, challengeId);
  }

  return { completed, challenge };
}

async function registerChallengeEvidence(uid: string, challengeId: string, key: string) {
  const evidenceRef = doc(db, "usuarios", uid, "retos_usuario", challengeId, "evidencias", key);
  const evidenceSnap = await getDoc(evidenceRef);

  if (evidenceSnap.exists()) {
    return false;
  }

  await setDoc(evidenceRef, {
    key,
    fecha: serverTimestamp(),
  });

  return true;
}

function matchSearchEvidence(challenge: ChallengeGlobal, evidence: SearchEvidence) {
  const materialId = normalizeText(evidence.materialId);
  const category = normalizeText(evidence.category);

  if (challenge.validacion_accion === "buscar_materiales_distintos") {
    return { valid: true, key: `material-${materialId}` };
  }

  if (challenge.validacion_accion === "buscar_material_especifico") {
    const allowed = challenge.validacion_materiales.map(normalizeText);
    if (allowed.includes(materialId)) {
      return { valid: true, key: `material-${materialId}` };
    }
    return { valid: false, key: "" };
  }

  if (challenge.validacion_accion === "buscar_categoria") {
    if (normalizeText(challenge.validacion_categoria) === category) {
      return { valid: true, key: `categoria-${category}` };
    }
    return { valid: false, key: "" };
  }

  if (challenge.validacion_accion === "buscar_categorias_requeridas") {
    const allowedCategories = challenge.validacion_categorias.map(normalizeText);
    if (allowedCategories.includes(category)) {
      return { valid: true, key: `categoria-${category}` };
    }
    return { valid: false, key: "" };
  }

  return { valid: false, key: "" };
}

async function applySearchProgress(uid: string, challenge: ChallengeGlobal, evidence: SearchEvidence) {
  const current = await getUserChallenge(uid, challenge.id, challenge.validacion_objetivo);

  if (current?.completado) {
    return { completed: false, challenge, changed: false };
  }

  const match = matchSearchEvidence(challenge, evidence);

  if (!match.valid) {
    return { completed: false, challenge, changed: false };
  }

  const isNewEvidence = await registerChallengeEvidence(uid, challenge.id, match.key);

  if (!isNewEvidence) {
    return { completed: false, challenge, changed: false };
  }

  const currentValue = current?.progreso_actual ?? 0;
  const total = current?.progreso_total ?? challenge.validacion_objetivo;
  const next = Math.min(total, currentValue + 1);
  const completed = next >= total;

  await setDoc(
    doc(db, "usuarios", uid, "retos_usuario", challenge.id),
    {
      reto_id: challenge.id,
      estado: completed ? "terminado" : "en_curso",
      progreso_actual: next,
      progreso_total: total,
      completado: completed,
      fecha_completado: completed ? serverTimestamp() : null,
      puntos_otorgados: completed ? challenge.puntos : 0,
    },
    { merge: true }
  );

  if (completed) {
    await completeChallenge(uid, challenge.id);
  }

  return { completed, challenge, changed: true };
}

export async function validateSearchForChallenges(uid: string, evidence: SearchEvidence, challengeId?: string) {
  const globals = await fetchGlobalChallenges();
  const target = challengeId
    ? globals.filter((challenge) => challenge.id === challengeId)
    : globals.filter((challenge) => isSearchValidation(challenge.validacion_accion));

  const completed: ChallengeGlobal[] = [];

  for (const challenge of target) {
    const result = await applySearchProgress(uid, challenge, evidence);
    if (result.completed) {
      completed.push(challenge);
    }
  }

  return completed;
}

export async function completeChallenge(uid: string, challengeId: string) {
  const challengeRef = doc(db, "retos", challengeId);
  const challengeSnap = await getDoc(challengeRef);

  if (!challengeSnap.exists()) {
    throw new Error("Reto no encontrado");
  }

  const challengeData = parseChallengeGlobal(challengeSnap.id, challengeSnap.data() as Record<string, unknown>);

  if (!challengeData) {
    throw new Error("Reto inválido");
  }

  const userChallengeRef = doc(db, "usuarios", uid, "retos_usuario", challengeId);
  const userChallengeSnap = await getDoc(userChallengeRef);
  const alreadyCompleted = userChallengeSnap.exists() && userChallengeSnap.data().completado === true;

  if (alreadyCompleted) {
    return challengeData;
  }

  await setDoc(
    userChallengeRef,
    {
      reto_id: challengeId,
      estado: "terminado",
      progreso_actual: challengeData.progreso_total,
      progreso_total: challengeData.progreso_total,
      completado: true,
      fecha_completado: serverTimestamp(),
      puntos_otorgados: challengeData.puntos,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "usuarios", uid),
    {
      puntos_totales: increment(challengeData.puntos),
      retos_completados: increment(1),
      ultimo_ingreso: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(doc(db, "usuarios", uid, "historial", `${challengeId}-${Date.now()}`), {
    tipo: "reto",
    titulo: challengeData.titulo,
    descripcion: `Completaste el reto: ${challengeData.titulo}`,
    puntos: challengeData.puntos,
    fecha: serverTimestamp(),
    referencia_id: challengeId,
    referencia_tipo: "reto",
    icono: "check",
  });

  return challengeData;
}
