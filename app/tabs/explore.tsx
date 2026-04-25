import { useAppTheme } from '@/hooks/use-app-theme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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

const formatTRY = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);

export default function RecordsScreen() {
  const { receivables, payables, cashLogs, removeReceivable, removePayable, removeCashLog } = useFinanceData();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ type?: string; overdue?: string; dueSoon?: string }>();
  const initialType = params.type === 'receivables' || params.type === 'payables' ? params.type : 'all';
  const initialOverdue = params.overdue === '1';
  const initialDueSoon = params.dueSoon === '1';
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'receivables' | 'payables' | 'cashlogs'>(
    initialType === 'all' ? 'all' : initialType
  );
  const [dueSoonOnly, setDueSoonOnly] = useState(initialDueSoon);
  const [overdueOnly, setOverdueOnly] = useState(initialOverdue);
  const [sortByAmount, setSortByAmount] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    if (params.type === 'receivables' || params.type === 'payables') {
      setActiveType(params.type);
    } else if (params.type === 'all') {
      setActiveType('all');
    }
    setOverdueOnly(params.overdue === '1');
    setDueSoonOnly(params.dueSoon === '1');
  }, [params.type, params.overdue, params.dueSoon]);

  const sortItems = <T extends { amount: number }>(items: T[]) => {
    if (sortByAmount === 'none') return items;
    return [...items].sort((a, b) =>
      sortByAmount === 'asc' ? a.amount - b.amount : b.amount - a.amount
    );
  };

  const filteredReceivables = useMemo(() => {
    const filtered = receivables.filter((item) => {
      if (dueSoonOnly && !isDueSoon(item.dueDate, 7)) return false;
      if (overdueOnly && !isOverdue(item.dueDate)) return false;
      if (!query.trim()) return true;
      const haystack = `${item.customerName} ${item.documentNo} ${item.accountName}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
    return sortItems(filtered);
  }, [receivables, query, dueSoonOnly, overdueOnly, sortByAmount]);

  const filteredPayables = useMemo(() => {
    const filtered = payables.filter((item) => {
      if (dueSoonOnly && !isDueSoon(item.dueDate, 7)) return false;
      if (overdueOnly && !isOverdue(item.dueDate)) return false;
      if (!query.trim()) return true;
      const haystack = `${item.vendorName} ${item.category} ${item.accountName}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
    return sortItems(filtered);
  }, [payables, query, dueSoonOnly, overdueOnly, sortByAmount]);

  const filteredCashLogs = useMemo(() => {
    if (!query.trim()) return cashLogs;
    return cashLogs.filter((item) => {
      const haystack = `${item.description} ${item.partnerName || ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [cashLogs, query]);

  const c = colors;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>Kayıtlar</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Alacak, ödeme ve kasa hareketlerini yönetin
        </Text>

        <TextInput
          style={[styles.searchInput, {
            backgroundColor: c.inputBg,
            borderColor: c.inputBorder,
            color: c.inputText,
          }]}
          placeholder="Ara: firma, belge no, kategori..."
          placeholderTextColor={c.textTertiary}
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'receivables', label: 'Alacak' },
            { key: 'payables', label: 'Ödeme' },
            { key: 'cashlogs', label: 'Kasa' },
          ].map(({ key, label }) => {
            const isActive = activeType === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  { backgroundColor: c.chipBg, borderColor: c.chipBorder },
                  isActive && { backgroundColor: c.chipActiveBg, borderColor: c.chipActiveBorder },
                ]}
                onPress={() => setActiveType(key as typeof activeType)}>
                <Text style={[
                  styles.filterChipText,
                  { color: c.chipText },
                  isActive && { color: c.chipActiveText },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: c.chipBg, borderColor: c.chipBorder },
              dueSoonOnly && { backgroundColor: '#FFF6ED', borderColor: '#B54708' },
            ]}
            onPress={() => setDueSoonOnly((prev) => !prev)}>
            <Text style={[
              styles.filterChipText,
              { color: c.chipText },
              dueSoonOnly && { color: '#B54708' },
            ]}>
              7g Yaklaşan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: c.chipBg, borderColor: c.chipBorder },
              overdueOnly && { backgroundColor: '#FEF3F2', borderColor: '#D92D20' },
            ]}
            onPress={() => setOverdueOnly((prev) => !prev)}>
            <Text style={[
              styles.filterChipText,
              { color: c.chipText },
              overdueOnly && { color: '#D92D20' },
            ]}>
              Gecikenler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: c.chipBg, borderColor: c.chipBorder },
              sortByAmount !== 'none' && { backgroundColor: c.chipActiveBg, borderColor: c.chipActiveBorder },
            ]}
            onPress={() => setSortByAmount((prev) =>
              prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none'
            )}>
            <Text style={[
              styles.filterChipText,
              { color: c.chipText },
              sortByAmount !== 'none' && { color: c.chipActiveText },
            ]}>
              {sortByAmount === 'none'
                ? 'Tutar Sırala'
                : sortByAmount === 'desc'
                  ? 'Tutar: Büyük-Küçük'
                  : 'Tutar: Küçük-Büyük'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kasa Hareketleri */}
        {(activeType === 'all' || activeType === 'cashlogs') && (
          <>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Kasa Hareketleri ({filteredCashLogs.length})
            </Text>
            {filteredCashLogs.length === 0 ? (
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>Kasa hareketi yok.</Text>
            ) : (
              filteredCashLogs.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                  <View style={styles.headerRow}>
                    <View style={styles.cardTitleRow}>
                      <View style={[
                        styles.cashDot,
                        { backgroundColor: item.type === 'deposit' ? c.success : c.danger },
                      ]} />
                      <Text style={[styles.cardTitle, { color: c.text }]}>{item.description}</Text>
                    </View>
                    <Text style={[
                      styles.cashAmount,
                      { color: item.type === 'deposit' ? c.success : c.danger },
                    ]}>
                      {item.type === 'deposit' ? '+' : '-'}{formatTRY(item.amount)}
                    </Text>
                  </View>
                  <Text style={[styles.meta, { color: c.textSecondary }]}>
                    {item.date}{item.partnerName ? ` • Ortak: ${item.partnerName}` : ''}
                  </Text>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: '#FEF3F2' }]}
                    onPress={() =>
                      Alert.alert('Kaydı Sil', 'Bu kasa hareketi silinsin mi? (Bakiye düzeltilecek)', [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => removeCashLog(item.id) },
                      ])
                    }>
                    <Text style={styles.deleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {/* Alacaklar */}
        {(activeType === 'all' || activeType === 'receivables') && (
          <>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Alacaklar ({filteredReceivables.length})
            </Text>
            {filteredReceivables.length === 0 ? (
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>
                Kriterlere uygun alacak kaydı yok.
              </Text>
            ) : (
              filteredReceivables.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>{item.customerName}</Text>
                    <Text style={[styles.cashAmount, { color: c.success }]}>{formatTRY(item.amount)}</Text>
                  </View>
                  <Text style={[styles.meta, { color: c.textSecondary }]}>
                    {item.documentType} • {item.documentNo || 'Belge no yok'}
                  </Text>
                  <Text style={[styles.meta, { color: c.textSecondary }]}>
                    Vade: {item.dueDate} • Hesap: {item.accountName}
                  </Text>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: '#FEF3F2' }]}
                    onPress={() =>
                      Alert.alert('Kaydı Sil', 'Bu alacak kaydı silinsin mi?', [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => removeReceivable(item.id) },
                      ])
                    }>
                    <Text style={styles.deleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {/* Ödemeler */}
        {(activeType === 'all' || activeType === 'payables') && (
          <>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Ödemeler ({filteredPayables.length})
            </Text>
            {filteredPayables.length === 0 ? (
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>
                Kriterlere uygun ödeme kaydı yok.
              </Text>
            ) : (
              filteredPayables.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.cardTitle, { color: c.text }]}>{item.vendorName}</Text>
                    <Text style={[styles.cashAmount, { color: c.danger }]}>{formatTRY(item.amount)}</Text>
                  </View>
                  <Text style={[styles.meta, { color: c.textSecondary }]}>
                    {item.category} • Öncelik: {item.priority}
                    {item.recurring && item.recurring !== 'Yok' ? ` • ${item.recurring}` : ''}
                  </Text>
                  <Text style={[styles.meta, { color: c.textSecondary }]}>
                    Vade: {item.dueDate} • Hesap: {item.accountName}
                  </Text>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: '#FEF3F2' }]}
                    onPress={() =>
                      Alert.alert('Kaydı Sil', 'Bu ödeme kaydı silinsin mi?', [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => removePayable(item.id) },
                      ])
                    }>
                    <Text style={styles.deleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 4, marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipText: { fontWeight: '600', fontSize: 12 },
  sectionTitle: { marginTop: 8, marginBottom: 8, fontWeight: '700', fontSize: 14 },
  emptyText: { marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  cardTitle: { fontWeight: '700', fontSize: 15, flex: 1 },
  meta: { marginTop: 4, fontSize: 12 },
  cashDot: { width: 10, height: 10, borderRadius: 5 },
  cashAmount: { fontWeight: '800' },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteText: { color: '#D92D20', fontWeight: '700' },
});

function parseTRDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isDueSoon(dateStr: string, withinDays: number) {
  const dueDate = parseTRDate(dateStr);
  if (!dueDate) return false;
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + withinDays);
  return dueDate >= now && dueDate <= end;
}

function isOverdue(dateStr: string) {
  const dueDate = parseTRDate(dateStr);
  if (!dueDate) return false;
  return dueDate < new Date();
}