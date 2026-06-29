import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#3BAB4F";
const GREEN_LIGHT = "#E8F5E9";
const { width } = Dimensions.get("window");

const slides = [
  {
    icon: "book-outline" as const,
    title: "Aprende a Reciclar",
    description:
      "Descubre cómo separar tus residuos de forma correcta y divertida.",
  },
  {
    icon: "calendar-outline" as const,
    title: "Completa Retos Diarios",
    description:
      "Supera pequeños desafíos cada día y mejora tus hábitos sostenibles.",
  },
  {
    icon: "trophy-outline" as const,
    title: "Gana Recompensas",
    description:
      "Colecciona insignias y sube en el ranking mientras ayudas al planeta.",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace("/login");
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    router.replace("/login");
  };

  const slide = slides[current];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={handleSkip}>
        <Text style={styles.skipText}>Omitir</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            current === 1 && styles.iconCircleActive,
          ]}
        >
          <Ionicons
            name={slide.icon}
            size={56}
            color={current === 1 ? "#fff" : GREEN}
          />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === current && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {isLast ? "¡Comenzar ahora!" : "Siguiente →"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skip: {
    alignSelf: "flex-end",
  },
  skipText: {
    color: "#888",
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleActive: {
    backgroundColor: GREEN,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: GREEN,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: width * 0.7,
  },
  footer: {
    gap: 24,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  dotActive: {
    width: 24,
    backgroundColor: GREEN,
  },
  button: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
