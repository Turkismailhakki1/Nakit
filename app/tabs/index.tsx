import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useRouter } from 'expo-router';

const formatTRY = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

export default function DashboardScreen() {
  const router = useRouter();
  const { openingBalance, setOpeningBalance, receivables, payables } = useFinanceData();
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>Nakit Akış</Text>
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push('/tabs/notifications')}>
            <View style={styles.bellIcon}>
              <Text style={styles.bellIconText}>!</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceHero}>
          <View style={styles.balanceHeroInner}>
            <Text style={styles.balanceLabel}>Toplam Bakiye</Text>
            <Text style={styles.balanceValue}>{formatTRY(openingBalance)}</Text>
            <View style={styles.balanceTrendRow}>
              <View style={[styles.trendBadge, netFlow30 >= 0 ? styles.trendPositive : styles.trendNegative]}>
                <Text style={styles.trendIcon}>{netFlow30 >= 0 ? '\u2191' : '\u2193'}</Text>
                <Text style={[styles.trendText, netFlow30 >= 0 ? styles.trendTextPositive : styles.trendTextNegative]}>
                  {netFlow30 >= 0 ? '+' : ''}{formatCompact(netFlow30)} TL 30g
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.balanceDecorCircle1} />
          <View style={styles.balanceDecorCircle2} />
          <TouchableOpacity style={styles.editBalanceButton} onPress={handleEditBalance}>
            <Text style={styles.editBalanceText}>Bakiyeyi Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.flowRow}>
          <View style={[styles.flowCard, styles.flowInflow]}>
            <View style={styles.flowIconWrap}>
              <Text style={styles.flowIconInflow}>+</Text>
            </View>
            <View style={styles.flowTextWrap}>
              <Text style={styles.flowLabel}>30g Beklenen Giriş</Text>
              <Text style={styles.flowValuePositive}>{formatTRY(expectedInflow30)}</Text>
            </View>
          </View>
          <View style={[styles.flowCard, styles.flowOutflow]}>
            <View style={styles.flowIconWrap}>
              <Text style={styles.flowIconOutflow}>-</Text>
            </View>
            <View style={styles.flowTextWrap}>
              <Text style={styles.flowLabel}>30g Beklenen Çıkış</Text>
              <Text style={styles.flowValueNegative}>{formatTRY(expectedOutflow30)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <Text style={styles.projectionLabel}>30g Kapanış Projeksiyonu</Text>
            <View style={[styles.projectionBadge, projectedClosing30 < 0 && styles.projectionBadgeDanger]}>
              <Text style={[styles.projectionBadgeText, projectedClosing30 < 0 && styles.projectionBadgeTextDanger]}>
                {projectedClosing30 < 0 ? 'RİSK' : 'STABİL'}
              </Text>
            </View>
          </View>
          <Text style={[styles.projectionValue, projectedClosing30 < 0 && styles.projectionValueDanger]}>
            {formatTRY(projectedClosing30)}
          </Text>
          <View style={styles.projectionBar}>
            <View style={styles.projectionBarTrack}>
              <View
                style={[
                  styles.projectionBarFill,
                  projectedClosing30 >= 0 ? styles.projectionBarPositive : styles.projectionBarNegative,
                  { width: `${Math.min(Math.max((Math.abs(projectedClosing30) / (openingBalance || 1)) * 100, 5), 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Yaklaşan Vadeler</Text>
        <View style={styles.deadlineRow}>
          <TouchableOpacity
            style={styles.deadlineCard}
            onPress={() => router.push('/tabs/explore?type=receivables&dueSoon=1')}
            activeOpacity={0.7}>
            <View style={styles.deadlineIconWrap}>
              <Text style={styles.deadlineIconInflow}>+</Text>
            </View>
            <Text style={styles.deadlineLabel}>7g Tahsilat</Text>
            <Text style={styles.deadlineCount}>{receivablesDue7d}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deadlineCard}
            onPress={() => router.push('/tabs/explore?type=payables&dueSoon=1')}
            activeOpacity={0.7}>
            <View style={styles.deadlineIconWrap}>
              <Text style={styles.deadlineIconOutflow}>-</Text>
            </View>
            <Text style={styles.deadlineLabel}>7g Ödeme</Text>
            <Text style={styles.deadlineCount}>{payablesDue7d}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Geciken Kayıtlar</Text>
        <View style={styles.overdueRow}>
          <TouchableOpacity
            style={styles.overdueCard}
            onPress={() => router.push('/tabs/explore?type=receivables&overdue=1')}
            activeOpacity={0.7}>
            <View style={[styles.overdueDot, styles.overdueDotWarn]} />
            <View style={styles.overdueTextWrap}>
              <Text style={styles.overdueLabel}>Geciken Alacak</Text>
              <Text style={styles.overdueValueWarn}>{overdueReceivables}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.overdueCard}
            onPress={() => router.push('/tabs/explore?type=payables&overdue=1')}
            activeOpacity={0.7}>
            <View style={[styles.overdueDot, styles.overdueDotDanger]} />
            <View style={styles.overdueTextWrap}>
              <Text style={styles.overdueLabel}>Geciken Ödeme</Text>
              <Text style={styles.overdueValueDanger}>{overduePayables}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {riskDays.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Riskli Günler</Text>
            <View style={styles.riskCard}>
              {riskDays.map((day, index) => (
                <View
                  key={index}
                  style={[styles.riskRow, index > 0 && styles.riskRowBorder]}>
                  <View style={styles.riskRowLeft}>
                    <View style={styles.riskDot} />
                    <Text style={styles.riskDate}>{day.date}</Text>
                  </View>
                  <Text style={styles.riskAmount}>{formatTRY(day.projectedBalance)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/tabs/cashflow')}
          activeOpacity={0.8}>
          <Text style={styles.ctaText}>Detaylı Nakit Takvimi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 20, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#667085', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#101828', marginTop: 2 },
  headerAction: { padding: 8 },
  bellIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIconText: { fontSize: 16, fontWeight: '800', color: '#667085' },

  balanceHero: {
    backgroundColor: '#0C4A6E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceHeroInner: { position: 'relative', zIndex: 1 },
  balanceLabel: { color: '#93C5FD', fontSize: 14, fontWeight: '500', letterSpacing: 0.5 },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  balanceTrendRow: { flexDirection: 'row', marginTop: 12 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  trendPositive: { backgroundColor: 'rgba(18, 183, 106, 0.2)' },
  trendNegative: { backgroundColor: 'rgba(240, 68, 56, 0.2)' },
  trendIcon: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  trendText: { fontSize: 12, fontWeight: '700' },
  trendTextPositive: { color: '#12B76A' },
  trendTextNegative: { color: '#F04438' },
  balanceDecorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  balanceDecorCircle2: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  editBalanceButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  editBalanceText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },

  flowRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  flowCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flowInflow: { borderLeftWidth: 3, borderLeftColor: '#12B76A' },
  flowOutflow: { borderLeftWidth: 3, borderLeftColor: '#F04438' },
  flowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowIconInflow: { fontSize: 20, fontWeight: '800', color: '#12B76A', lineHeight: 36, textAlign: 'center' },
  flowIconOutflow: { fontSize: 20, fontWeight: '800', color: '#F04438', lineHeight: 36, textAlign: 'center' },
  flowTextWrap: { flex: 1 },
  flowLabel: { fontSize: 12, color: '#667085', fontWeight: '500' },
  flowValuePositive: { fontSize: 17, fontWeight: '800', color: '#12B76A', marginTop: 4 },
  flowValueNegative: { fontSize: 17, fontWeight: '800', color: '#F04438', marginTop: 4 },

  projectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 20,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectionLabel: { fontSize: 13, color: '#667085', fontWeight: '600' },
  projectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
  },
  projectionBadgeDanger: { backgroundColor: '#FEF3F2' },
  projectionBadgeText: { fontSize: 10, fontWeight: '800', color: '#12B76A', letterSpacing: 0.5 },
  projectionBadgeTextDanger: { color: '#F04438' },
  projectionValue: { fontSize: 26, fontWeight: '800', color: '#101828' },
  projectionValueDanger: { color: '#F04438' },
  projectionBar: { marginTop: 12 },
  projectionBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F2F4F7',
    overflow: 'hidden',
  },
  projectionBarFill: { height: '100%', borderRadius: 3 },
  projectionBarPositive: { backgroundColor: '#12B76A' },
  projectionBarNegative: { backgroundColor: '#F04438' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 10,
    marginTop: 4,
  },

  deadlineRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  deadlineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    alignItems: 'center',
    gap: 6,
  },
  deadlineIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineIconInflow: { fontSize: 22, fontWeight: '800', color: '#12B76A' },
  deadlineIconOutflow: { fontSize: 22, fontWeight: '800', color: '#F04438' },
  deadlineLabel: { fontSize: 12, color: '#667085', fontWeight: '500' },
  deadlineCount: { fontSize: 28, fontWeight: '800', color: '#101828' },

  overdueRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  overdueCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overdueDot: { width: 10, height: 10, borderRadius: 5 },
  overdueDotWarn: { backgroundColor: '#F59E0B' },
  overdueDotDanger: { backgroundColor: '#F04438' },
  overdueTextWrap: { flex: 1 },
  overdueLabel: { fontSize: 12, color: '#667085', fontWeight: '500' },
  overdueValueWarn: { fontSize: 22, fontWeight: '800', color: '#B54708', marginTop: 2 },
  overdueValueDanger: { fontSize: 22, fontWeight: '800', color: '#F04438', marginTop: 2 },

  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 20,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  riskRowBorder: { borderTopWidth: 1, borderTopColor: '#F2F4F7' },
  riskRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F04438' },
  riskDate: { fontSize: 14, color: '#344054', fontWeight: '600' },
  riskAmount: { fontSize: 14, color: '#F04438', fontWeight: '800' },

  ctaButton: {
    backgroundColor: '#0C4A6E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
});

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
