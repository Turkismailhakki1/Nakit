import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFinanceData } from '@/hooks/use-finance-data';

type ThemeOption = 'light' | 'dark' | 'system';
type CurrencyOption = 'TRY' | 'USD' | 'EUR' | 'GBP';

const THEME_OPTIONS: { label: string; value: ThemeOption }[] = [
  { label: 'Gündüz', value: 'light' },
  { label: 'Gece', value: 'dark' },
  { label: 'Sistem', value: 'system' },
];

const CURRENCY_OPTIONS: { label: string; value: CurrencyOption; symbol: string }[] = [
  { label: 'Türk Lirası', value: 'TRY', symbol: '₺' },
  { label: 'ABD Doları', value: 'USD', symbol: '$' },
  { label: 'Euro', value: 'EUR', symbol: '€' },
  { label: 'İngiliz Sterlini', value: 'GBP', symbol: '£' },
];

const NOTIF_DAYS_OPTIONS = [1, 2, 3, 5, 7];

export default function SettingsScreen() {
  const { settings, updateSettings, partners, addPartner, removePartner } = useFinanceData();
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');

  const handleAddPartner = () => {
    if (!newPartnerName.trim()) {
      Alert.alert('Hata', 'Ortak adını girin.');
      return;
    }
    addPartner({ name: newPartnerName.trim(), phone: newPartnerPhone.trim() });
    setNewPartnerName('');
    setNewPartnerPhone('');
  };

  const handleExport = () => {
    Alert.alert('Dışa Aktarma', 'Veriler JSON formatında kopyalandı. (Demo)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Uygulama tercihlerinizi yönetin</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tema</Text>
          <Text style={styles.cardHint}>Gece/gündüz modu veya sistem ayarını takip et</Text>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = settings.theme === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => updateSettings({ theme: opt.value })}>
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Para Birimi</Text>
          <Text style={styles.cardHint}>Tüm tutarlar bu para birimiyle gösterilecek</Text>
          <View style={styles.optionRow}>
            {CURRENCY_OPTIONS.map((opt) => {
              const active = settings.currency === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => updateSettings({ currency: opt.value })}>
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                    {opt.symbol} {opt.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bildirim Tercihleri</Text>
          <Text style={styles.cardHint}>Vadesi yaklaşan ödemeler için ne zaman bildirim almak istersiniz?</Text>
          <View style={styles.optionRow}>
            {NOTIF_DAYS_OPTIONS.map((days) => {
              const active = settings.notificationDaysBefore === days;
              return (
                <TouchableOpacity
                  key={days}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => updateSettings({ notificationDaysBefore: days })}>
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                    {days} gün önce
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ortaklar</Text>
          <Text style={styles.cardHint}>Kasadan çekim yapacak ortakları tanımlayın</Text>

          {partners.length > 0 && (
            <View style={styles.partnerList}>
              {partners.map((p) => (
                <View key={p.id} style={styles.partnerRow}>
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>{p.name}</Text>
                    {p.phone ? <Text style={styles.partnerPhone}>{p.phone}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={styles.partnerDelete}
                    onPress={() =>
                      Alert.alert('Sil', `${p.name} silinsin mi?`, [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => removePartner(p.id) },
                      ])
                    }>
                    <Text style={styles.partnerDeleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.addPartnerRow}>
            <TextInput
              style={styles.addPartnerInput}
              placeholder="Ortak adı"
              placeholderTextColor="#98A2B3"
              value={newPartnerName}
              onChangeText={setNewPartnerName}
            />
            <TextInput
              style={[styles.addPartnerInput, styles.addPartnerInputPhone]}
              placeholder="Telefon"
              placeholderTextColor="#98A2B3"
              keyboardType="phone-pad"
              value={newPartnerPhone}
              onChangeText={setNewPartnerPhone}
            />
            <TouchableOpacity style={styles.addPartnerBtn} onPress={handleAddPartner}>
              <Text style={styles.addPartnerBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Veri Dışa Aktarma</Text>
          <Text style={styles.cardHint}>Tüm kayıtlarınızı JSON formatında dışa aktarın</Text>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportButtonText}>Verileri Dışa Aktar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 18, color: '#667085' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#EAECF0', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#101828', marginBottom: 4 },
  cardHint: { fontSize: 12, color: '#667085', marginBottom: 12 },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  optionChipActive: { borderColor: '#0F62FE', backgroundColor: '#E8F0FF' },
  optionChipText: { color: '#344054', fontWeight: '600', fontSize: 13 },
  optionChipTextActive: { color: '#0F62FE' },

  partnerList: { marginBottom: 12 },
  partnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F2F4F7' },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 14, fontWeight: '700', color: '#101828' },
  partnerPhone: { fontSize: 12, color: '#667085', marginTop: 2 },
  partnerDelete: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FEF3F2' },
  partnerDeleteText: { color: '#D92D20', fontWeight: '700', fontSize: 12 },

  addPartnerRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addPartnerInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: '#101828', fontSize: 13 },
  addPartnerInputPhone: { flex: 0.7 },
  addPartnerBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0C4A6E' },
  addPartnerBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  exportButton: { backgroundColor: '#0C4A6E', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  exportButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
