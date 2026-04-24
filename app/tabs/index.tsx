import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useRouter } from 'expo-router';

const formatTRY = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardScreen() {
  const router = useRouter();
  const { openingBalance, receivables, payables } = useFinanceData();
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nakit Akis Dashboard</Text>
        <Text style={styles.subtitle}>Bugun finansal durumun</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
          <Text style={styles.balanceValue}>{formatTRY(openingBalance)}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>30g Beklenen Giris</Text>
            <Text style={styles.metricPositive}>{formatTRY(expectedInflow30)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>30g Beklenen Cikis</Text>
            <Text style={styles.metricNegative}>{formatTRY(expectedOutflow30)}</Text>
          </View>
        </View>

        <View style={styles.projectionCard}>
          <Text style={styles.metricLabel}>30g Kapanis Projeksiyonu</Text>
          <Text style={styles.projectionValue}>{formatTRY(projectedClosing30)}</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/tabs/explore?type=receivables&dueSoon=1')}>
            <Text style={styles.metricLabel}>7g Tahsilat</Text>
            <Text style={styles.metricCount}>{receivablesDue7d}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/tabs/explore?type=payables&dueSoon=1')}>
            <Text style={styles.metricLabel}>7g Odeme</Text>
            <Text style={styles.metricCount}>{payablesDue7d}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/tabs/explore?type=receivables&overdue=1')}>
            <Text style={styles.metricLabel}>Geciken Alacak</Text>
            <Text style={styles.metricWarning}>{overdueReceivables}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/tabs/explore?type=payables&overdue=1')}>
            <Text style={styles.metricLabel}>Geciken Odeme</Text>
            <Text style={styles.metricWarning}>{overduePayables}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>Riskli Gunler</Text>
          {riskDays.length === 0 ? (
            <Text style={styles.riskNone}>Riskli gun yok</Text>
          ) : (
            riskDays.map((day, index) => (
              <View key={index} style={styles.riskRow}>
                <Text style={styles.riskDate}>{day.date}</Text>
                <Text style={styles.riskAmount}>{formatTRY(day.projectedBalance)}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Detayli Nakit Takvimi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#667085', marginBottom: 16 },

  balanceCard: {
    backgroundColor: '#0F62FE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  balanceLabel: { color: '#D6E4FF', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 28, fontWeight: '700', marginTop: 6 },

  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  metricLabel: { fontSize: 13, color: '#667085' },
  metricPositive: { marginTop: 8, fontSize: 18, fontWeight: '700', color: '#12B76A' },
  metricNegative: { marginTop: 8, fontSize: 18, fontWeight: '700', color: '#F04438' },
  metricCount: { marginTop: 8, fontSize: 24, fontWeight: '700', color: '#101828' },
  metricWarning: { marginTop: 8, fontSize: 24, fontWeight: '700', color: '#B54708' },

  projectionCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  projectionValue: { marginTop: 8, fontSize: 22, fontWeight: '700', color: '#101828' },

  riskCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 16,
  },
  riskTitle: { fontSize: 16, fontWeight: '700', color: '#101828', marginBottom: 10 },
  riskNone: { color: '#667085' },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  riskDate: { color: '#344054' },
  riskAmount: { color: '#F04438', fontWeight: '700' },

  ctaButton: {
    backgroundColor: '#101828',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: 'white', fontWeight: '600', fontSize: 15 },
});

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
