import React, { createContext, useContext, useMemo, useState } from 'react';

export type Receivable = {
  id: string;
  customerName: string;
  documentType: 'Çek' | 'Senet' | 'Fatura';
  documentNo: string;
  amount: number;
  dueDate: string;
  accountName: string;
  note?: string;
};

export type Payable = {
  id: string;
  category: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  accountName: string;
  note?: string;
  recurring?: 'Yok' | 'Haftalık' | 'Aylık';
};

export type Partner = {
  id: string;
  name: string;
  phone: string;
};

export type CashLog = {
  id: string;
  type: 'withdrawal' | 'deposit';
  amount: number;
  date: string;
  description: string;
  partnerId?: string;
  partnerName?: string;
};

export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  notificationDaysBefore: number;
};

type FinanceContextValue = {
  openingBalance: number;
  setOpeningBalance: (amount: number) => void;
  receivables: Receivable[];
  payables: Payable[];
  partners: Partner[];
  cashLogs: CashLog[];
  settings: AppSettings;
  addReceivable: (input: Omit<Receivable, 'id'>) => void;
  addPayable: (input: Omit<Payable, 'id'>) => void;
  removeReceivable: (id: string) => void;
  removePayable: (id: string) => void;
  addPartner: (input: Omit<Partner, 'id'>) => void;
  removePartner: (id: string) => void;
  addCashLog: (input: Omit<CashLog, 'id'>) => void;
  removeCashLog: (id: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
};

const FinanceDataContext = createContext<FinanceContextValue | null>(null);

const initialReceivables: Receivable[] = [
  {
    id: 'r-1',
    customerName: 'ABC Otomotiv A.Ş.',
    documentType: 'Çek',
    documentNo: 'ÇK-2026-00421',
    amount: 450000,
    dueDate: '15/07/2026',
    accountName: 'Garanti TL',
    note: 'Nisan sevkiyat tahsilatı',
  },
  {
    id: 'r-2',
    customerName: 'Delta Makina',
    documentType: 'Fatura',
    documentNo: 'FAT-2026-091',
    amount: 120000,
    dueDate: '02/06/2026',
    accountName: 'Merkez Kasa',
  },
];

const initialPayables: Payable[] = [
  {
    id: 'p-1',
    category: 'Tedarikçi',
    vendorName: 'XYZ Saç Sanayi',
    amount: 220000,
    dueDate: '03/06/2026',
    priority: 'Yüksek',
    accountName: 'Garanti TL',
    note: 'Hammadde ödemesi',
  },
  {
    id: 'p-2',
    category: 'Maaş',
    vendorName: 'Personel Maaşları',
    amount: 350000,
    dueDate: '01/06/2026',
    priority: 'Kritik',
    accountName: 'Garanti TL',
    recurring: 'Aylık',
  },
];

const initialPartners: Partner[] = [
  { id: 'pt-1', name: 'Ahmet Yılmaz', phone: '0532 555 1234' },
  { id: 'pt-2', name: 'Elif Kaya', phone: '0544 333 5678' },
];

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const [openingBalance, setOpeningBalance] = useState(980000);
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [cashLogs, setCashLogs] = useState<CashLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    currency: 'TRY',
    notificationDaysBefore: 3,
  });

  const value = useMemo<FinanceContextValue>(
    () => ({
      openingBalance,
      setOpeningBalance,
      receivables,
      payables,
      partners,
      cashLogs,
      settings,
      addReceivable: (input) => {
        setReceivables((prev) => [{ id: `r-${Date.now()}`, ...input }, ...prev]);
      },
      addPayable: (input) => {
        setPayables((prev) => [{ id: `p-${Date.now()}`, ...input }, ...prev]);
      },
      removeReceivable: (id) => {
        setReceivables((prev) => prev.filter((item) => item.id !== id));
      },
      removePayable: (id) => {
        setPayables((prev) => prev.filter((item) => item.id !== id));
      },
      addPartner: (input) => {
        setPartners((prev) => [...prev, { id: `pt-${Date.now()}`, ...input }]);
      },
      removePartner: (id) => {
        setPartners((prev) => prev.filter((item) => item.id !== id));
      },
      addCashLog: (input) => {
        setCashLogs((prev) => [{ id: `cl-${Date.now()}`, ...input }, ...prev]);
        if (input.type === 'withdrawal') {
          setOpeningBalance((prev) => prev - input.amount);
        } else {
          setOpeningBalance((prev) => prev + input.amount);
        }
      },
      removeCashLog: (id) => {
        setCashLogs((prev) => {
          const entry = prev.find((e) => e.id === id);
          if (entry) {
            if (entry.type === 'withdrawal') {
              setOpeningBalance((p) => p + entry.amount);
            } else {
              setOpeningBalance((p) => p - entry.amount);
            }
          }
          return prev.filter((item) => item.id !== id);
        });
      },
      updateSettings: (partial) => {
        setSettings((prev) => ({ ...prev, ...partial }));
      },
    }),
    [openingBalance, receivables, payables, partners, cashLogs, settings]
  );

  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}

export function useFinanceData() {
  const value = useContext(FinanceDataContext);
  if (!value) {
    throw new Error('useFinanceData must be used within FinanceDataProvider');
  }
  return value;
}
