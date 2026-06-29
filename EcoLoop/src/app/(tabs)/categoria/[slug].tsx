import React, { useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const C = {
  green: "#2FBF6B",
  deepGreen: "#089047",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F2F4F7",
  cardBlue: "#EAF1FF",
  cardGreen: "#3ACB74",
  amber: "#E5A100",
  red: "#E04646",
};

type CategoryConfig = {
  title: string;
  heroTitle: string;
  heroDesc: string;
  heroEmoji: string;
  heroIcon: any;
  heroBg: string;
  tipCards: Array<{
    title: string;
    hint: string;
    icon: string;
  }>;
  sectionTitle: string;
  codeCards: Array<{
    id: string;
    short: string;
    title: string;
    description: string;
    idColor: string;
    statusIcon: string;
    status: string;
    statusColor: string;
  }>;
};

const CONFIGS: Record<string, CategoryConfig> = {
  plasticos: {
    title: "Plásticos",
    heroTitle: "Entendiendo los Plásticos",
    heroDesc: "No todos los plásticos son iguales. Aprende a identificarlos para un reciclaje efectivo y evita la contaminación cruzada.",
    heroEmoji: "🧴",
    heroIcon: require("../../../../assets/images/icons/plastic.jpeg"),
    heroBg: "#EEF4FF",
    tipCards: [
      { title: "Enjuaga", hint: "Quita restos", icon: "💧" },
      { title: "Seca", hint: "Evita moho", icon: "☀️" },
      { title: "Aplasta el envase", hint: "Ahorra espacio", icon: "🫙" },
    ],
    sectionTitle: "CÓDIGOS DE IDENTIFICACIÓN",
    codeCards: [
      {
        id: "1",
        short: "PET",
        title: "Polietileno Tereftalato",
        description: "Botellas de agua, refrescos, envases de aceite.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "ALTAMENTE RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "2",
        short: "HDPE",
        title: "Polietileno de Alta Densidad",
        description: "Envases de leche, detergentes, champú.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "ALTAMENTE RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "3",
        short: "PVC",
        title: "Cloruro de Polivinilo",
        description: "Tuberías, cables, algunos blísteres.",
        idColor: C.red,
        statusIcon: "△",
        status: "DIFÍCIL DE RECICLAR",
        statusColor: C.red,
      },
      {
        id: "4",
        short: "LDPE",
        title: "Polietileno de Baja Densidad",
        description: "Bolsas de supermercado, film transparente.",
        idColor: C.amber,
        statusIcon: "ⓘ",
        status: "REQUIERE PUNTOS ESPECIALES",
        statusColor: C.amber,
      },
      {
        id: "5",
        short: "PP",
        title: "Polipropileno",
        description: "Tapas de botellas, envases de yogur, pajitas.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECICLABLE",
        statusColor: C.deepGreen,
      },
    ],
  },
  organicos: {
    title: "Orgánico",
    heroTitle: "Entendiendo lo Orgánico",
    heroDesc: "Aprende a separar restos biodegradables para compostaje y evita mezclar comida con reciclables.",
    heroEmoji: "🍌",
    heroIcon: require("../../../../assets/images/icons/organic.jpeg"),
    heroBg: "#EFF7EE",
    tipCards: [
      { title: "Separa restos", hint: "Sin bolsas plásticas", icon: "🥬" },
      { title: "Mantén seco", hint: "Reduce olores", icon: "🌿" },
      { title: "Composta", hint: "Usa el contenedor correcto", icon: "🪱" },
    ],
    sectionTitle: "CLAVES DE IDENTIFICACIÓN",
    codeCards: [
      {
        id: "1",
        short: "Fresco",
        title: "Restos de fruta y verdura",
        description: "Cáscaras, semillas y partes vegetales sin envoltorios.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "APTO PARA COMPOSTA",
        statusColor: C.deepGreen,
      },
      {
        id: "2",
        short: "Húmedo",
        title: "Sobras de comida",
        description: "Arroz, pan y restos cocidos, siempre sin plástico.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "APTO CON CUIDADO",
        statusColor: C.amber,
      },
      {
        id: "3",
        short: "Seco",
        title: "Poda y jardín",
        description: "Hojas, pasto y ramas pequeñas para compostaje.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "APROVECHABLE",
        statusColor: C.deepGreen,
      },
    ],
  },
  "papel-carton": {
    title: "Papel/Cartón",
    heroTitle: "Entendiendo el Papel y Cartón",
    heroDesc: "Aprende a reconocer papel limpio, cartón seco y materiales que sí pueden volver a circular.",
    heroEmoji: "📦",
    heroIcon: require("../../../../assets/images/icons/paper-carton.jpeg"),
    heroBg: "#EEF4FF",
    tipCards: [
      { title: "Retira grapas", hint: "Sin plásticos", icon: "📎" },
      { title: "Mantén seco", hint: "Evita humedad", icon: "☀️" },
      { title: "Aplasta cajas", hint: "Ahorra espacio", icon: "📦" },
    ],
    sectionTitle: "CLAVES DE IDENTIFICACIÓN",
    codeCards: [
      {
        id: "1",
        short: "Papel",
        title: "Hojas limpias",
        description: "Cuadernos, folios y papel de oficina sin grasa ni humedad.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "2",
        short: "Cartón",
        title: "Cajas secas",
        description: "Cajas de embalaje y cartón corrugado sin restos de comida.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "3",
        short: "Mixto",
        title: "Papel plastificado",
        description: "Papeles con recubrimiento o grasa que ya no entran al flujo normal.",
        idColor: C.amber,
        statusIcon: "ⓘ",
        status: "REQUIERE REVISIÓN",
        statusColor: C.amber,
      },
    ],
  },
  vidrio: {
    title: "Vidrio",
    heroTitle: "Entendiendo el Vidrio",
    heroDesc: "Frascos y botellas tienen un ciclo distinto: identifícalos y evita mezclar rotos con otros residuos.",
    heroEmoji: "🍾",
    heroIcon: require("../../../../assets/images/icons/glass.jpeg"),
    heroBg: "#EEF7F4",
    tipCards: [
      { title: "Vacía", hint: "Sin líquidos", icon: "🫗" },
      { title: "Separa tapas", hint: "Metal o plástico", icon: "🔄" },
      { title: "No lo rompas", hint: "Evita riesgos", icon: "🛑" },
    ],
    sectionTitle: "CLAVES DE IDENTIFICACIÓN",
    codeCards: [
      {
        id: "1",
        short: "Frasco",
        title: "Botellas y frascos",
        description: "Envases de vidrio limpios y vacíos, preferiblemente separados por color.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "2",
        short: "Color",
        title: "Transparente o de color",
        description: "Ambos pueden recuperarse, pero se procesan de forma distinta.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECUPERABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "3",
        short: "Roto",
        title: "Vidrio fragmentado",
        description: "Debe envolver-se y manejarse aparte para evitar cortes y accidentes.",
        idColor: C.red,
        statusIcon: "△",
        status: "MANEJO ESPECIAL",
        statusColor: C.red,
      },
    ],
  },
  metal: {
    title: "Metal",
    heroTitle: "Entendiendo los Metales",
    heroDesc: "Latas, tapas y piezas metálicas pueden reciclarse mejor si están limpias y bien separadas.",
    heroEmoji: "🥫",
    heroIcon: require("../../../../assets/images/icons/metal.jpeg"),
    heroBg: "#FFF5E8",
    tipCards: [
      { title: "Enjuaga", hint: "Sin residuos", icon: "💦" },
      { title: "Aplasta", hint: "Reduce volumen", icon: "🔨" },
      { title: "Separa piezas", hint: "Más eficiente", icon: "🔩" },
    ],
    sectionTitle: "CLAVES DE IDENTIFICACIÓN",
    codeCards: [
      {
        id: "1",
        short: "Lata",
        title: "Aluminio ligero",
        description: "Latas de bebida y envases delgados que se compactan fácilmente.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "2",
        short: "Conserva",
        title: "Acero o hojalata",
        description: "Envases de conservas y tapas metálicas, limpios y vacíos.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "RECICLABLE",
        statusColor: C.deepGreen,
      },
      {
        id: "3",
        short: "Pieza",
        title: "Metal pequeño",
        description: "Tapas, alambres y piezas sueltas que conviene juntar por separado.",
        idColor: C.amber,
        statusIcon: "ⓘ",
        status: "AGRUPAR PARA ENTREGA",
        statusColor: C.amber,
      },
    ],
  },
  peligroso: {
    title: "Peligroso",
    heroTitle: "Entendiendo los Residuos Peligrosos",
    heroDesc: "Pilas, aceites y electrónicos requieren cuidado especial para no contaminar ni poner en riesgo a nadie.",
    heroEmoji: "⚠️",
    heroIcon: require("../../../../assets/images/icons/hazard.jpeg"),
    heroBg: "#F3ECFF",
    tipCards: [
      { title: "No mezclar", hint: "Nunca con basura común", icon: "⛔" },
      { title: "Guarda seguro", hint: "Usa recipiente cerrado", icon: "🔒" },
      { title: "Llévalo a punto limpio", hint: "Manejo especializado", icon: "🏭" },
    ],
    sectionTitle: "CLAVES DE IDENTIFICACIÓN",
    codeCards: [
      {
        id: "1",
        short: "Pilas",
        title: "Baterías y pilas",
        description: "Pequeñas fuentes de energía que nunca deben ir con basura común.",
        idColor: C.red,
        statusIcon: "△",
        status: "ALTA PRECAUCIÓN",
        statusColor: C.red,
      },
      {
        id: "2",
        short: "Aceite",
        title: "Aceites usados",
        description: "Debe guardarse en un recipiente cerrado para su recolección especial.",
        idColor: C.amber,
        statusIcon: "ⓘ",
        status: "ENTREGA ESPECIAL",
        statusColor: C.amber,
      },
      {
        id: "3",
        short: "E-waste",
        title: "Electrónicos",
        description: "Cables, placas y aparatos con componentes internos delicados.",
        idColor: C.deepGreen,
        statusIcon: "◉",
        status: "PUNTO LIMPIO",
        statusColor: C.deepGreen,
      },
    ],
  },
};

function slugToCategoryLabel(slug: string) {
  const normalized = slug.toLowerCase();

  if (normalized.includes("plast")) return "Plásticos";
  if (normalized.includes("organ")) return "Orgánico";
  if (normalized.includes("papel") || normalized.includes("carton")) return "Papel/Cartón";
  if (normalized.includes("vidrio")) return "Vidrio";
  if (normalized.includes("metal")) return "Metal";
  if (normalized.includes("pelig")) return "Peligroso";
  return "General";
}

function resolveCategoryKey(slug: string) {
  const normalized = slug.toLowerCase();

  if (normalized.includes("plast")) return "plasticos";
  if (normalized.includes("organ")) return "organicos";
  if (normalized.includes("papel") || normalized.includes("carton")) return "papel-carton";
  if (normalized.includes("vidrio")) return "vidrio";
  if (normalized.includes("metal")) return "metal";
  if (normalized.includes("pelig")) return "peligroso";
  return normalized;
}

function resolveConfig(slug: string): CategoryConfig {
  const key = resolveCategoryKey(slug);

  return CONFIGS[key] || {
    title: slugToCategoryLabel(slug),
    heroTitle: `Entendiendo ${slugToCategoryLabel(slug)}`,
    heroDesc: "Aprende a identificar y separar correctamente esta categoria de residuos.",
    heroEmoji: "♻️",
    heroIcon: require("../../../../assets/images/icons/tab-search.jpeg"),
    heroBg: "#EEF4FF",
    tipCards: [
      { title: "Identifica", hint: "Busca sus rasgos clave", icon: "🔎" },
      { title: "Separa", hint: "Evita mezclar residuos", icon: "🧺" },
      { title: "Recicla", hint: "Deposita en el contenedor correcto", icon: "♻️" },
    ],
    sectionTitle: "CLAVES DE IDENTIFICACIÓN",
    codeCards: [
      { id: "1", short: "Clave", title: "Revisa su forma", description: "Observa textura, rigidez y si tiene etiquetas o restos.", idColor: C.deepGreen, statusIcon: "◉", status: "IDENTIFICAR", statusColor: C.deepGreen },
      { id: "2", short: "Clave", title: "Comprueba limpieza", description: "Si está sucio o mezclado, su recuperación baja mucho.", idColor: C.amber, statusIcon: "ⓘ", status: "REVISAR", statusColor: C.amber },
      { id: "3", short: "Clave", title: "Llévalo al flujo correcto", description: "Cada material entra en un contenedor o punto de entrega distinto.", idColor: C.deepGreen, statusIcon: "◉", status: "SEPARAR", statusColor: C.deepGreen },
    ],
  };
}

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();

  const config = useMemo(() => resolveConfig(slug || "general"), [slug]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.replace("/(tabs)/buscar")}
        >
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <TouchableOpacity style={styles.headerIconButton}>
          <Text style={styles.headerIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={[styles.heroCircle, { backgroundColor: config.heroBg }]}>
            <Image source={config.heroIcon} style={styles.heroIcon} resizeMode="contain" />
          </View>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>GUÍA DE MATERIAL</Text>
          </View>
          <Text style={styles.heroTitle}>{config.heroTitle}</Text>
          <Text style={styles.heroDesc}>{config.heroDesc}</Text>
        </View>

        <Text style={styles.sectionLabel}>ANTES DE RECICLAR</Text>

        <View style={styles.beforeRow}>
          {config.tipCards.slice(0, 2).map((tip) => (
            <View key={tip.title} style={styles.beforeCard}>
              <View style={styles.beforeIconWrap}>
                <Text style={styles.beforeIconEmoji}>{tip.icon}</Text>
              </View>
              <Text style={styles.beforeTitle}>{tip.title}</Text>
              <Text style={styles.beforeHint}>{tip.hint}</Text>
            </View>
          ))}
        </View>

        <View style={styles.flattenCard}>
          <Text style={styles.flattenIconEmoji}>{config.tipCards[2].icon}</Text>
          <View>
            <Text style={styles.flattenTitle}>{config.tipCards[2].title}</Text>
            <Text style={styles.flattenHint}>{config.tipCards[2].hint}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{config.sectionTitle}</Text>

        {config.codeCards.map((item) => (
          <View key={`${config.title}-${item.id}`} style={styles.codeCard}>
            <View style={styles.codeIdBox}>
              <Text style={[styles.codeId, { color: item.idColor }]}>{item.id}</Text>
              <Text style={styles.codeShort}>{item.short}</Text>
            </View>
            <View style={styles.codeBody}>
              <Text style={styles.codeTitle}>{item.title}</Text>
              <Text style={styles.codeDesc}>{item.description}</Text>
              <Text style={[styles.codeStatus, { color: item.statusColor }]}>{item.statusIcon} {item.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerIconButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 22,
    color: C.text,
  },
  headerTitle: {
    fontSize: 24 / 1.6,
    fontWeight: "700",
    color: C.text,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  heroCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  heroIcon: {
    width: 28,
    height: 28,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroIcon: {
    width: 36,
    height: 36,
  },
  tagPill: {
    backgroundColor: "#E8EDF3",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  heroTitle: {
    fontSize: 22 / 1.3,
    fontWeight: "800",
    color: C.text,
    marginBottom: 6,
    textAlign: "center",
  },
  heroDesc: {
    fontSize: 16 / 1.35,
    color: C.muted,
    textAlign: "center",
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 8,
    marginTop: 4,
  },
  beforeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  beforeCard: {
    flex: 1,
    backgroundColor: C.cardBlue,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  beforeIconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  beforeIconEmoji: {
    fontSize: 18,
  },
  beforeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  beforeHint: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },
  flattenCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cardGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  flattenIconEmoji: {
    width: 22,
    height: 22,
    marginRight: 8,
    textAlign: "center",
    lineHeight: 22,
    fontSize: 18,
  },
  flattenTitle: {
    color: "#0B5E33",
    fontSize: 13,
    fontWeight: "800",
  },
  flattenHint: {
    color: "#1C7A44",
    fontSize: 10,
    marginTop: 2,
  },
  codeCard: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  codeIdBox: {
    width: 56,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ECF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  codeId: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 16,
  },
  codeShort: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 2,
  },
  codeBody: {
    flex: 1,
  },
  codeTitle: {
    fontSize: 16 / 1.1,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  codeDesc: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 6,
  },
  codeStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
});
