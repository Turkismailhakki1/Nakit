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

function formatTRY(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildNotifications(
  receivables: { customerName: string; amount: number; dueDate: string }[],
  payables: { vendorName: string; amount: number; dueDate: string; category: string }[]
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
        description: `${r.customerName}: ${formatTRY(r.amount)} - ${diff * -1} gün gecikmiş`,
        time: 'Şimdi',
        severity: 'danger',
      });
    } else if (diff <= 3) {
      items.push({
        id: `r-soon-${i}`,
        title: 'Yaklaşan tahsilat',
        description: `${r.customerName}: ${formatTRY(r.amount)} - ${diff} gün kaldı`,
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
        description: `${p.vendorName} (${p.category}): ${formatTRY(p.amount)} - ${diff * -1} gün gecikmiş`,
        time: 'Şimdi',
        severity: 'danger',
      });
    } else if (diff <= 3) {
      items.push({
        id: `p-soon-${i}`,
        title: 'Yaklaşan ödeme',
        description: `${p.vendorName} (${p.category}): ${formatTRY(p.amount)} - ${diff} gün kaldı`,
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

export default function NotificationsScreen() {
  const { receivables, payables } = useFinanceData();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [riskAlertEnabled, setRiskAlertEnabled] = useState(true);

  const notifications = buildNotifications(receivables, payables);

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
          />
          <View style={styles.divider} />
          <RowWithSwitch
            label="E-posta Bildirim"
            description="Günlük özet ve kritik alarmlar"
            value={emailEnabled}
            onToggle={setEmailEnabled}
          />
          <View style={styles.divider} />
          <RowWithSwitch
            label="Kritik Risk Modu"
            description="Bakiye eksiye düşmeden önce uyarır"
            value={riskAlertEnabled}
            onToggle={setRiskAlertEnabled}
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
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) {
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 16, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: '700', color: '#101828' },
  subtitle: { marginTop: 4, marginBottom: 14, color: '#667085' },

  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
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
  switchLabel: { color: '#101828', fontWeight: '700', fontSize: 14 },
  switchDesc: { color: '#667085', marginTop: 2, fontSize: 12 },
  divider: { height: 1, backgroundColor: '#F2F4F7', marginVertical: 4 },

  testButton: {
    backgroundColor: '#0C4A6E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  sectionTitle: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { color: '#12B76A', fontWeight: '600', textAlign: 'center' },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
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
  itemTitle: { color: '#101828', fontSize: 15, fontWeight: '700' },
  itemDesc: { color: '#475467', marginTop: 4, lineHeight: 18 },
  itemTime: { color: '#98A2B3', marginTop: 6, fontSize: 12 },
});
