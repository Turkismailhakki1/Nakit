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

type FinanceContextValue = {
  openingBalance: number;
  setOpeningBalance: (amount: number) => void;
  receivables: Receivable[];
  payables: Payable[];
  addReceivable: (input: Omit<Receivable, 'id'>) => void;
  addPayable: (input: Omit<Payable, 'id'>) => void;
  removeReceivable: (id: string) => void;
  removePayable: (id: string) => void;
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

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const [openingBalance, setOpeningBalance] = useState(980000);
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [payables, setPayables] = useState<Payable[]>(initialPayables);

  const value = useMemo<FinanceContextValue>(
    () => ({
      openingBalance,
      setOpeningBalance,
      receivables,
      payables,
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
    }),
    [openingBalance, receivables, payables]
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
