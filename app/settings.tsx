import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  // --- Durum (State) Yönetimi ---
  const[isDarkMode, setIsDarkMode] = useState(false);
  const [currency, setCurrency] = useState('TRY (₺)');
  const [notifyDays, setNotifyDays] = useState(1);

  // --- Fonksiyonlar ---
  const handleExportData = () => {
    // Burada ileride expo-file-system ve expo-sharing kullanarak gerçek bir JSON/CSV çıktısı alabilirsiniz.
    Alert.alert(
      "Verileri Dışa Aktar",
      "Tüm finansal verileriniz cihazınıza JSON formatında kaydedilecek. Onaylıyor musunuz?",[
        { text: "İptal", style: "cancel" },
        { text: "Dışa Aktar", onPress: () => Alert.alert("Başarılı", "Verileriniz başarıyla dışa aktarıldı!") }
      ]
    );
  };

  const handleChangeCurrency = () => {
    Alert.alert("Para Birimi Seç", "Kullanmak istediğiniz para birimini seçin",[
      { text: "TRY (₺)", onPress: () => setCurrency('TRY (₺)') },
      { text: "USD ($)", onPress: () => setCurrency('USD ($)') },
      { text: "EUR (€)", onPress: () => setCurrency('EUR (€)') },
      { text: "İptal", style: "cancel" }
    ]);
  };

  const handleChangeNotificationDays = () => {
    Alert.alert("Bildirim Süresi", "Vadesi yaklaşan ödemeler için ne zaman bildirim almak istersiniz?",[
      { text: "Aynı Gün", onPress: () => setNotifyDays(0) },
      { text: "1 Gün Önce", onPress: () => setNotifyDays(1) },
      { text: "3 Gün Önce", onPress: () => setNotifyDays(3) },
      { text: "İptal", style: "cancel" }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sayfa Başlığı Ayarı */}
      <Stack.Screen options={{ title: 'Ayarlar', headerShadowVisible: false }} />

      {/* 1. TEMA AYARLARI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color="#555" />
            <Text style={styles.rowText}>Karanlık Mod (Dark Mode)</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 2. GENEL AYARLAR (Para Birimi vb.) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel</Text>
        <TouchableOpacity style={styles.row} onPress={handleChangeCurrency}>
          <View style={styles.rowLeft}>
            <Ionicons name="cash-outline" size={24} color="#555" />
            <Text style={styles.rowText}>Para Birimi</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.valueText}>{currency}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. BİLDİRİM TERCİHLERİ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <TouchableOpacity style={styles.row} onPress={handleChangeNotificationDays}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={24} color="#555" />
            <Text style={styles.rowText}>Hatırlatıcı Süresi</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.valueText}>
              {notifyDays === 0 ? "Aynı Gün" : `${notifyDays} Gün Önce`}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. VERİ YÖNETİMİ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
        <TouchableOpacity style={styles.row} onPress={handleExportData}>
          <View style={styles.rowLeft}>
            <Ionicons name="download-outline" size={24} color="#555" />
            <Text style={styles.rowText}>Verileri Dışa Aktar</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#6e6e73',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#8e8e93',
    marginRight: 8,
  },
});