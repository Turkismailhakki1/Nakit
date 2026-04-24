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
import { useFinanceData } from '@/hooks/use-finance-data';
import { useLocalSearchParams } from 'expo-router';

const formatTRY = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);

export default function RecordsScreen() {
  const { receivables, payables, removeReceivable, removePayable } = useFinanceData();
  const params = useLocalSearchParams<{ type?: string; overdue?: string; dueSoon?: string }>();
  const initialType =
    params.type === 'receivables' || params.type === 'payables' ? params.type : 'all';
  const initialOverdue = params.overdue === '1';
  const initialDueSoon = params.dueSoon === '1';
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'receivables' | 'payables'>(initialType);
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
    const sorted = [...items].sort((a, b) =>
      sortByAmount === 'asc' ? a.amount - b.amount : b.amount - a.amount
    );
    return sorted;
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kayitlar</Text>
        <Text style={styles.subtitle}>Eklenen alacak ve odemeleri buradan yonet</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Ara: firma, belge no, kategori..."
          placeholderTextColor="#98A2B3"
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeType === 'all' && styles.filterChipActive]}
            onPress={() => setActiveType('all')}>
            <Text style={[styles.filterChipText, activeType === 'all' && styles.filterChipTextActive]}>
              Tumu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeType === 'receivables' && styles.filterChipActive]}
            onPress={() => setActiveType('receivables')}>
            <Text
              style={[styles.filterChipText, activeType === 'receivables' && styles.filterChipTextActive]}>
              Alacak
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeType === 'payables' && styles.filterChipActive]}
            onPress={() => setActiveType('payables')}>
            <Text style={[styles.filterChipText, activeType === 'payables' && styles.filterChipTextActive]}>
              Odeme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, dueSoonOnly && styles.filterChipWarn]}
            onPress={() => setDueSoonOnly((prev) => !prev)}>
            <Text style={[styles.filterChipText, dueSoonOnly && styles.filterChipWarnText]}>
              7g Yaklasan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, overdueOnly && styles.filterChipDanger]}
            onPress={() => setOverdueOnly((prev) => !prev)}>
            <Text style={[styles.filterChipText, overdueOnly && styles.filterChipDangerText]}>
              Gecikenler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, sortByAmount !== 'none' && styles.filterChipActive]}
            onPress={() =>
              setSortByAmount((prev) =>
                prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none'
              )
            }>
            <Text
              style={[
                styles.filterChipText,
                sortByAmount !== 'none' && styles.filterChipTextActive,
              ]}>
              {sortByAmount === 'none'
                ? 'Tutar Sirala'
                : sortByAmount === 'desc'
                  ? 'Tutar: Buyuk-Kucuk'
                  : 'Tutar: Kucuk-Buyuk'}
            </Text>
          </TouchableOpacity>
        </View>

        {(activeType === 'all' || activeType === 'receivables') && (
          <>
            <Text style={styles.sectionTitle}>Alacaklar ({filteredReceivables.length})</Text>
            {filteredReceivables.length === 0 ? (
              <Text style={styles.emptyText}>Kriterlere uygun alacak kaydi yok.</Text>
            ) : (
              filteredReceivables.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.headerRow}>
                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                    <Text style={styles.amountPositive}>{formatTRY(item.amount)}</Text>
                  </View>
                  <Text style={styles.meta}>
                    {item.documentType} • {item.documentNo || 'Belge no yok'}
                  </Text>
                  <Text style={styles.meta}>
                    Vade: {item.dueDate} • Hesap: {item.accountName}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      Alert.alert('Kaydi Sil', 'Bu alacak kaydi silinsin mi?', [
                        { text: 'Vazgec', style: 'cancel' },
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

        {(activeType === 'all' || activeType === 'payables') && (
          <>
            <Text style={styles.sectionTitle}>Odemeler ({filteredPayables.length})</Text>
            {filteredPayables.length === 0 ? (
              <Text style={styles.emptyText}>Kriterlere uygun odeme kaydi yok.</Text>
            ) : (
              filteredPayables.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.headerRow}>
                    <Text style={styles.cardTitle}>{item.vendorName}</Text>
                    <Text style={styles.amountNegative}>{formatTRY(item.amount)}</Text>
                  </View>
                  <Text style={styles.meta}>
                    {item.category} • Oncelik: {item.priority}
                  </Text>
                  <Text style={styles.meta}>
                    Vade: {item.dueDate} • Hesap: {item.accountName}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      Alert.alert('Kaydi Sil', 'Bu odeme kaydi silinsin mi?', [
                        { text: 'Vazgec', style: 'cancel' },
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
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 16, color: '#667085' },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#101828',
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: '#0F62FE',
    backgroundColor: '#E8F0FF',
  },
  filterChipWarn: {
    borderColor: '#B54708',
    backgroundColor: '#FFF6ED',
  },
  filterChipDanger: {
    borderColor: '#D92D20',
    backgroundColor: '#FEF3F2',
  },
  filterChipText: { color: '#344054', fontWeight: '600', fontSize: 12 },
  filterChipTextActive: { color: '#0F62FE' },
  filterChipWarnText: { color: '#B54708' },
  filterChipDangerText: { color: '#D92D20' },
  sectionTitle: { marginTop: 8, marginBottom: 8, color: '#344054', fontWeight: '700', fontSize: 14 },
  emptyText: { color: '#98A2B3', marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#101828', fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 },
  meta: { color: '#667085', marginTop: 4, fontSize: 12 },
  amountPositive: { color: '#12B76A', fontWeight: '800' },
  amountNegative: { color: '#F04438', fontWeight: '800' },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3F2',
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
  const now = new Date();
  return dueDate < now;
}
