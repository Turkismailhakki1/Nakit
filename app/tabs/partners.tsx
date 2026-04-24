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

type Tab = 'partners' | 'withdrawals' | 'add-partner' | 'add-withdrawal';

export default function PartnersScreen() {
  const { partners, withdrawals, addPartner, addWithdrawal, removePartner, removeWithdrawal } = useFinanceData();
  const [activeTab, setActiveTab] = useState<Tab>('partners');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Şirket Ortakları</Text>
        <Text style={styles.subtitle}>Ortakları ve kasadan yapılan çekimleri yönetin</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'partners' && styles.tabActive]}
            onPress={() => setActiveTab('partners')}>
            <Text style={[styles.tabText, activeTab === 'partners' && styles.tabTextActive]}>Ortaklar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'withdrawals' && styles.tabActive]}
            onPress={() => setActiveTab('withdrawals')}>
            <Text style={[styles.tabText, activeTab === 'withdrawals' && styles.tabTextActive]}>Çekimler</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'partners' && (
          <PartnersList
            partners={partners}
            withdrawals={withdrawals}
            onAdd={() => setActiveTab('add-partner')}
            onRemove={(id) =>
              Alert.alert('Ortağı Sil', 'Bu ortak ve tüm çekimleri silinsin mi?', [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => removePartner(id) },
              ])
            }
          />
        )}

        {activeTab === 'withdrawals' && (
          <WithdrawalsList
            withdrawals={withdrawals}
            onAdd={() => setActiveTab('add-withdrawal')}
            onRemove={(id) =>
              Alert.alert('Çekimi Sil', 'Bu çekim kaydı silinsin mi?', [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => removeWithdrawal(id) },
              ])
            }
          />
        )}

        {activeTab === 'add-partner' && (
          <AddPartnerForm
            onSave={(input) => {
              addPartner(input);
              setActiveTab('partners');
            }}
            onCancel={() => setActiveTab('partners')}
          />
        )}

        {activeTab === 'add-withdrawal' && (
          <AddWithdrawalForm
            partners={partners}
            onSave={(input) => {
              addWithdrawal(input);
              setActiveTab('withdrawals');
            }}
            onCancel={() => setActiveTab('withdrawals')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PartnersList({
  partners,
  withdrawals,
  onAdd,
  onRemove,
}: {
  partners: { id: string; name: string; role: string; phone: string }[];
  withdrawals: { partnerId: string; amount: number }[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Ortak Ekle</Text>
      </TouchableOpacity>
      {partners.length === 0 ? (
        <Text style={styles.emptyText}>Henüz ortak eklenmemiş.</Text>
      ) : (
        partners.map((partner) => {
          const total = withdrawals
            .filter((w) => w.partnerId === partner.id)
            .reduce((sum, w) => sum + w.amount, 0);
          return (
            <View key={partner.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{partner.name}</Text>
                  <Text style={styles.cardMeta}>{partner.role} • {partner.phone}</Text>
                </View>
                <TouchableOpacity style={styles.deleteSmall} onPress={() => onRemove(partner.id)}>
                  <Text style={styles.deleteSmallText}>Sil</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterLabel}>Toplam Çekim</Text>
                <Text style={styles.cardFooterValue}>{formatTRY(total)}</Text>
              </View>
            </View>
          );
        })
      )}
    </>
  );
}

function WithdrawalsList({
  withdrawals,
  onAdd,
  onRemove,
}: {
  withdrawals: { id: string; partnerName: string; amount: number; date: string; description: string }[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const total = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  return (
    <>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Toplam Çekim</Text>
        <Text style={styles.totalValue}>{formatTRY(total)}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Çekim Ekle</Text>
      </TouchableOpacity>
      {withdrawals.length === 0 ? (
        <Text style={styles.emptyText}>Henüz çekim kaydı yok.</Text>
      ) : (
        withdrawals.map((w) => (
          <View key={w.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{w.partnerName}</Text>
                <Text style={styles.cardMeta}>{w.date} • {w.description}</Text>
              </View>
              <Text style={styles.withdrawalAmount}>{formatTRY(w.amount)}</Text>
            </View>
            <TouchableOpacity style={styles.deleteSmall} onPress={() => onRemove(w.id)}>
              <Text style={styles.deleteSmallText}>Sil</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </>
  );
}

function AddPartnerForm({
  onSave,
  onCancel,
}: {
  onSave: (input: { name: string; role: string; phone: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Ortak');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Yeni Ortak</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          placeholder="Örn: Mehmet Demir"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Unvan</Text>
        <TextInput
          placeholder="Örn: Ortak, Yönetici"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          value={role}
          onChangeText={setRole}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Telefon</Text>
        <TextInput
          placeholder="Örn: 0532 555 0000"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Vazgeç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            if (!name.trim()) {
              Alert.alert('Eksik bilgi', 'Ad soyad alanını doldurun.');
              return;
            }
            onSave({ name: name.trim(), role: role.trim() || 'Ortak', phone: phone.trim() });
          }}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddWithdrawalForm({
  partners,
  onSave,
  onCancel,
}: {
  partners: { id: string; name: string }[];
  onSave: (input: { partnerId: string; partnerName: string; amount: number; date: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Yeni Çekim</Text>
      {partners.length === 0 ? (
        <Text style={styles.emptyText}>Önce bir ortak ekleyin.</Text>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Ortak Seçin</Text>
            <View style={styles.partnerPicker}>
              {partners.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.partnerOption, selectedPartnerId === p.id && styles.partnerOptionActive]}
                  onPress={() => setSelectedPartnerId(p.id)}>
                  <Text style={[styles.partnerOptionText, selectedPartnerId === p.id && styles.partnerOptionTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
              placeholder="Örn: Kişisel ihtiyaç"
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
              style={styles.saveButton}
              onPress={() => {
                const parsedAmount = Number(amount.replace(',', '.'));
                if (!selectedPartnerId || !parsedAmount || !date.trim()) {
                  Alert.alert('Eksik bilgi', 'Ortak, tutar ve tarih alanlarını doldurun.');
                  return;
                }
                const partner = partners.find((p) => p.id === selectedPartnerId);
                onSave({
                  partnerId: selectedPartnerId,
                  partnerName: partner?.name || '',
                  amount: parsedAmount,
                  date: date.trim(),
                  description: description.trim() || 'Kasadan çekim',
                });
              }}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 18, color: '#667085' },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
  },
  tabActive: { borderColor: '#0F62FE', backgroundColor: '#E8F0FF' },
  tabText: { color: '#344054', fontWeight: '600' },
  tabTextActive: { color: '#0F62FE' },

  addButton: {
    backgroundColor: '#0C4A6E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: '#667085', fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#0C4A6E', fontSize: 22, fontWeight: '800' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { color: '#101828', fontWeight: '700', fontSize: 15 },
  cardMeta: { color: '#667085', fontSize: 12, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  cardFooterLabel: { color: '#667085', fontSize: 12 },
  cardFooterValue: { color: '#0C4A6E', fontWeight: '800', fontSize: 16 },
  withdrawalAmount: { color: '#F04438', fontWeight: '800', fontSize: 15 },

  deleteSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3F2',
  },
  deleteSmallText: { color: '#D92D20', fontWeight: '700', fontSize: 12 },

  emptyText: { color: '#98A2B3', textAlign: 'center', marginTop: 20 },

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
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#101828',
  },
  partnerPicker: { gap: 8 },
  partnerOption: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
  },
  partnerOptionActive: { borderColor: '#0F62FE', backgroundColor: '#E8F0FF' },
  partnerOptionText: { color: '#344054', fontWeight: '600' },
  partnerOptionTextActive: { color: '#0F62FE' },

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
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
