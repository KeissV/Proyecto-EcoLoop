import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ConfiguracionScreen() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [recordatorioEnabled, setRecordatorioEnabled] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {/* Sección Notificaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={22} color="#3BAB4F" />
            <Text style={styles.sectionTitle}>Notificaciones</Text>
          </View>

          <View style={styles.option}>
            <View>
              <Text style={styles.optionTitle}>Notificaciones push</Text>
              <Text style={styles.optionSubtitle}>Recibe alertas en tu dispositivo</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#ccc', true: '#A5D6A7' }}
              thumbColor={pushEnabled ? '#3BAB4F' : '#f4f3f4'}
            />
          </View>

          <View style={styles.option}>
            <View>
              <Text style={styles.optionTitle}>Recordatorio diario</Text>
              <Text style={styles.optionSubtitle}>Te recordamos completar tus retos</Text>
            </View>
            <Switch
              value={recordatorioEnabled}
              onValueChange={setRecordatorioEnabled}
              trackColor={{ false: '#ccc', true: '#A5D6A7' }}
              thumbColor={recordatorioEnabled ? '#3BAB4F' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Sección Apariencia */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="phone-portrait-outline" size={22} color="#3BAB4F" />
            <Text style={styles.sectionTitle}>Apariencia</Text>
          </View>

          <View style={styles.option}>
            <View>
              <Text style={styles.optionTitle}>Modo oscuro</Text>
              <Text style={styles.optionSubtitle}>Cambia la apariencia de la app</Text>
            </View>
            <Switch
              value={modoOscuro}
              onValueChange={setModoOscuro}
              trackColor={{ false: '#ccc', true: '#A5D6A7' }}
              thumbColor={modoOscuro ? '#3BAB4F' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.option}>
            <View>
              <Text style={styles.optionTitle}>Idioma</Text>
              <Text style={styles.optionSubtitle}>Español</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#777" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,   // más grueso
    paddingHorizontal: 20, // más ancho
    marginBottom: 28,      // más separación entre secciones
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    color: '#000',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 16, // más alto cada opción
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#555',
  },
});

