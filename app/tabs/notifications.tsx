import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFinanceData } from '@/hooks/use-finance-data';
import { useAppTheme } from '@/hooks/use-app-theme';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: 'info' | 'warning' | 'danger';
};

const severityColor = {
  info: '#1570EF',
  warning: '#B54708',
  danger: '#D92D20',
};

function buildNotifications(
  receivables: { customerName: string; amount: number; dueDate: string }[],
  payables: { vendorName: string; amount: number; dueDate: string; category: string }[],
  formatCurrency: (value: number) => string
): NotificationItem[] {
  const now = new Date();
  const items: NotificationItem[] = [];

  receivables.forEach((r, i) => {
    const date = parseTRDate(r.dueDate);
    if (!date) return;
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      items.push({
        id: `r-overdue-${i}`,
        title: 'Geciken tahsilat',
        description: `${r.customerName}: ${formatCurrency(r.amount)} - ${diff * -1} gün gecikmiş`,
        time: 'Şimdi',
        severity: 'danger',
      });
    } else if (diff <= 3) {
      items.push({
        id: `r-soon-${i}`,
        title: 'Yaklaşan tahsilat',
        description: `${r.customerName}: ${formatCurrency(r.amount)} - ${diff} gün kaldı`,
        time: diff === 0 ? 'Bugün' : `${diff} gün sonra`,
        severity: 'warning',
      });
    }
  });

  payables.forEach((p, i) => {
    const date = parseTRDate(p.dueDate);
    if (!date) return;
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      items.push({
        id: `p-overdue-${i}`,
        title: 'Geciken ödeme',
        description: `${p.vendorName} (${p.category}): ${formatCurrency(p.amount)} - ${diff * -1} gün gecikmiş`,
        time: 'Şimdi',
        severity: 'danger',
      });
    } else if (diff <= 3) {
      items.push({
        id: `p-soon-${i}`,
        title: 'Yaklaşan ödeme',
        description: `${p.vendorName} (${p.category}): ${formatCurrency(p.amount)} - ${diff} gün kaldı`,
        time: diff === 0 ? 'Bugün' : `${diff} gün sonra`,
        severity: 'warning',
      });
    }
  });

  return items.sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

function parseTRDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

function makeStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingBottom: 30 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text },
    subtitle: { marginTop: 4, marginBottom: 14, color: colors.textSecondary },

    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 12,
      marginBottom: 16,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 8,
    },
    switchTextGroup: { flex: 1 },
    switchLabel: { color: colors.text, fontWeight: '700', fontSize: 14 },
    switchDesc: { color: colors.textSecondary, marginTop: 2, fontSize: 12 },
    divider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },

    testButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      marginBottom: 16,
    },
    testButtonText: { color: colors.primaryText, fontWeight: '700', fontSize: 14 },

    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 10,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 20,
      alignItems: 'center',
    },
    emptyText: { color: colors.success, fontWeight: '600', textAlign: 'center' },
    itemCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 12,
      marginBottom: 10,
      flexDirection: 'row',
      gap: 10,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      marginTop: 7,
    },
    itemBody: { flex: 1 },
    itemTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    itemDesc: { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
    itemTime: { color: colors.textTertiary, marginTop: 6, fontSize: 12 },
  });
}

export default function NotificationsScreen() {
  const { colors, formatCurrency } = useAppTheme();
  const { receivables, payables } = useFinanceData();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [riskAlertEnabled, setRiskAlertEnabled] = useState(true);

  const styles = makeStyles(colors);
  const notifications = buildNotifications(receivables, payables, formatCurrency);

  useEffect(() => {
    if (pushEnabled) {
      requestNotificationPermission();
    }
  }, [pushEnabled]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bildirimler</Text>
        <Text style={styles.subtitle}>Yaklaşan ödeme, tahsilat ve risk alarmları</Text>

        <View style={styles.settingsCard}>
          <RowWithSwitch
            label="Push Bildirim"
            description="Mobil cihazınıza anlık bildirim gönderilir"
            value={pushEnabled}
            onToggle={setPushEnabled}
            colors={colors}
          />
          <View style={styles.divider} />
          <RowWithSwitch
            label="E-posta Bildirim"
            description="Günlük özet ve kritik alarmlar"
            value={emailEnabled}
            onToggle={setEmailEnabled}
            colors={colors}
          />
          <View style={styles.divider} />
          <RowWithSwitch
            label="Kritik Risk Modu"
            description="Bakiye eksiye düşmeden önce uyarır"
            value={riskAlertEnabled}
            onToggle={setRiskAlertEnabled}
            colors={colors}
          />
        </View>

        {pushEnabled && (
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Text style={styles.testButtonText}>Test Bildirimi Gönder</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Aktif Alarmlar ({notifications.length})</Text>
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Yaklaşan vade veya gecikme yok. Harika!</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.dot, { backgroundColor: severityColor[item.severity] }]} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

async function requestNotificationPermission() {
  try {
    const { default: expoNotifications } = require('expo-notifications');
    const { status } = await expoNotifications.getPermissionsAsync();
    if (status !== 'granted') {
      await expoNotifications.requestPermissionsAsync();
    }
  } catch {
    // expo-notifications may not be available on web
  }
}

async function sendTestNotification() {
  try {
    const { default: expoNotifications } = require('expo-notifications');
    await expoNotifications.scheduleNotificationAsync({
      content: {
        title: 'Nakit Akış Testi',
        body: 'Bildirimler başarıyla aktif!',
        sound: true,
      },
      trigger: null,
    });
  } catch {
    Alert.alert('Bildirim', 'Bildirim gönderilemedi. Cihazınız bildirimi desteklemiyor olabilir.');
  }
}

function RowWithSwitch({
  label,
  description,
  value,
  onToggle,
  colors,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchTextGroup}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDesc}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}
