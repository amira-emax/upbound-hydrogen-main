import React, { createContext, useContext, useState } from 'react';

type CartLineContextType = {
  loadingLineIds: Set<string>;
  setLineLoading: (lineId: string, isLoading: boolean) => void;
};

const CartLineContext = createContext<CartLineContextType | undefined>(undefined);

export function CartLineProvider({ children }: { children: React.ReactNode }) {
  const [loadingLineIds, setLoadingLineIds] = useState<Set<string>>(new Set());

  const setLineLoading = (lineId: string, isLoading: boolean) => {
    setLoadingLineIds(prev => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(lineId);
      } else {
        newSet.delete(lineId);
      }
      return newSet;
    });
  };

  return (
    <CartLineContext.Provider value={{ loadingLineIds, setLineLoading }}>
      {children}
    </CartLineContext.Provider>
  );
}

export function useCartLine() {
  const context = useContext(CartLineContext);
  if (!context) {
    throw new Error('useCartLine must be used within a CartLineProvider');
  }
  return context;
}
