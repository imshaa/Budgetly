import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const currencies: Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(currencies[0]); // Default to PKR

  useEffect(() => {
    // Load currency from localStorage on mount
    const savedCurrencyCode = localStorage.getItem('selectedCurrency');
    if (savedCurrencyCode) {
      const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
      if (savedCurrency) {
        setSelectedCurrencyState(savedCurrency);
      }
    }
  }, []);

  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem('selectedCurrency', currency.code);
  };

  const formatCurrency = (amount: number): string => {
    return `${selectedCurrency.symbol}${amount.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      formatCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};