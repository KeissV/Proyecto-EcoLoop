import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AmigosScreen() {
  const router = useRouter();

  const amigos = [
    { id: 1, nombre: 'Mateo García', nivel: 24, titulo: 'Eco Guerrero', color: '#A8E6CF' },
    { id: 2, nombre: 'Sofía Ruiz', nivel: 18, titulo: 'Recicladora Pro', color: '#DAB6FC' },
    { id: 3, nombre: 'Carlos Menten', nivel: 32, titulo: 'Maestro Sostenible', color: '#B3E5FC' },
  ];

  return (
    <View style={styles.container}>
      {/* Encabezado con flecha funcional */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Amigos</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar amigos por nombre o ID..."
          placeholderTextColor="#777"
          style={styles.searchInput}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={[styles.tabText, styles.activeTab]}>Mis amigos</Text>
        <Text style={styles.tabText}>Solicitudes</Text>
      </View>

      {/* Lista de amigos */}
      <ScrollView style={styles.list}>
        {amigos.map((amigo) => (
          <View key={amigo.id} style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: amigo.color }]}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Nvl {amigo.nivel}</Text>
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{amigo.nombre}</Text>
              <Text style={styles.subtitle}>{amigo.titulo}</Text>
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Ver perfil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F7EF',
    paddingHorizontal: 16,
    paddingTop: 50, // más espacio superior
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // más separación
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // más redondeado
    paddingHorizontal: 14,
    marginBottom: 20,
    height: 48, // más alto
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20, // más espacio
  },
  tabText: {
    fontSize: 17,
    color: '#555',
  },
  activeTab: {
    color: '#007F5F',
    borderBottomWidth: 3,
    borderBottomColor: '#007F5F',
    paddingBottom: 6,
  },
  list: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16, // más redondeado
    paddingVertical: 18, // más alto
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  levelBadge: {
    backgroundColor: '#FFD54F',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    borderWidth: 1,
    borderColor: '#007F5F',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#007F5F',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    backgroundColor: '#007F5F',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

