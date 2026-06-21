import { View, Text, StyleSheet } from "react-native";

export default function BuscarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Buscar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F7F7" },
  text: { fontSize: 24, fontWeight: "700", color: "#3BAB4F" },
});