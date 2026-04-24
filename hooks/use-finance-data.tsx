import React, { createContext, useContext, useMemo, useState } from 'react';

export type Receivable = {
  id: string;
  customerName: string;
  documentType: 'Çek' | 'Senet' | 'Fatura';
  documentNo: string;
  amount: number;
  dueDate: string; // DD/MM/YYYY
  accountName: string;
  note?: string;
};

export type Payable = {
  id: string;
  category: string;
  vendorName: string;
  amount: number;
  dueDate: string; // DD/MM/YYYY
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  accountName: string;
  note?: string;
  recurring?: 'Yok' | 'Haftalık' | 'Aylık';
};

export type Partner = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export type Withdrawal = {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  date: string; // DD/MM/YYYY
  description: string;
};

type FinanceContextValue = {
  openingBalance: number;
  receivables: Receivable[];
  payables: Payable[];
  partners: Partner[];
  withdrawals: Withdrawal[];
  addReceivable: (input: Omit<Receivable, 'id'>) => void;
  addPayable: (input: Omit<Payable, 'id'>) => void;
  removeReceivable: (id: string) => void;
  removePayable: (id: string) => void;
  addPartner: (input: Omit<Partner, 'id'>) => void;
  removePartner: (id: string) => void;
  addWithdrawal: (input: Omit<Withdrawal, 'id'>) => void;
  removeWithdrawal: (id: string) => void;
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
  {
    id: 'pt-1',
    name: 'Ahmet Yılmaz',
    role: 'Ortak',
    phone: '0532 555 1234',
  },
  {
    id: 'pt-2',
    name: 'Elif Kaya',
    role: 'Ortak',
    phone: '0544 333 5678',
  },
];

const initialWithdrawals: Withdrawal[] = [
  {
    id: 'w-1',
    partnerId: 'pt-1',
    partnerName: 'Ahmet Yılmaz',
    amount: 50000,
    date: '10/05/2026',
    description: 'Kişisel ihtiyaç çekimi',
  },
];

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const openingBalance = 980000;

  const value = useMemo<FinanceContextValue>(
    () => ({
      openingBalance,
      receivables,
      payables,
      partners,
      withdrawals,
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
        setWithdrawals((prev) => prev.filter((item) => item.partnerId !== id));
      },
      addWithdrawal: (input) => {
        setWithdrawals((prev) => [{ id: `w-${Date.now()}`, ...input }, ...prev]);
      },
      removeWithdrawal: (id) => {
        setWithdrawals((prev) => prev.filter((item) => item.id !== id));
      },
    }),
    [receivables, payables, partners, withdrawals]
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
