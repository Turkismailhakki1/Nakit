import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRouter } from 'expo-router';

const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

function getTodayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { openingBalance, setOpeningBalance, receivables, payables, partners, cashLogs, addCashLog } = useFinanceData();
  const { colors, formatCurrency } = useAppTheme();
  const today = new Date();
  const in7Days = addDays(today, 7);
  const in30Days = addDays(today, 30);

  const expectedInflow30 = sumByWindow(receivables, today, in30Days);
  const expectedOutflow30 = sumByWindow(payables, today, in30Days);
  const projectedClosing30 = openingBalance + expectedInflow30 - expectedOutflow30;
  const receivablesDue7d = countByWindow(receivables, today, in7Days);
  const payablesDue7d = countByWindow(payables, today, in7Days);
  const overdueReceivables = countOverdue(receivables, today);
  const overduePayables = countOverdue(payables, today);
  const riskDays = buildRiskDays(openingBalance, receivables, payables, today, 30);
  const netFlow30 = expectedInflow30 - expectedOutflow30;

  const totalWithdrawn = cashLogs.filter((l) => l.type === 'withdrawal').reduce((s, l) => s + l.amount, 0);
  const totalDeposited = cashLogs.filter((l) => l.type === 'deposit').reduce((s, l) => s + l.amount, 0);

  const [cashModalVisible, setCashModalVisible] = useState(false);
  const [cashType, setCashType] = useState<'withdrawal' | 'deposit'>('withdrawal');
  const [cashAmount, setCashAmount] = useState('');
  const [cashDesc, setCashDesc] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  const openCashModal = (type: 'withdrawal' | 'deposit') => {
    setCashType(type);
    setCashAmount('');
    setCashDesc('');
    setSelectedPartnerId('');
    setCashModalVisible(true);
  };

  const saveCashEntry = () => {
    const parsed = Number(cashAmount.replace(',', '.'));
    if (!parsed || parsed <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    const partner = partners.find((p) => p.id === selectedPartnerId);
    addCashLog({
      type: cashType,
      amount: parsed,
      date: getTodayStr(),
      description: cashDesc.trim() || (cashType === 'withdrawal' ? 'Kasadan para çekildi' : 'Kasaya para eklendi'),
      partnerId: selectedPartnerId || undefined,
      partnerName: partner?.name || undefined,
    });
    setCashModalVisible(false);
  };

  const handleEditBalance = () => {
    Alert.prompt(
      'Bakiyeyi Düzenle',
      'Kasada bulunan toplam tutarı girin:',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaydet',
          onPress: (text) => {
            const parsed = Number((text || '').replace(/\./g, '').replace(',', '.'));
            if (!parsed || parsed < 0) {
              Alert.alert('Hata', 'Geçerli bir tutar girin.');
              return;
            }
            setOpeningBalance(parsed);
          },
        },
      ],
      'plain-text',
      openingBalance.toString()
    );
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.headerTitle}>Nakit Akış</Text>
          </View>
          <TouchableOpacity style={s.headerAction} onPress={() => router.push('/tabs/notifications')}>
            <View style={s.bellIcon}>
              <Text style={s.bellIconText}>!</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={s.balanceHero}>
          <View style={s.balanceHeroInner}>
            <Text style={s.balanceLabel}>Toplam Bakiye</Text>
            <Text style={s.balanceValue}>{formatCurrency(openingBalance)}</Text>
            <View style={s.balanceTrendRow}>
              <View style={[s.trendBadge, netFlow30 >= 0 ? s.trendPositive : s.trendNegative]}>
                <Text style={s.trendIcon}>{netFlow30 >= 0 ? '\u2191' : '\u2193'}</Text>
                <Text style={[s.trendText, netFlow30 >= 0 ? s.trendTextPositive : s.trendTextNegative]}>
                  {netFlow30 >= 0 ? '+' : ''}{formatCompact(netFlow30)} TL 30g
                </Text>
              </View>
            </View>
          </View>
          <View style={s.balanceDecorCircle1} />
          <View style={s.balanceDecorCircle2} />
          <View style={s.balanceActions}>
            <TouchableOpacity style={s.balanceActionBtn} onPress={() => openCashModal('withdrawal')}>
              <Text style={s.balanceActionIcon}>-</Text>
              <Text style={s.balanceActionLabel}>Çek</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.balanceActionBtn} onPress={() => openCashModal('deposit')}>
              <Text style={s.balanceActionIcon}>+</Text>
              <Text style={s.balanceActionLabel}>Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.balanceEditBtn} onPress={handleEditBalance}>
              <Text style={s.balanceEditBtnText}>Bakiyeyi Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(totalWithdrawn > 0 || totalDeposited > 0) && (
          <View style={s.cashSummaryRow}>
            <View style={[s.cashSummaryCard, s.cashSummaryIn]}>
              <Text style={s.cashSummaryLabel}>Kasaya Giren</Text>
              <Text style={s.cashSummaryValueGreen}>{formatCurrency(totalDeposited)}</Text>
            </View>
            <View style={[s.cashSummaryCard, s.cashSummaryOut]}>
              <Text style={s.cashSummaryLabel}>Kasadan Çıkan</Text>
              <Text style={s.cashSummaryValueRed}>{formatCurrency(totalWithdrawn)}</Text>
            </View>
          </View>
        )}

        <View style={s.flowRow}>
          <View style={[s.flowCard, s.flowInflow]}>
            <View style={s.flowIconWrap}><Text style={s.flowIconInflow}>+</Text></View>
            <View style={s.flowTextWrap}>
              <Text style={s.flowLabel}>30g Beklenen Giriş</Text>
              <Text style={s.flowValuePositive}>{formatCurrency(expectedInflow30)}</Text>
            </View>
          </View>
          <View style={[s.flowCard, s.flowOutflow]}>
            <View style={s.flowIconWrap}><Text style={s.flowIconOutflow}>-</Text></View>
            <View style={s.flowTextWrap}>
              <Text style={s.flowLabel}>30g Beklenen Çıkış</Text>
              <Text style={s.flowValueNegative}>{formatCurrency(expectedOutflow30)}</Text>
            </View>
          </View>
        </View>

        <View style={s.projectionCard}>
          <View style={s.projectionHeader}>
            <Text style={s.projectionLabel}>30g Kapanış Projeksiyonu</Text>
            <View style={[s.projectionBadge, projectedClosing30 < 0 && s.projectionBadgeDanger]}>
              <Text style={[s.projectionBadgeText, projectedClosing30 < 0 && s.projectionBadgeTextDanger]}>
                {projectedClosing30 < 0 ? 'RİSK' : 'STABİL'}
              </Text>
            </View>
          </View>
          <Text style={[s.projectionValue, projectedClosing30 < 0 && s.projectionValueDanger]}>
            {formatCurrency(projectedClosing30)}
          </Text>
          <View style={s.projectionBar}>
            <View style={s.projectionBarTrack}>
              <View
                style={[
                  s.projectionBarFill,
                  projectedClosing30 >= 0 ? s.projectionBarPositive : s.projectionBarNegative,
                  { width: `${Math.min(Math.max((Math.abs(projectedClosing30) / (openingBalance || 1)) * 100, 5), 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Yaklaşan Vadeler</Text>
        <View style={s.deadlineRow}>
          <TouchableOpacity style={s.deadlineCard} onPress={() => router.push('/tabs/explore?type=receivables&dueSoon=1')} activeOpacity={0.7}>
            <View style={s.deadlineIconWrap}><Text style={s.deadlineIconInflow}>+</Text></View>
            <Text style={s.deadlineLabel}>7g Tahsilat</Text>
            <Text style={s.deadlineCount}>{receivablesDue7d}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.deadlineCard} onPress={() => router.push('/tabs/explore?type=payables&dueSoon=1')} activeOpacity={0.7}>
            <View style={s.deadlineIconWrap}><Text style={s.deadlineIconOutflow}>-</Text></View>
            <Text style={s.deadlineLabel}>7g Ödeme</Text>
            <Text style={s.deadlineCount}>{payablesDue7d}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Geciken Kayıtlar</Text>
        <View style={s.overdueRow}>
          <TouchableOpacity style={s.overdueCard} onPress={() => router.push('/tabs/explore?type=receivables&overdue=1')} activeOpacity={0.7}>
            <View style={[s.overdueDot, s.overdueDotWarn]} />
            <View style={s.overdueTextWrap}>
              <Text style={s.overdueLabel}>Geciken Alacak</Text>
              <Text style={s.overdueValueWarn}>{overdueReceivables}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={s.overdueCard} onPress={() => router.push('/tabs/explore?type=payables&overdue=1')} activeOpacity={0.7}>
            <View style={[s.overdueDot, s.overdueDotDanger]} />
            <View style={s.overdueTextWrap}>
              <Text style={s.overdueLabel}>Geciken Ödeme</Text>
              <Text style={s.overdueValueDanger}>{overduePayables}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {riskDays.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Riskli Günler</Text>
            <View style={s.riskCard}>
              {riskDays.map((day, index) => (
                <View key={index} style={[s.riskRow, index > 0 && s.riskRowBorder]}>
                  <View style={s.riskRowLeft}>
                    <View style={s.riskDot} />
                    <Text style={s.riskDate}>{day.date}</Text>
                  </View>
                  <Text style={s.riskAmount}>{formatCurrency(day.projectedBalance)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={s.ctaButton} onPress={() => router.push('/tabs/cashflow')} activeOpacity={0.8}>
          <Text style={s.ctaText}>Detaylı Nakit Takvimi</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={cashModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>
              {cashType === 'withdrawal' ? 'Kasadan Para Çek' : 'Kasaya Para Ekle'}
            </Text>

            <View style={s.modalSection}>
              <Text style={s.modalLabel}>Tutar</Text>
              <TextInput
                style={s.modalInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={cashAmount}
                onChangeText={setCashAmount}
                autoFocus
              />
            </View>

            {cashType === 'withdrawal' && partners.length > 0 && (
              <View style={s.modalSection}>
                <Text style={s.modalLabel}>Bu kime yazılacak?</Text>
                <View style={s.partnerWrap}>
                  <TouchableOpacity
                    style={[s.partnerChip, !selectedPartnerId && s.partnerChipActive]}
                    onPress={() => setSelectedPartnerId('')}>
                    <Text style={[s.partnerChipText, !selectedPartnerId && s.partnerChipTextActive]}>Genel</Text>
                  </TouchableOpacity>
                  {partners.map((p) => {
                    const active = p.id === selectedPartnerId;
                    return (
                      <TouchableOpacity key={p.id} style={[s.partnerChip, active && s.partnerChipActive]} onPress={() => setSelectedPartnerId(p.id)}>
                        <Text style={[s.partnerChipText, active && s.partnerChipTextActive]}>{p.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={s.modalSection}>
              <Text style={s.modalLabel}>Açıklama</Text>
              <TextInput
                style={s.modalInput}
                placeholder={cashType === 'withdrawal' ? 'Kasadan para çekildi' : 'Kasaya para eklendi'}
                placeholderTextColor={colors.textTertiary}
                value={cashDesc}
                onChangeText={setCashDesc}
              />
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setCashModalVisible(false)}>
                <Text style={s.modalCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalSave, cashType === 'withdrawal' ? s.modalSaveRed : s.modalSaveGreen]}
                onPress={saveCashEntry}>
                <Text style={s.modalSaveText}>{cashType === 'withdrawal' ? 'Çek' : 'Ekle'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 14, color: c.textSecondary, fontWeight: '500' },
    headerTitle: { fontSize: 26, fontWeight: '800', color: c.text, marginTop: 2 },
    headerAction: { padding: 8 },
    bellIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center' },
    bellIconText: { fontSize: 16, fontWeight: '800', color: c.textSecondary },

    balanceHero: { backgroundColor: c.heroBg, borderRadius: 20, padding: 24, marginBottom: 16, overflow: 'hidden', position: 'relative' },
    balanceHeroInner: { position: 'relative', zIndex: 1 },
    balanceLabel: { color: c.heroSubtext, fontSize: 14, fontWeight: '500', letterSpacing: 0.5 },
    balanceValue: { color: c.heroText, fontSize: 34, fontWeight: '800', marginTop: 8, letterSpacing: -0.5 },
    balanceTrendRow: { flexDirection: 'row', marginTop: 12 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, gap: 4 },
    trendPositive: { backgroundColor: 'rgba(18, 183, 106, 0.2)' },
    trendNegative: { backgroundColor: 'rgba(240, 68, 56, 0.2)' },
    trendIcon: { fontSize: 14, fontWeight: '800', color: c.heroText },
    trendText: { fontSize: 12, fontWeight: '700' },
    trendTextPositive: { color: '#12B76A' },
    trendTextNegative: { color: '#F04438' },
    balanceDecorCircle1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: c.heroDecor },
    balanceDecorCircle2: { position: 'absolute', bottom: -40, right: 40, width: 80, height: 80, borderRadius: 40, backgroundColor: c.heroDecor },

    balanceActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, position: 'relative', zIndex: 1 },
    balanceActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: c.heroBtnBg, borderWidth: 1, borderColor: c.heroBtnBorder },
    balanceActionIcon: { color: c.heroText, fontSize: 16, fontWeight: '800' },
    balanceActionLabel: { color: c.heroBtnText, fontSize: 12, fontWeight: '600' },
    balanceEditBtn: { marginLeft: 'auto', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    balanceEditBtnText: { color: c.heroBtnText, fontSize: 12, fontWeight: '600' },

    cashSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    cashSummaryCard: { flex: 1, backgroundColor: c.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: c.cardBorder },
    cashSummaryIn: { borderLeftWidth: 3, borderLeftColor: c.success },
    cashSummaryOut: { borderLeftWidth: 3, borderLeftColor: c.danger },
    cashSummaryLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    cashSummaryValueGreen: { fontSize: 17, fontWeight: '800', color: c.success, marginTop: 4 },
    cashSummaryValueRed: { fontSize: 17, fontWeight: '800', color: c.danger, marginTop: 4 },

    flowRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    flowCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 12 },
    flowInflow: { borderLeftWidth: 3, borderLeftColor: c.success },
    flowOutflow: { borderLeftWidth: 3, borderLeftColor: c.danger },
    flowIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    flowIconInflow: { fontSize: 20, fontWeight: '800', color: c.success, lineHeight: 36, textAlign: 'center' },
    flowIconOutflow: { fontSize: 20, fontWeight: '800', color: c.danger, lineHeight: 36, textAlign: 'center' },
    flowTextWrap: { flex: 1 },
    flowLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    flowValuePositive: { fontSize: 17, fontWeight: '800', color: c.success, marginTop: 4 },
    flowValueNegative: { fontSize: 17, fontWeight: '800', color: c.danger, marginTop: 4 },

    projectionCard: { backgroundColor: c.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.cardBorder, marginBottom: 20 },
    projectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    projectionLabel: { fontSize: 13, color: c.textSecondary, fontWeight: '600' },
    projectionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#E8F5E9' },
    projectionBadgeDanger: { backgroundColor: '#FEF3F2' },
    projectionBadgeText: { fontSize: 10, fontWeight: '800', color: '#12B76A', letterSpacing: 0.5 },
    projectionBadgeTextDanger: { color: '#F04438' },
    projectionValue: { fontSize: 26, fontWeight: '800', color: c.text },
    projectionValueDanger: { color: c.danger },
    projectionBar: { marginTop: 12 },
    projectionBarTrack: { height: 6, borderRadius: 3, backgroundColor: c.divider, overflow: 'hidden' },
    projectionBarFill: { height: '100%', borderRadius: 3 },
    projectionBarPositive: { backgroundColor: c.success },
    projectionBarNegative: { backgroundColor: c.danger },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 10, marginTop: 4 },
    deadlineRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    deadlineCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', gap: 6 },
    deadlineIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
    deadlineIconInflow: { fontSize: 22, fontWeight: '800', color: c.success },
    deadlineIconOutflow: { fontSize: 22, fontWeight: '800', color: c.danger },
    deadlineLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    deadlineCount: { fontSize: 28, fontWeight: '800', color: c.text },

    overdueRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    overdueCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 10 },
    overdueDot: { width: 10, height: 10, borderRadius: 5 },
    overdueDotWarn: { backgroundColor: c.warning },
    overdueDotDanger: { backgroundColor: c.danger },
    overdueTextWrap: { flex: 1 },
    overdueLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    overdueValueWarn: { fontSize: 22, fontWeight: '800', color: '#B54708', marginTop: 2 },
    overdueValueDanger: { fontSize: 22, fontWeight: '800', color: c.danger, marginTop: 2 },

    riskCard: { backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.cardBorder, marginBottom: 20 },
    riskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    riskRowBorder: { borderTopWidth: 1, borderTopColor: c.divider },
    riskRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    riskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.danger },
    riskDate: { fontSize: 14, color: c.text, fontWeight: '600' },
    riskAmount: { fontSize: 14, color: c.danger, fontWeight: '800' },

    ctaButton: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    ctaText: { color: c.primaryText, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 20 },
    modalSection: { marginBottom: 16 },
    modalLabel: { fontSize: 13, color: c.textSecondary, marginBottom: 8, fontWeight: '600' },
    modalInput: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: c.inputText, fontSize: 16 },
    partnerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    partnerChip: { borderWidth: 1, borderColor: c.chipBorder, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: c.chipBg },
    partnerChipActive: { borderColor: c.chipActiveBorder, backgroundColor: c.chipActiveBg },
    partnerChipText: { color: c.chipText, fontWeight: '600', fontSize: 13 },
    partnerChipTextActive: { color: c.chipActiveText },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.card },
    modalCancelText: { color: c.text, fontWeight: '700', fontSize: 15 },
    modalSave: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
    modalSaveRed: { backgroundColor: c.danger },
    modalSaveGreen: { backgroundColor: c.success },
    modalSaveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function parseTRDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function addDays(date: Date, dayCount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + dayCount);
  return result;
}

function sumByWindow(items: { amount: number; dueDate: string }[], from: Date, to: Date) {
  return items.reduce((total, item) => {
    const date = parseTRDate(item.dueDate);
    if (!date) return total;
    if (date >= from && date <= to) return total + item.amount;
    return total;
  }, 0);
}

function countByWindow(items: { dueDate: string }[], from: Date, to: Date) {
  return items.reduce((count, item) => {
    const date = parseTRDate(item.dueDate);
    if (!date) return count;
    if (date >= from && date <= to) return count + 1;
    return count;
  }, 0);
}

function countOverdue(items: { dueDate: string }[], today: Date) {
  return items.reduce((count, item) => {
    const date = parseTRDate(item.dueDate);
    if (!date) return count;
    if (date < today) return count + 1;
    return count;
  }, 0);
}

function buildRiskDays(
  openingBalance: number,
  receivables: { amount: number; dueDate: string }[],
  payables: { amount: number; dueDate: string }[],
  from: Date,
  dayCount: number
) {
  let rollingBalance = openingBalance;
  const result: { date: string; projectedBalance: number }[] = [];
  for (let i = 0; i <= dayCount; i += 1) {
    const currentDate = addDays(from, i);
    const dayInflow = sumByWindow(receivables, currentDate, currentDate);
    const dayOutflow = sumByWindow(payables, currentDate, currentDate);
    rollingBalance += dayInflow - dayOutflow;
    if (rollingBalance < 0) {
      result.push({
        date: currentDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        projectedBalance: rollingBalance,
      });
    }
  }
  return result.slice(0, 3);
}
