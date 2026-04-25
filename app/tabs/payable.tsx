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
import { useRouter } from 'expo-router';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useAppTheme } from '@/hooks/use-app-theme';

const CATEGORIES = ['Maaş', 'Vergi', 'Kira', 'Tedarikçi', 'Fatura', 'Yakıt/Araç', 'Diğer'] as const;
type Priority = 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
const PRIORITIES: Priority[] = ['Düşük', 'Orta', 'Yüksek', 'Kritik'];
type RecurringType = 'Yok' | 'Haftalık' | 'Aylık';

function formatDatePicker(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    subtitle: { marginTop: 4, marginBottom: 18, color: colors.textSecondary },

    section: { marginBottom: 14 },
    label: { fontSize: 13, color: colors.text, marginBottom: 8, fontWeight: '600' },
    hint: { fontSize: 11, color: colors.textTertiary, marginBottom: 8, marginTop: -4 },
    row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    half: { flex: 1 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    tag: {
      borderWidth: 1,
      borderColor: colors.chipBorder,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.chipBg,
    },
    tagActive: {
      borderColor: colors.chipActiveBorder,
      backgroundColor: colors.chipActiveBg,
    },
    tagText: { color: colors.chipText, fontWeight: '600' },
    tagTextActive: { color: colors.chipActiveText },

    pill: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.chipBorder,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.chipBg,
    },
    pillActive: {
      borderColor: colors.chipActiveBorder,
      backgroundColor: colors.chipActiveBg,
    },
    pillText: { color: colors.chipText, fontWeight: '600' },
    pillTextActive: { color: colors.chipActiveText },

    priorityPill: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    priorityPillActive: {
      borderColor: colors.text,
      backgroundColor: colors.cardBorder,
    },
    priorityText: { color: colors.chipText, fontWeight: '600' },
    priorityTextActive: { color: colors.text },

    recurringInfo: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 4,
    },

    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: colors.inputText,
    },
    textArea: {
      minHeight: 90,
      textAlignVertical: 'top',
    },

    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryButtonText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
  });
}

export default function PayableFormScreen() {
  const router = useRouter();
  const { addPayable } = useFinanceData();
  const { colors, currencySymbol } = useAppTheme();
  const styles = makeStyles(colors);

  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('Tedarikçi');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('Yüksek');
  const [recurring, setRecurring] = useState<RecurringType>('Yok');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');

  const onSave = () => {
    const parsedAmount = Number(amount.replace(',', '.'));
    if (!vendorName.trim() || !parsedAmount || !dueDate.trim()) {
      Alert.alert('Eksik bilgi', 'Alıcı/tedarikçi, tutar ve vade tarihi alanlarını doldurun.');
      return;
    }

    const itemsToCreate = recurring === 'Yok' ? [1] : recurring === 'Haftalık' ? Array.from({ length: 4 }, (_, i) => i * 7) : Array.from({ length: 12 }, (_, i) => i * 30);

    itemsToCreate.forEach((dayOffset) => {
      const baseDate = parseDateParts(dueDate.trim());
      if (!baseDate) return;
      const nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + dayOffset);

      const formatted = `${String(nextDate.getDate()).padStart(2, '0')}/${String(nextDate.getMonth() + 1).padStart(2, '0')}/${nextDate.getFullYear()}`;

      addPayable({
        category: selectedCategory,
        vendorName: vendorName.trim(),
        amount: parsedAmount,
        dueDate: formatted,
        priority: selectedPriority,
        accountName: accountName.trim() || 'Garanti TL',
        note: note.trim() + (recurring !== 'Yok' && dayOffset > 0 ? ` (${recurring} tekrar)` : ''),
        recurring: recurring,
      });
    });

    setVendorName('');
    setAmount('');
    setDueDate('');
    setAccountName('');
    setNote('');
    setRecurring('Yok');
    Alert.alert(
      'Kaydedildi',
      recurring === 'Yok'
        ? 'Ödeme başarıyla eklendi.'
        : `Ödeme ${recurring.toLowerCase()} olarak ${itemsToCreate.length} kayıt oluşturuldu.`
    );
    router.push('/tabs/cashflow');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ödeme Ekle</Text>
        <Text style={styles.subtitle}>Yaklaşan borç ve giderlerinizi kaydedin</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.wrap}>
            {CATEGORIES.map((category) => {
              const active = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Alıcı / Tedarikçi</Text>
          <TextInput
            placeholder="Örn: XYZ Saç Sanayi"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={vendorName}
            onChangeText={setVendorName}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Tutar ({currencySymbol})</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Vade Tarihi</Text>
            <TextInput
              placeholder="GG/AA/YYYY"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              keyboardType="numeric"
              maxLength={10}
              value={dueDate}
              onChangeText={(text) => setDueDate(formatDatePicker(text))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ödeme Önceliği</Text>
          <View style={styles.row}>
            {PRIORITIES.map((priority) => {
              const active = priority === selectedPriority;
              return (
                <TouchableOpacity
                  key={priority}
                  style={[styles.priorityPill, active && styles.priorityPillActive]}
                  onPress={() => setSelectedPriority(priority)}>
                  <Text style={[styles.priorityText, active && styles.priorityTextActive]}>{priority}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tekrarlayan Ödeme</Text>
          <Text style={styles.hint}>Maaş, kira gibi her ay/hafta tekrar eden ödemeler için seçin</Text>
          <View style={styles.row}>
            {(['Yok', 'Haftalık', 'Aylık'] as RecurringType[]).map((type) => {
              const active = type === recurring;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setRecurring(type)}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {recurring !== 'Yok' && (
            <Text style={styles.recurringInfo}>
              {recurring === 'Haftalık'
                ? '4 haftalık (4 kayıt) otomatik oluşturulacak'
                : '12 aylık (12 kayıt) otomatik oluşturulacak'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ödeme Hesabı</Text>
          <TextInput
            placeholder="Örn: Garanti TL"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Not (Opsiyonel)</Text>
          <TextInput
            placeholder="Ek açıklama"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>Ödemeyi Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function parseDateParts(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}
