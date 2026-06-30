import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TutorialScreen() {
  const router = useRouter();

  const pasos = [
    {
      id: 1,
      icon: 'search',
      titulo: 'Busca residuos',
      descripcion: 'Escanea el código de barras o usa la cámara para identificar plásticos, papeles u orgánicos.',
      color: '#C8E6C9',
    },
    {
      id: 2,
      icon: 'checkmark-circle-outline',
      titulo: 'Completa retos',
      descripcion: 'Acepta desafíos diarios como “Cero Plásticos” y registra tus acciones sostenibles en la app.',
      color: '#C8E6C9',
    },
    {
      id: 3,
      icon: 'trophy-outline',
      titulo: 'Gana medallas',
      descripcion: 'Colecciona logros digitales y desbloquea recompensas reales por tus hábitos ecológicos.',
      color: '#FFF9C4',
    },
    {
      id: 4,
      icon: 'bar-chart-outline',
      titulo: 'Sube en el ranking',
      descripcion: 'Compite sanamente con tus amigos y comunidad para ser el héroe ecológico de tu ciudad.',
      color: '#C8E6C9',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>¿Cómo usar EcoLoop?</Text>
          <Text style={styles.subtitle}>Gamifica tu reciclaje y salva el planeta paso a paso.</Text>
        </View>

        {/* Pasos */}
        {pasos.map((paso) => (
          <View key={paso.id} style={[styles.card, { backgroundColor: '#fff' }]}>
            <View style={[styles.iconContainer, { backgroundColor: paso.color }]}>
              <Ionicons name={paso.icon as any} size={22} color="#3BAB4F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{`${paso.id}. ${paso.titulo}`}</Text>
              <Text style={styles.cardDescription}>{paso.descripcion}</Text>
            </View>
          </View>
        ))}

        {/* Bono de bienvenida */}
        <View style={styles.bonoContainer}>
          <Text style={styles.bonoTitle}>🎁 BONO DE BIENVENIDA</Text>
          <Text style={styles.bonoText}>¡Empieza con 50 puntos!</Text>
          <Text style={styles.bonoSubtext}>Al completar tu primer registro hoy.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F8', paddingHorizontal: 16, paddingTop: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#3BAB4F', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#555', marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    paddingVertical: 24, // más grueso
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: '#555' },
  bonoContainer: {
    backgroundColor: '#FFE082',
    borderRadius: 16,
    paddingVertical: 24, // más alto
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  bonoTitle: { fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 4 },
  bonoText: { fontSize: 16, fontWeight: '700', color: '#000' },
  bonoSubtext: { fontSize: 13, color: '#333', marginTop: 2 },
});
