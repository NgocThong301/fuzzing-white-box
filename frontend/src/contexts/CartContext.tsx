import { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api';
import { useAuth } from './AuthContext';
import type { Cart } from '@/types';

interface CartContextType {
  cart: Cart | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!isAuthenticated) {
        return { items: [], subtotal: 0, itemCount: 0 } as Cart;
      }
      return cartApi.getCart();
    },
    enabled: true, // Always enabled, returns empty cart if not authenticated
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Clear cart cache when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.setQueryData(['cart', user?.id], { items: [], subtotal: 0, itemCount: 0 });
    }
  }, [user?.id, isAuthenticated, queryClient]);

  // Update cart in header
  const updateHeaderCart = useCallback(() => {
    const cartCount = cart?.itemCount || 0;
    const cartSubtotal = cart?.subtotal || 0;
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { count: cartCount, subtotal: cartSubtotal } 
    }));
  }, [cart]);

  useEffect(() => {
    updateHeaderCart();
  }, [updateHeaderCart]);

  return (
    <CartContext.Provider
      value={{
        cart: cart as Cart | undefined,
        isLoading,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
