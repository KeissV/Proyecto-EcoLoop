import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

const GREEN = "#3BAB4F";

type Props = {
  visible: boolean;
  titulo: string;
  mensaje: string;
  onClose: () => void;
  tipo?: "error" | "exito" | "info";
};

export default function Alerta({ visible, titulo, mensaje, onClose, tipo = "info" }: Props) {
  const colores = {
    error: { bg: "#FFE5E5", borde: "#F5BCBC", titulo: "#C0392B" },
    exito: { bg: "#DFF5E5", borde: "#A8DDB5", titulo: GREEN },
    info: { bg: "#E8EEFF", borde: "#B0BFEE", titulo: "#2C4FBF" },
  };

  const { bg, borde, titulo: colorTitulo } = colores[tipo];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: bg, borderColor: borde }]}>
          <Text style={[styles.titulo, { color: colorTitulo }]}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>
          <TouchableOpacity style={[styles.boton, { backgroundColor: colorTitulo }]} onPress={onClose}>
            <Text style={styles.botonTexto}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  mensaje: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  boton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

