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

const formatTRY = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);

function formatDatePicker(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

type Tab = 'overview' | 'add-income' | 'add-expense';

const INCOME_CATEGORIES = ['Tahsilat', 'Nakit Giriş', 'Satış Geliri', 'Diğer Gelir'] as const;
const EXPENSE_CATEGORIES = ['Kasa Çıkışı', 'Acil Ödeme', 'Personel Avans', 'Diğer Gider'] as const;

export default function KasaScreen() {
  const {
    initialBalance,
    setInitialBalance,
    openingBalance,
    withdrawals,
    cashEntries,
    addCashEntry,
    removeCashEntry,
  } = useFinanceData();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(initialBalance.toString());

  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalIncome = cashEntries.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = cashEntries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

  const saveBalance = () => {
    const parsed = Number(balanceInput.replace(/\./g, '').replace(',', '.'));
    if (!parsed || parsed < 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    setInitialBalance(parsed);
    setEditingBalance(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kasa Durumu</Text>
        <Text style={styles.subtitle}>Başlangıç bakiyesi, giriş/çıkış ve ortak çekimlerini yönetin</Text>

        {activeTab === 'overview' && (
          <>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Güncel Bakiye</Text>
              <Text style={styles.balanceValue}>{formatTRY(openingBalance)}</Text>
            </View>

            <View style={styles.initialBalanceCard}>
              <View style={styles.ibHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ibLabel}>Başlangıç Bakiyesi</Text>
                  <Text style={styles.ibHint}>Kasada bulunan ilk tutar</Text>
                </View>
                {!editingBalance ? (
                  <TouchableOpacity style={styles.ibEditButton} onPress={() => { setBalanceInput(initialBalance.toString()); setEditingBalance(true); }}>
                    <Text style={styles.ibEditButtonText}>Düzenle</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {editingBalance ? (
                <View style={styles.ibEditRow}>
                  <TextInput
                    style={styles.ibInput}
                    keyboardType="numeric"
                    value={balanceInput}
                    onChangeText={setBalanceInput}
                    placeholder="Tutar girin"
                    placeholderTextColor="#98A2B3"
                  />
                  <TouchableOpacity style={styles.ibSaveButton} onPress={saveBalance}>
                    <Text style={styles.ibSaveButtonText}>Kaydet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ibCancelButton} onPress={() => setEditingBalance(false)}>
                    <Text style={styles.ibCancelButtonText}>Vazgeç</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.ibValue}>{formatTRY(initialBalance)}</Text>
              )}
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summaryIncome]}>
                <Text style={styles.summaryCardLabel}>Nakit Giriş</Text>
                <Text style={styles.summaryCardValueGreen}>{formatTRY(totalIncome)}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryExpense]}>
                <Text style={styles.summaryCardLabel}>Nakit Çıkış</Text>
                <Text style={styles.summaryCardValueRed}>{formatTRY(totalExpense + totalWithdrawals)}</Text>
              </View>
            </View>

            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Bakiye Hesaplama</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Başlangıç Bakiyesi</Text>
                <Text style={styles.breakdownValue}>{formatTRY(initialBalance)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelGreen}>+ Nakit Giriş</Text>
                <Text style={styles.breakdownValueGreen}>{formatTRY(totalIncome)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelRed}>- Nakit Çıkış</Text>
                <Text style={styles.breakdownValueRed}>{formatTRY(totalExpense)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelRed}>- Ortak Çekimleri</Text>
                <Text style={styles.breakdownValueRed}>{formatTRY(totalWithdrawals)}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                <Text style={styles.breakdownTotalLabel}>= Güncel Bakiye</Text>
                <Text style={styles.breakdownTotalValue}>{formatTRY(openingBalance)}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionIncome} onPress={() => setActiveTab('add-income')}>
                <Text style={styles.actionIncomeText}>+ Nakit Giriş</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionExpense} onPress={() => setActiveTab('add-expense')}>
                <Text style={styles.actionExpenseText}>- Nakit Çıkış</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Son Hareketler</Text>
            {cashEntries.length === 0 ? (
              <Text style={styles.emptyText}>Henüz kasa hareketi yok.</Text>
            ) : (
              cashEntries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryLeft}>
                    <View style={[styles.entryDot, entry.type === 'income' ? styles.dotGreen : styles.dotRed]} />
                    <View>
                      <Text style={styles.entryTitle}>{entry.description || entry.category}</Text>
                      <Text style={styles.entryMeta}>{entry.date} • {entry.category}</Text>
                    </View>
                  </View>
                  <View style={styles.entryRight}>
                    <Text style={[styles.entryAmount, entry.type === 'income' ? styles.amountGreen : styles.amountRed]}>
                      {entry.type === 'income' ? '+' : '-'}{formatTRY(entry.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert('Sil', 'Bu hareket silinsin mi?', [
                          { text: 'Vazgeç', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: () => removeCashEntry(entry.id) },
                        ])
                      }>
                      <Text style={styles.entryDelete}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'add-income' && (
          <CashEntryForm
            type="income"
            categories={INCOME_CATEGORIES}
            onSave={(input) => {
              addCashEntry(input);
              setActiveTab('overview');
            }}
            onCancel={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'add-expense' && (
          <CashEntryForm
            type="expense"
            categories={EXPENSE_CATEGORIES}
            onSave={(input) => {
              addCashEntry(input);
              setActiveTab('overview');
            }}
            onCancel={() => setActiveTab('overview')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CashEntryForm({
  type,
  categories,
  onSave,
  onCancel,
}: {
  type: 'income' | 'expense';
  categories: readonly string[];
  onSave: (input: { type: 'income' | 'expense'; amount: number; date: string; description: string; category: string }) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const isIncome = type === 'income';

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>{isIncome ? 'Nakit Giriş' : 'Nakit Çıkış'}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.wrap}>
          {categories.map((cat) => {
            const active = cat === category;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.tag, active && styles.tagActive]}
                onPress={() => setCategory(cat)}>
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tutar (TRY)</Text>
        <TextInput
          placeholder="0"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tarih</Text>
        <TextInput
          placeholder="GG/AA/YYYY"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          keyboardType="numeric"
          maxLength={10}
          value={date}
          onChangeText={(text) => setDate(formatDatePicker(text))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          placeholder="Opsiyonel açıklama"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Vazgeç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, !isIncome && styles.saveButtonRed]}
          onPress={() => {
            const parsedAmount = Number(amount.replace(',', '.'));
            if (!parsedAmount || !date.trim()) {
              Alert.alert('Eksik bilgi', 'Tutar ve tarih alanlarını doldurun.');
              return;
            }
            onSave({
              type,
              amount: parsedAmount,
              date: date.trim(),
              description: description.trim() || category,
              category,
            });
          }}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 18, color: '#667085' },

  balanceCard: {
    backgroundColor: '#0C4A6E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  balanceLabel: { color: '#93C5FD', fontSize: 14, fontWeight: '500' },
  balanceValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 6 },

  initialBalanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 14,
  },
  ibHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ibLabel: { fontSize: 14, fontWeight: '700', color: '#101828' },
  ibHint: { fontSize: 12, color: '#667085', marginTop: 2 },
  ibEditButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F0FF',
  },
  ibEditButtonText: { color: '#0F62FE', fontWeight: '700', fontSize: 13 },
  ibEditRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  ibInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#101828',
    fontSize: 16,
    fontWeight: '700',
  },
  ibSaveButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0C4A6E',
  },
  ibSaveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  ibCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
  },
  ibCancelButtonText: { color: '#344054', fontWeight: '700', fontSize: 13 },
  ibValue: { fontSize: 22, fontWeight: '800', color: '#101828', marginTop: 8 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  summaryIncome: { borderLeftWidth: 3, borderLeftColor: '#12B76A' },
  summaryExpense: { borderLeftWidth: 3, borderLeftColor: '#F04438' },
  summaryCardLabel: { fontSize: 12, color: '#667085', fontWeight: '500' },
  summaryCardValueGreen: { fontSize: 17, fontWeight: '800', color: '#12B76A', marginTop: 4 },
  summaryCardValueRed: { fontSize: 17, fontWeight: '800', color: '#F04438', marginTop: 4 },

  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 14,
  },
  breakdownTitle: { fontSize: 15, fontWeight: '700', color: '#101828', marginBottom: 10 },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  breakdownLabel: { fontSize: 13, color: '#475467' },
  breakdownLabelGreen: { fontSize: 13, color: '#12B76A', fontWeight: '600' },
  breakdownLabelRed: { fontSize: 13, color: '#F04438', fontWeight: '600' },
  breakdownValue: { fontSize: 13, color: '#101828', fontWeight: '600' },
  breakdownValueGreen: { fontSize: 13, color: '#12B76A', fontWeight: '700' },
  breakdownValueRed: { fontSize: 13, color: '#F04438', fontWeight: '700' },
  breakdownTotal: { borderTopWidth: 2, borderTopColor: '#101828', marginTop: 4 },
  breakdownTotalLabel: { fontSize: 14, color: '#101828', fontWeight: '800' },
  breakdownTotalValue: { fontSize: 14, color: '#0C4A6E', fontWeight: '800' },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionIncome: {
    flex: 1,
    backgroundColor: '#12B76A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionIncomeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  actionExpense: {
    flex: 1,
    backgroundColor: '#F04438',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionExpenseText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#101828', marginBottom: 10 },
  emptyText: { color: '#98A2B3', textAlign: 'center', marginTop: 10 },

  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  entryDot: { width: 10, height: 10, borderRadius: 5 },
  dotGreen: { backgroundColor: '#12B76A' },
  dotRed: { backgroundColor: '#F04438' },
  entryTitle: { fontSize: 14, fontWeight: '700', color: '#101828' },
  entryMeta: { fontSize: 11, color: '#667085', marginTop: 2 },
  entryRight: { alignItems: 'flex-end', gap: 4 },
  entryAmount: { fontSize: 14, fontWeight: '800' },
  amountGreen: { color: '#12B76A' },
  amountRed: { color: '#F04438' },
  entryDelete: { fontSize: 11, color: '#D92D20', fontWeight: '700' },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#101828', marginBottom: 14 },
  section: { marginBottom: 14 },
  label: { fontSize: 13, color: '#475467', marginBottom: 8, fontWeight: '600' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  tagActive: { borderColor: '#0F62FE', backgroundColor: '#E8F0FF' },
  tagText: { color: '#344054', fontWeight: '600' },
  tagTextActive: { color: '#0F62FE' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#101828',
  },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: { color: '#344054', fontWeight: '700' },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#0C4A6E',
  },
  saveButtonRed: { backgroundColor: '#F04438' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
