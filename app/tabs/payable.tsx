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

const CATEGORIES = ['Maaş', 'Vergi', 'Kira', 'Tedarikçi', 'Fatura', 'Yakıt/Araç', 'Ortak Çekimi', 'Diğer'] as const;
type Priority = 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
const PRIORITIES: Priority[] = ['Düşük', 'Orta', 'Yüksek', 'Kritik'];
type RecurringType = 'Yok' | 'Haftalık' | 'Aylık';

function formatDatePicker(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export default function PayableFormScreen() {
  const router = useRouter();
  const { addPayable } = useFinanceData();
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
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={vendorName}
            onChangeText={setVendorName}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
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
          <View style={styles.half}>
            <Text style={styles.label}>Vade Tarihi</Text>
            <TextInput
              placeholder="GG/AA/YYYY"
              placeholderTextColor="#98A2B3"
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
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Not (Opsiyonel)</Text>
          <TextInput
            placeholder="Ek açıklama"
            placeholderTextColor="#98A2B3"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 18, color: '#667085' },

  section: { marginBottom: 14 },
  label: { fontSize: 13, color: '#475467', marginBottom: 8, fontWeight: '600' },
  hint: { fontSize: 11, color: '#98A2B3', marginBottom: 8, marginTop: -4 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  half: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  tag: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  tagActive: {
    borderColor: '#0F62FE',
    backgroundColor: '#E8F0FF',
  },
  tagText: { color: '#344054', fontWeight: '600' },
  tagTextActive: { color: '#0F62FE' },

  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    borderColor: '#0F62FE',
    backgroundColor: '#E8F0FF',
  },
  pillText: { color: '#344054', fontWeight: '600' },
  pillTextActive: { color: '#0F62FE' },

  priorityPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  priorityPillActive: {
    borderColor: '#101828',
    backgroundColor: '#EAECF0',
  },
  priorityText: { color: '#344054', fontWeight: '600' },
  priorityTextActive: { color: '#101828' },

  recurringInfo: {
    fontSize: 12,
    color: '#0F62FE',
    fontWeight: '600',
    marginTop: 4,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#101828',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  primaryButton: {
    marginTop: 8,
    backgroundColor: '#101828',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
