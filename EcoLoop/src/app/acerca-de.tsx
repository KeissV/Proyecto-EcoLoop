import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AcercaDeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Acerca de EcoLoop</Text>
        </View>

        {/* Logo y versión */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>EcoLoop</Text>
          <Text style={styles.version}>Versión 1.2.0</Text>
        </View>

        {/* Descripción */}
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            EcoLoop es una plataforma diseñada para gamificar la educación ambiental y fomentar hábitos de reciclaje sostenibles. 
            Nuestra misión es empoderar a las comunidades para transformar residuos en recursos mediante el conocimiento y la acción colectiva.
          </Text>
        </View>

        {/* Opciones */}
        <View style={styles.menuContainer}>
          {[
            { icon: 'earth-outline', label: 'Nuestra misión' },
            { icon: 'document-text-outline', label: 'Términos y condiciones' },
            { icon: 'shield-checkmark-outline', label: 'Política de privacidad' },
            { icon: 'people-outline', label: 'Créditos' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color="#3BAB4F" />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#777" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Impacto global */}
        <View style={styles.impactBox}>
          <Text style={styles.impactTitle}>IMPACTO GLOBAL</Text>
          <Text style={styles.impactValue}>+500K kg de CO₂ ahorrados</Text>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>EcoLoop v1.0.0</Text>
          <Text style={styles.footerSubtext}>Hecho con 💚 para el planeta</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F8', paddingHorizontal: 16, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginLeft: 8, color: '#000' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: {
    backgroundColor: '#3BAB4F',
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: { fontSize: 18, fontWeight: '700', color: '#3BAB4F' },
  version: { fontSize: 13, color: '#777' },
  descriptionBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingVertical: 24, // más grueso
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  description: { fontSize: 14, color: '#333', textAlign: 'center', lineHeight: 20 },
  menuContainer: { marginBottom: 24 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18, // más alto
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
  },
  menuIcon: {
    backgroundColor: '#E9F7EF',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  menuText: { flex: 1, fontSize: 15, color: '#000', fontWeight: '500' },
  impactBox: {
    backgroundColor: '#E0F2F1',
    borderRadius: 16,
    paddingVertical: 28, // más grueso
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  impactTitle: { fontSize: 13, fontWeight: '700', color: '#3BAB4F', marginBottom: 4 },
  impactValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  footer: { alignItems: 'center', marginBottom: 20 },
  footerText: { fontSize: 13, color: '#777' },
  footerSubtext: { fontSize: 13, color: '#3BAB4F', marginTop: 2 },
});
