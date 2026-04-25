import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useAppTheme } from '@/hooks/use-app-theme';

type CashflowDay = {
  date: string;
  inflow: number;
  outflow: number;
  closing: number;
};

type DayRange = 7 | 30 | 90;

const makeStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingBottom: 30 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    subtitle: { marginTop: 4, marginBottom: 14, color: colors.textSecondary },

    filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    filterChip: {
      borderWidth: 1,
      borderColor: colors.chipBorder,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.chipBg,
    },
    filterChipActive: {
      borderWidth: 1,
      borderColor: colors.chipActiveBorder,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.chipActiveBg,
    },
    filterChipText: { color: colors.chipText, fontWeight: '600' },
    filterChipTextActive: { color: colors.chipActiveText, fontWeight: '700' },

    summaryCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },
    summaryLabel: { color: colors.textSecondary, fontSize: 13 },
    summaryValue: { fontSize: 28, color: colors.danger, fontWeight: '800', marginTop: 2 },
    summaryHint: { color: colors.textSecondary, marginTop: 4 },

    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerCell: { flex: 1, color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
    row: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.card,
    },
    cell: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '600' },
    dateCell: { flex: 0.8 },
    inflow: { color: colors.success },
    outflow: { color: colors.danger },
    closing: { color: colors.text },
    negative: { color: colors.danger, fontWeight: '800' },
  });

export default function CashflowScreen() {
  const { openingBalance, receivables, payables } = useFinanceData();
  const { colors, formatCurrency } = useAppTheme();
  const styles = makeStyles(colors);
  const [dayRange, setDayRange] = useState<DayRange>(7);

  const data = buildCashflowRows(openingBalance, receivables, payables, dayRange);
  const riskCount = data.filter((day) => day.closing < 0).length;
  const firstRiskDay = data.find((day) => day.closing < 0);

  const ranges: { label: string; value: DayRange }[] = [
    { label: '7 Gün', value: 7 },
    { label: '30 Gün', value: 30 },
    { label: '90 Gün', value: 90 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nakit Akış Takvimi</Text>
        <Text style={styles.subtitle}>Günlük giriş, çıkış ve kapanış bakiyesi</Text>

        <View style={styles.filtersRow}>
          {ranges.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={dayRange === range.value ? styles.filterChipActive : styles.filterChip}
              onPress={() => setDayRange(range.value)}>
              <Text style={dayRange === range.value ? styles.filterChipTextActive : styles.filterChipText}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Riskli Gün Sayısı</Text>
          <Text style={styles.summaryValue}>{riskCount}</Text>
          <Text style={styles.summaryHint}>
            {firstRiskDay
              ? `${firstRiskDay.date} tarihinde beklenen bakiye eksiye düşüyor.`
              : `Önümüzdeki ${dayRange} günde bakiye eksiye düşmüyor.`}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.dateCell]}>Tarih</Text>
          <Text style={styles.headerCell}>Giriş</Text>
          <Text style={styles.headerCell}>Çıkış</Text>
          <Text style={styles.headerCell}>Kapanış</Text>
        </View>

        {data.map((day) => {
          const negative = day.closing < 0;
          return (
            <View key={day.date} style={styles.row}>
              <Text style={[styles.cell, styles.dateCell]}>{day.date}</Text>
              <Text style={[styles.cell, styles.inflow]}>{formatCurrency(day.inflow)}</Text>
              <Text style={[styles.cell, styles.outflow]}>{formatCurrency(day.outflow)}</Text>
              <Text style={[styles.cell, negative ? styles.negative : styles.closing]}>
                {formatCurrency(day.closing)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function parseTRDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, dayCount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + dayCount);
  return result;
}

function buildCashflowRows(
  openingBalance: number,
  receivables: { amount: number; dueDate: string }[],
  payables: { amount: number; dueDate: string }[],
  dayCount: number
) {
  const rows: CashflowDay[] = [];
  const today = new Date();
  let rolling = openingBalance;

  for (let i = 0; i < dayCount; i += 1) {
    const dayDate = addDays(today, i);
    const inflow = receivables.reduce((sum, item) => {
      const date = parseTRDate(item.dueDate);
      if (!date) return sum;
      return isSameDay(dayDate, date) ? sum + item.amount : sum;
    }, 0);
    const outflow = payables.reduce((sum, item) => {
      const date = parseTRDate(item.dueDate);
      if (!date) return sum;
      return isSameDay(dayDate, date) ? sum + item.amount : sum;
    }, 0);

    rolling += inflow - outflow;
    rows.push({
      date: dayDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
      inflow,
      outflow,
      closing: rolling,
    });
  }

  return rows;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
