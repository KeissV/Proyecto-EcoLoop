import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

export type WasteSearchItem = {
  id: string;
  docId: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  imageKey: string;
  keywords: string[];
  route?: string;
  popularity: number;
  featured: boolean;
};

export type WasteDetailStep = {
  numero: number;
  titulo: string;
  descripcion: string;
};

export type WasteDetail = WasteSearchItem & {
  description: string;
  container: string;
  recyclable: boolean;
  materialType: string;
  iconEmoji: string;
  imageKey: string;
  imageUrl: string;
  steps: WasteDetailStep[];
  impact: {
    co2Kg: number;
    waterL: number;
    energyKwh: number;
    note: string;
  };
};

const GLOBAL_WASTE_COLLECTION = "residuos";

function pickString(data: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function pickNumber(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}

function pickBoolean(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return false;
}

function pickStringList(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  }

  return [];
}

function normalizeTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeRoute(rawRoute: string) {
  if (!rawRoute) {
    return undefined;
  }

  return rawRoute.startsWith("/") ? rawRoute : `/${rawRoute}`;
}

function normalizeItem(id: string, data: Record<string, unknown>): WasteSearchItem | null {
  const title = pickString(data, ["nombre", "title", "nombreComun", "item", "residuo"]);

  if (!title) {
    return null;
  }

  const category = pickString(data, ["categoria", "category", "tipo", "material"], "General");
  const subtitle = pickString(
    data,
    ["subtitulo", "subtitle", "descripcionCorta", "descripcion", "tipoMaterial"],
    category
  );

  return {
    id,
    docId: id,
    title,
    subtitle,
    category,
    imageUrl: pickString(data, ["imagen_url", "image_url", "imageUrl"], ""),
    imageKey: pickString(data, ["imagen_key", "imageKey", "icono_local"], ""),
    keywords: pickStringList(data, ["keywords", "tags", "sinonimos", "aliases"]),
    route: normalizeRoute(pickString(data, ["route", "ruta", "screen", "pantalla", "slug"])),
    popularity: pickNumber(data, ["popularidad", "busquedas", "searchCount", "orden"]),
    featured: pickBoolean(data, ["destacado", "featured", "popular"]),
  };
}

function normalizeSteps(data: Record<string, unknown>) {
  const rawSteps = data.pasos;

  if (!Array.isArray(rawSteps)) {
    return [];
  }

  return rawSteps
    .map((step, index): WasteDetailStep | null => {
      if (!step || typeof step !== "object") {
        return null;
      }

      const record = step as Record<string, unknown>;
      const titulo = pickString(record, ["titulo", "title"]);
      const descripcion = pickString(record, ["descripcion", "description"]);

      if (!titulo && !descripcion) {
        return null;
      }

      return {
        numero: pickNumber(record, ["numero", "step", "order"]) || index + 1,
        titulo: titulo || `Paso ${index + 1}`,
        descripcion,
      };
    })
    .filter((step): step is WasteDetailStep => Boolean(step));
}

function normalizeImpact(data: Record<string, unknown>) {
  const rawImpact = data.impacto;
  const impact = rawImpact && typeof rawImpact === "object" ? (rawImpact as Record<string, unknown>) : {};

  return {
    co2Kg: pickNumber(impact, ["co2_kg", "co2Kg", "co2"]),
    waterL: pickNumber(impact, ["agua_l", "waterL", "agua"]),
    energyKwh: pickNumber(impact, ["energia_kwh", "energyKwh", "energia"]),
    note: pickString(impact, ["nota", "note"], ""),
  };
}

function normalizeDetail(id: string, data: Record<string, unknown>): WasteDetail | null {
  const base = normalizeItem(id, data);

  if (!base) {
    return null;
  }

  return {
    ...base,
    description: pickString(data, ["descripcion", "description"], base.subtitle),
    container: pickString(data, ["contenedor", "container"], "No especificado"),
    recyclable:
      ("reciclable" in data && typeof data.reciclable === "boolean"
        ? data.reciclable
        : "recyclable" in data && typeof data.recyclable === "boolean"
          ? data.recyclable
          : true),
    materialType: pickString(data, ["tipo_material", "tipoMaterial", "materialType"], base.category),
    iconEmoji: pickString(data, ["icono_emoji", "emoji"], "REC"),
    imageKey: base.imageKey,
    imageUrl: base.imageUrl,
    steps: normalizeSteps(data),
    impact: normalizeImpact(data),
  };
}

export function filterWasteItems(items: WasteSearchItem[], rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return items.filter((item) => {
    const haystack = [item.title, item.subtitle, item.category, ...item.keywords].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

export async function fetchWasteItems() {
  const snapshot = await getDocs(collection(db, GLOBAL_WASTE_COLLECTION));
  const items: WasteSearchItem[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() as Record<string, unknown>;
    const activeValue = data.activo;
    const isActive = typeof activeValue !== "boolean" || activeValue;

    if (!isActive) {
      return;
    }

    const item = normalizeItem(docSnapshot.id, data);

    if (item) {
      items.push(item);
    }
  });

  return items.sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if (left.popularity !== right.popularity) {
      return right.popularity - left.popularity;
    }

    return left.title.localeCompare(right.title, "es");
  });
}

export async function fetchWasteDetail(docId: string) {
  const snapshot = await getDoc(doc(db, GLOBAL_WASTE_COLLECTION, docId));

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeDetail(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function registerWasteSearch(item: WasteSearchItem, rawTerm?: string) {
  const itemRef = doc(db, GLOBAL_WASTE_COLLECTION, item.docId);

  await updateDoc(itemRef, {
    busquedas: increment(1),
    popularidad: increment(1),
    ultima_busqueda: serverTimestamp(),
  });

  const term = normalizeTerm(rawTerm || item.title);

  if (term.length < 2) {
    return;
  }

  await setDoc(
    doc(db, "estadisticas_busqueda_global", term),
    {
      termino: term,
      total: increment(1),
      updated_at: serverTimestamp(),
      material_id: item.docId,
      material_nombre: item.title,
    },
    { merge: true }
  );
}

export function rankMostSearched(items: WasteSearchItem[]) {
  const sorted = [...items].sort((left, right) => {
    if (left.popularity !== right.popularity) {
      return right.popularity - left.popularity;
    }

    return left.title.localeCompare(right.title, "es");
  });

  if (sorted.some((item) => item.popularity > 0)) {
    return sorted.filter((item) => item.popularity > 0);
  }

  return sorted;
}
