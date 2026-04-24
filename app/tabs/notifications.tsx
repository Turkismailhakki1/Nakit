import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: 'info' | 'warning' | 'danger';
};

const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Yarin odeme var',
    description: 'XYZ Sac Sanayi odemesi: 220.000 TL',
    time: 'Bugun 09:15',
    severity: 'warning',
  },
  {
    id: '2',
    title: 'Tahsilat yaklasti',
    description: 'ABC Otomotiv cek tahsilati: 450.000 TL',
    time: 'Bugun 08:40',
    severity: 'info',
  },
  {
    id: '3',
    title: 'Nakit acigi riski',
    description: '03 Haz tarihinde beklenen bakiye -55.000 TL',
    time: 'Dun 18:22',
    severity: 'danger',
  },
];

const severityColor = {
  info: '#1570EF',
  warning: '#B54708',
  danger: '#D92D20',
};

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bildirimler</Text>
        <Text style={styles.subtitle}>Yaklasan odeme, tahsilat ve risk alarmlari</Text>

        <View style={styles.settingsCard}>
          <RowWithSwitch label="Push Bildirim" description="Mobil cihazina anlik bildirim gonder" defaultValue />
          <View style={styles.divider} />
          <RowWithSwitch label="E-posta Bildirim" description="Gunluk ozet ve kritik alarmlar" defaultValue />
          <View style={styles.divider} />
          <RowWithSwitch label="Kritik Risk Modu" description="Bakiye eksiye dusmeden once uyar" defaultValue />
        </View>

        <Text style={styles.sectionTitle}>Son Bildirimler</Text>
        {notifications.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={[styles.dot, { backgroundColor: severityColor[item.severity] }]} />
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function RowWithSwitch({
  label,
  description,
  defaultValue,
}: {
  label: string;
  description: string;
  defaultValue: boolean;
}) {
  const [enabled, setEnabled] = React.useState(defaultValue);

  return (
    <View style={styles.switchRow}>
      <View style={styles.switchTextGroup}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDesc}>{description}</Text>
      </View>
      <Switch value={enabled} onValueChange={setEnabled} />
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

  sectionTitle: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
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
