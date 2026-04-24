import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function UnmatchedRoute() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sayfa bulunamadi</Text>
        <Text style={styles.subtitle}>Yanlis bir baglanti acildi. Ana ekrana donebilirsin.</Text>
        <Link href="/tabs" style={styles.link}>
          Ana ekrana git
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1D2939',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#D0D5DD',
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: '#84CAFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
