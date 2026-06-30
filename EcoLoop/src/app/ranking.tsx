import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RankingScreen() {
  const router = useRouter();

  const ranking = [
    { id: 1, nombre: 'Carlos', puntos: 5420, color: '#FDD835' },
    { id: 2, nombre: 'Ana', puntos: 4890, color: '#BBDEFB' },
    { id: 3, nombre: 'Luis', puntos: 4650, color: '#FFCCBC' },
    { id: 4, nombre: 'Usuario usuario', puntos: 2450, color: '#E8F5E9', activo: true },
    { id: 5, nombre: 'Elena Ruiz', puntos: 2380 },
    { id: 6, nombre: 'Pedro Sánchez', puntos: 2100 },
    { id: 7, nombre: 'Laura Vega', puntos: 1950 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Ranking</Text>
          <Text style={styles.subtitle}>Compite con otros eco-heroes</Text>
        </View>

        {/* Podio más grueso */}
        <View style={styles.podiumContainer}>
          <View style={[styles.podiumItem, { backgroundColor: '#BBDEFB', height: 120 }]}>
            <Text style={styles.podiumPosition}>2</Text>
            <Text style={styles.podiumName}>Ana</Text>
            <Text style={styles.podiumPoints}>4 890</Text>
          </View>

          <View style={[styles.podiumItem, { backgroundColor: '#FDD835', height: 160 }]}>
            <Text style={styles.podiumPosition}>1</Text>
            <Text style={styles.podiumName}>Carlos</Text>
            <Text style={styles.podiumPoints}>5 420</Text>
          </View>

          <View style={[styles.podiumItem, { backgroundColor: '#FFCCBC', height: 100 }]}>
            <Text style={styles.podiumPosition}>3</Text>
            <Text style={styles.podiumName}>Luis</Text>
            <Text style={styles.podiumPoints}>4 650</Text>
          </View>
        </View>

        {/* Lista más amplia */}
        <View style={styles.listContainer}>
          {ranking.slice(3).map((item) => (
            <View
              key={item.id}
              style={[
                styles.listItem,
                item.activo && { backgroundColor: '#E8F5E9', borderColor: '#3BAB4F', borderWidth: 1 },
              ]}
            >
              <Text style={[styles.rankNumber, item.activo && { color: '#3BAB4F', fontWeight: '700' }]}>
                {item.id}
              </Text>
              <Text style={[styles.rankName, item.activo && { color: '#3BAB4F', fontWeight: '700' }]}>
                {item.nombre}
              </Text>
              <View style={styles.rankRight}>
                <Ionicons name="star-outline" size={16} color="#3BAB4F" />
                <Text style={styles.rankPoints}>{item.puntos}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Ionicons name="home-outline" size={22} color="#777" />
          <Text style={styles.navText}>Inicio</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="search-outline" size={22} color="#777" />
          <Text style={styles.navText}>Buscar</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="flag-outline" size={22} color="#777" />
          <Text style={styles.navText}>Retos</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="trophy-outline" size={22} color="#777" />
          <Text style={styles.navText}>Logros</Text>
        </View>
        <View style={[styles.navItem, styles.activeNav]}>
          <Ionicons name="person" size={22} color="#3BAB4F" />
          <Text style={[styles.navText, styles.activeNavText]}>Perfil</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F8' },
  header: {
    backgroundColor: '#3BAB4F',
    paddingVertical: 50, // más grueso
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 8 },
  subtitle: { color: '#E0E0E0', fontSize: 14, marginTop: 4 },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -20,
    paddingVertical: 30, // más alto
    elevation: 4,
  },
  podiumItem: {
    width: 90,
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
  },
  podiumPosition: { fontWeight: '700', fontSize: 16, color: '#000' },
  podiumName: { fontSize: 14, fontWeight: '600', color: '#000' },
  podiumPoints: { fontSize: 12, color: '#555' },
  listContainer: { marginTop: 20, paddingHorizontal: 16 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16, // más alto
    paddingHorizontal: 18,
    marginBottom: 12,
    elevation: 3,
  },
  rankNumber: { width: 24, fontSize: 15, color: '#000' },
  rankName: { flex: 1, fontSize: 15, color: '#000' },
  rankRight: { flexDirection: 'row', alignItems: 'center' },
  rankPoints: { fontSize: 14, fontWeight: '600', color: '#000', marginLeft: 4 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#777', marginTop: 2 },
  activeNavText: { color: '#3BAB4F', fontWeight: '600' },
});

