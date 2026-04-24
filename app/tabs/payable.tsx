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

const CATEGORIES = ['Maas', 'Vergi', 'Kira', 'Tedarikci', 'Fatura', 'Diger'] as const;
type Priority = 'Dusuk' | 'Orta' | 'Yuksek' | 'Kritik';
const PRIORITIES: Priority[] = ['Dusuk', 'Orta', 'Yuksek', 'Kritik'];

export default function PayableFormScreen() {
  const router = useRouter();
  const { addPayable } = useFinanceData();
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('Tedarikci');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('Yuksek');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');

  const onSave = () => {
    const parsedAmount = Number(amount.replace(',', '.'));
    if (!vendorName.trim() || !parsedAmount || !dueDate.trim()) {
      Alert.alert('Eksik bilgi', 'Alici/tedarikci, tutar ve vade tarihi alanlarini doldur.');
      return;
    }

    addPayable({
      category: selectedCategory,
      vendorName: vendorName.trim(),
      amount: parsedAmount,
      dueDate: dueDate.trim(),
      priority: selectedPriority,
      accountName: accountName.trim() || 'Garanti TL',
      note: note.trim(),
    });

    setVendorName('');
    setAmount('');
    setDueDate('');
    setAccountName('');
    setNote('');
    Alert.alert('Kaydedildi', 'Odeme basariyla eklendi.');
    router.push('/tabs/cashflow');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Odeme Ekle</Text>
        <Text style={styles.subtitle}>Yaklasan borc ve giderlerini kaydet</Text>

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
          <Text style={styles.label}>Alici / Tedarikci</Text>
          <TextInput
            placeholder="Orn: XYZ Sac Sanayi"
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
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Odeme Onceligi</Text>
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
          <Text style={styles.label}>Odeme Hesabi</Text>
          <TextInput
            placeholder="Orn: Garanti TL"
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Not (Opsiyonel)</Text>
          <TextInput
            placeholder="Ek aciklama"
            placeholderTextColor="#98A2B3"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>Odemeyi Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 18, color: '#667085' },

  section: { marginBottom: 14 },
  label: { fontSize: 13, color: '#475467', marginBottom: 8, fontWeight: '600' },
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
