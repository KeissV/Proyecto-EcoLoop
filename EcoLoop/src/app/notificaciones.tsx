import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificacionesScreen() {
  const router = useRouter();

  const hoy = [
    {
      id: 1,
      icon: 'trophy-outline',
      titulo: '¡Nueva medalla obtenida!',
      descripcion: 'Has registrado 5kg de plástico. Eres un "Guardián del Plástico".',
      tiempo: 'Hace 2 horas',
      color: '#FFE082',
    },
    {
      id: 2,
      icon: 'flame-outline',
      titulo: '¡Racha de 3 días!',
      descripcion: 'Sigue así, estás construyendo un gran hábito ecológico. ¡No te detengas!',
      tiempo: 'Hace 5 horas',
      color: '#FFCDD2',
    },
  ];

  const anterior = [
    {
      id: 3,
      icon: 'leaf-outline',
      titulo: 'Nuevo reto disponible',
      descripcion: "Participa en el reto 'Semana sin bolsas' y gana 50 puntos extra para tu perfil.",
      tiempo: 'Ayer',
      color: '#C8E6C9',
    },
    {
      id: 4,
      icon: 'calendar-outline',
      titulo: 'Recordatorio de recolección',
      descripcion: 'Mañana pasa el camión de reciclaje de papel y cartón en tu zona registrada.',
      tiempo: 'Hace 3 días',
      color: '#CFD8DC',
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
          <Text style={styles.title}>Notificaciones</Text>
          <Ionicons name="checkmark-done-outline" size={22} color="#3BAB4F" style={styles.iconRight} />
        </View>

        {/* Sección Hoy */}
        <Text style={styles.sectionTitle}>Hoy</Text>
        {hoy.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: '#fff' }]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={22} color="#3BAB4F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDescription}>{item.descripcion}</Text>
              <Text style={styles.cardTime}>{item.tiempo}</Text>
            </View>
            <View style={styles.statusDot} />
          </View>
        ))}

        {/* Sección Anterior */}
        <Text style={styles.sectionTitle}>Anterior</Text>
        {anterior.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: '#fff' }]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={22} color="#3BAB4F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDescription}>{item.descripcion}</Text>
              <Text style={styles.cardTime}>{item.tiempo}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F8', paddingHorizontal: 16, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#000' },
  iconRight: { marginRight: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    paddingVertical: 22, // más grueso
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: '#555', marginBottom: 6 },
  cardTime: { fontSize: 12, color: '#777' },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3BAB4F',
    marginTop: 4,
  },
});
