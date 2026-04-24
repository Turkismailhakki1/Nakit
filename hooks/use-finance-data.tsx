import React, { createContext, useContext, useMemo, useState } from 'react';

export type Receivable = {
  id: string;
  customerName: string;
  documentType: 'Cek' | 'Senet' | 'Fatura';
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
  priority: 'Dusuk' | 'Orta' | 'Yuksek' | 'Kritik';
  accountName: string;
  note?: string;
};

type FinanceContextValue = {
  openingBalance: number;
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
    customerName: 'ABC Otomotiv A.S.',
    documentType: 'Cek',
    documentNo: 'CK-2026-00421',
    amount: 450000,
    dueDate: '15/07/2026',
    accountName: 'Garanti TL',
    note: 'Nisan sevkiyat tahsilati',
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
    category: 'Tedarikci',
    vendorName: 'XYZ Sac Sanayi',
    amount: 220000,
    dueDate: '03/06/2026',
    priority: 'Yuksek',
    accountName: 'Garanti TL',
    note: 'Hammadde odemesi',
  },
  {
    id: 'p-2',
    category: 'Maas',
    vendorName: 'Personel Maaslari',
    amount: 350000,
    dueDate: '01/06/2026',
    priority: 'Kritik',
    accountName: 'Garanti TL',
  },
];

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const openingBalance = 980000;

  const value = useMemo<FinanceContextValue>(
    () => ({
      openingBalance,
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
    [receivables, payables]
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

