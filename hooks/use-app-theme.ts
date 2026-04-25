import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFinanceData } from '@/hooks/use-finance-data';
import { StyleSheet } from 'react-native';

type ThemeColors = {
  bg: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  chipActiveBg: string;
  chipActiveBorder: string;
  chipActiveText: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  warning: string;
  divider: string;
  heroBg: string;
  heroText: string;
  heroSubtext: string;
  heroDecor: string;
  heroBtnBg: string;
  heroBtnBorder: string;
  heroBtnText: string;
  switchTrack: string;
};

const lightColors: ThemeColors = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  cardBorder: '#EAECF0',
  text: '#101828',
  textSecondary: '#667085',
  textTertiary: '#98A2B3',
  inputBg: '#FFFFFF',
  inputBorder: '#D0D5DD',
  inputText: '#101828',
  chipBg: '#FFFFFF',
  chipBorder: '#D0D5DD',
  chipText: '#344054',
  chipActiveBg: '#E8F0FF',
  chipActiveBorder: '#0F62FE',
  chipActiveText: '#0F62FE',
  primary: '#0C4A6E',
  primaryText: '#FFFFFF',
  danger: '#F04438',
  success: '#12B76A',
  warning: '#F59E0B',
  divider: '#F2F4F7',
  heroBg: '#0C4A6E',
  heroText: '#FFFFFF',
  heroSubtext: '#93C5FD',
  heroDecor: 'rgba(255,255,255,0.05)',
  heroBtnBg: 'rgba(255,255,255,0.15)',
  heroBtnBorder: 'rgba(255,255,255,0.25)',
  heroBtnText: '#93C5FD',
  switchTrack: '#F2F4F7',
};

const darkColors: ThemeColors = {
  bg: '#0F1117',
  card: '#1A1D27',
  cardBorder: '#2A2D3A',
  text: '#E8EAED',
  textSecondary: '#9AA0AC',
  textTertiary: '#6B7280',
  inputBg: '#1A1D27',
  inputBorder: '#2A2D3A',
  inputText: '#E8EAED',
  chipBg: '#1A1D27',
  chipBorder: '#2A2D3A',
  chipText: '#9AA0AC',
  chipActiveBg: '#1A2744',
  chipActiveBorder: '#3B82F6',
  chipActiveText: '#60A5FA',
  primary: '#1E3A5F',
  primaryText: '#E8EAED',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  divider: '#2A2D3A',
  heroBg: '#0D2847',
  heroText: '#FFFFFF',
  heroSubtext: '#7DD3FC',
  heroDecor: 'rgba(255,255,255,0.04)',
  heroBtnBg: 'rgba(255,255,255,0.1)',
  heroBtnBorder: 'rgba(255,255,255,0.15)',
  heroBtnText: '#7DD3FC',
  switchTrack: '#2A2D3A',
};

const CURRENCY_CONFIG: Record<string, { locale: string; symbol: string }> = {
  TRY: { locale: 'tr-TR', symbol: '₺' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
};

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const { settings } = useFinanceData();

  const isDark = (settings.theme === 'system' ? systemScheme : settings.theme) === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const formatCurrency = (value: number) => {
    const cfg = CURRENCY_CONFIG[settings.currency] || CURRENCY_CONFIG.TRY;
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currencySymbol = (CURRENCY_CONFIG[settings.currency] || CURRENCY_CONFIG.TRY).symbol;

  return { colors, isDark, formatCurrency, currencySymbol };
}
