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
import { useAppTheme } from '@/hooks/use-app-theme';

type ThemeOption = 'light' | 'dark' | 'system';
type CurrencyOption = 'TRY' | 'USD' | 'EUR' | 'GBP';

const THEME_OPTIONS: { label: string; value: ThemeOption; icon: string }[] = [
  { label: 'Gündüz', value: 'light', icon: '\u2600' },
  { label: 'Gece', value: 'dark', icon: '\u263D' },
  { label: 'Sistem', value: 'system', icon: '\u2699' },
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
  const { colors } = useAppTheme();
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

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Ayarlar</Text>
        <Text style={s.subtitle}>Uygulama tercihlerinizi yönetin</Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Tema</Text>
          <Text style={s.cardHint}>Gece/gündüz modu veya sistem ayarını takip et</Text>
          <View style={s.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = settings.theme === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.themeCard, active && s.themeCardActive]}
                  onPress={() => updateSettings({ theme: opt.value })}>
                  <Text style={[s.themeIcon, active && s.themeIconActive]}>{opt.icon}</Text>
                  <Text style={[s.themeLabel, active && s.themeLabelActive]}>{opt.label}</Text>
                  {active && <View style={s.themeCheck}><Text style={s.themeCheckText}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Para Birimi</Text>
          <Text style={s.cardHint}>Tüm tutarlar bu para birimiyle gösterilecek</Text>
          <View style={s.optionRow}>
            {CURRENCY_OPTIONS.map((opt) => {
              const active = settings.currency === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.optionChip, active && s.optionChipActive]}
                  onPress={() => updateSettings({ currency: opt.value })}>
                  <Text style={[s.optionChipText, active && s.optionChipTextActive]}>
                    {opt.symbol} {opt.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Bildirim Tercihleri</Text>
          <Text style={s.cardHint}>Vadesi yaklaşan ödemeler için ne zaman bildirim almak istersiniz?</Text>
          <View style={s.optionRow}>
            {NOTIF_DAYS_OPTIONS.map((days) => {
              const active = settings.notificationDaysBefore === days;
              return (
                <TouchableOpacity
                  key={days}
                  style={[s.optionChip, active && s.optionChipActive]}
                  onPress={() => updateSettings({ notificationDaysBefore: days })}>
                  <Text style={[s.optionChipText, active && s.optionChipTextActive]}>
                    {days} gün önce
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Ortaklar</Text>
          <Text style={s.cardHint}>Kasadan çekim yapacak ortakları tanımlayın</Text>

          {partners.length > 0 && (
            <View style={s.partnerList}>
              {partners.map((p) => (
                <View key={p.id} style={s.partnerRow}>
                  <View style={s.partnerInfo}>
                    <Text style={s.partnerName}>{p.name}</Text>
                    {p.phone ? <Text style={s.partnerPhone}>{p.phone}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={s.partnerDelete}
                    onPress={() =>
                      Alert.alert('Sil', `${p.name} silinsin mi?`, [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => removePartner(p.id) },
                      ])
                    }>
                    <Text style={s.partnerDeleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={s.addPartnerRow}>
            <TextInput
              style={s.addPartnerInput}
              placeholder="Ortak adı"
              placeholderTextColor={colors.textTertiary}
              value={newPartnerName}
              onChangeText={setNewPartnerName}
            />
            <TextInput
              style={[s.addPartnerInput, s.addPartnerInputPhone]}
              placeholder="Telefon"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              value={newPartnerPhone}
              onChangeText={setNewPartnerPhone}
            />
            <TouchableOpacity style={s.addPartnerBtn} onPress={handleAddPartner}>
              <Text style={s.addPartnerBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Veri Dışa Aktarma</Text>
          <Text style={s.cardHint}>Tüm kayıtlarınızı JSON formatında dışa aktarın</Text>
          <TouchableOpacity style={s.exportButton} onPress={handleExport}>
            <Text style={s.exportButtonText}>Verileri Dışa Aktar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { marginTop: 4, marginBottom: 18, color: c.textSecondary },

    card: { backgroundColor: c.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: c.cardBorder, marginBottom: 14 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 4 },
    cardHint: { fontSize: 12, color: c.textSecondary, marginBottom: 12 },

    themeRow: { flexDirection: 'row', gap: 10 },
    themeCard: {
      flex: 1,
      backgroundColor: c.bg,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      gap: 6,
    },
    themeCardActive: { borderColor: c.chipActiveBorder, backgroundColor: c.chipActiveBg },
    themeIcon: { fontSize: 28, color: c.textSecondary },
    themeIconActive: { color: c.chipActiveText },
    themeLabel: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
    themeLabelActive: { color: c.chipActiveText },
    themeCheck: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.chipActiveBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeCheckText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: { borderWidth: 1, borderColor: c.chipBorder, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: c.chipBg },
    optionChipActive: { borderColor: c.chipActiveBorder, backgroundColor: c.chipActiveBg },
    optionChipText: { color: c.chipText, fontWeight: '600', fontSize: 13 },
    optionChipTextActive: { color: c.chipActiveText },

    partnerList: { marginBottom: 12 },
    partnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.divider },
    partnerInfo: { flex: 1 },
    partnerName: { fontSize: 14, fontWeight: '700', color: c.text },
    partnerPhone: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    partnerDelete: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FEF3F2' },
    partnerDeleteText: { color: '#D92D20', fontWeight: '700', fontSize: 12 },

    addPartnerRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    addPartnerInput: { flex: 1, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: c.inputText, fontSize: 13 },
    addPartnerInputPhone: { flex: 0.7 },
    addPartnerBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: c.primary },
    addPartnerBtnText: { color: c.primaryText, fontWeight: '700', fontSize: 13 },

    exportButton: { backgroundColor: c.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    exportButtonText: { color: c.primaryText, fontWeight: '700', fontSize: 14 },
  });
}
