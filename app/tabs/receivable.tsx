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

const DOC_TYPES = ['Çek', 'Senet', 'Fatura'] as const;
type DocType = (typeof DOC_TYPES)[number];

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
    label: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    half: { flex: 1 },

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

export default function ReceivableFormScreen() {
  const router = useRouter();
  const { addReceivable } = useFinanceData();
  const { colors, currencySymbol } = useAppTheme();
  const styles = makeStyles(colors);

  const [docType, setDocType] = useState<DocType>('Çek');
  const [customerName, setCustomerName] = useState('');
  const [documentNo, setDocumentNo] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');

  const onSave = () => {
    const parsedAmount = Number(amount.replace(',', '.'));
    if (!customerName.trim() || !parsedAmount || !dueDate.trim()) {
      Alert.alert('Eksik bilgi', 'Müşteri, tutar ve vade tarihi alanlarını doldurun.');
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
    Alert.alert('Kaydedildi', 'Alacak başarıyla eklendi.');
    router.push('/tabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Alacak Ekle</Text>
        <Text style={styles.subtitle}>Çek, senet ve fatura tahsilatlarını kaydedin</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Belge Türü</Text>
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
          <Text style={styles.label}>Müşteri / Firma</Text>
          <TextInput
            placeholder="Örn: ABC Otomotiv A.Ş."
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Belge No</Text>
          <TextInput
            placeholder="Örn: ÇK-2026-00124"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={documentNo}
            onChangeText={setDocumentNo}
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
          <Text style={styles.label}>Tahsil Edilecek Hesap</Text>
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
          <Text style={styles.primaryButtonText}>Alacağı Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
