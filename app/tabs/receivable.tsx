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

const DOC_TYPES = ['Cek', 'Senet', 'Fatura'] as const;
type DocType = (typeof DOC_TYPES)[number];

export default function ReceivableFormScreen() {
  const router = useRouter();
  const { addReceivable } = useFinanceData();
  const [docType, setDocType] = useState<DocType>('Cek');
  const [customerName, setCustomerName] = useState('');
  const [documentNo, setDocumentNo] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');

  const onSave = () => {
    const parsedAmount = Number(amount.replace(',', '.'));
    if (!customerName.trim() || !parsedAmount || !dueDate.trim()) {
      Alert.alert('Eksik bilgi', 'Musteri, tutar ve vade tarihi alanlarini doldur.');
      return;
    }

    addReceivable({
      customerName: customerName.trim(),
      documentType: docType,
      documentNo: documentNo.trim(),
      amount: parsedAmount,
      dueDate: dueDate.trim(),
      accountName: accountName.trim() || 'Garanti TL',
      note: note.trim(),
    });

    setCustomerName('');
    setDocumentNo('');
    setAmount('');
    setDueDate('');
    setAccountName('');
    setNote('');
    Alert.alert('Kaydedildi', 'Alacak basariyla eklendi.');
    router.push('/tabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Alacak Ekle</Text>
        <Text style={styles.subtitle}>Cek, senet ve fatura tahsilatlarini kaydet</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Belge Turu</Text>
          <View style={styles.row}>
            {DOC_TYPES.map((type) => {
              const active = type === docType;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setDocType(type)}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Musteri/Firma</Text>
          <TextInput
            placeholder="Orn: ABC Otomotiv A.S."
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Belge No</Text>
          <TextInput
            placeholder="Orn: CK-2026-00124"
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={documentNo}
            onChangeText={setDocumentNo}
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
          <Text style={styles.label}>Tahsil Edilecek Hesap</Text>
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
          <Text style={styles.primaryButtonText}>Alacagi Kaydet</Text>
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
