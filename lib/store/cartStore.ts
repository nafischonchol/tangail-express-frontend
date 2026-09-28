import { create } from 'zustand';
import { fetchCustomerCart, addToCartApi, updateCartQtyApi, removeCartItemApi, clearCartApi, CustomerCartItem } from '@/lib/api/cart';
import { showAddToCartToast } from '@/lib/utils/cartToast';
import { trackAddToCart } from '@/lib/utils/analytics';

export interface CartItem {
  id: string;
  product_id?: number;
  product_variant_id?: number | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
  brand?: string;
  sku?: string;
  slug_url?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

let inFlightFetchPromise: Promise<void> | null = null;

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    if (inFlightFetchPromise) {
      return inFlightFetchPromise;
    }

    inFlightFetchPromise = (async () => {
      set({ isLoading: true });
      try {
        const res = await fetchCustomerCart();
        if (res.success && Array.isArray(res.resources)) {
          set({
            items: res.resources.map((item: CustomerCartItem) => ({
              id: String(item.id),
              product_id: item.product_id,
              product_variant_id: item.product_variant_id,
              name: item.name,
              price: Number(item.price),
              image: item.image,
              quantity: item.quantity,
              brand: item.brand,
              sku: item.sku,
              slug_url: item.slug_url,
            })),
          });
        } else {
          set({ items: [] });
        }
      } catch {
        set({ items: [] });
      } finally {
        set({ isLoading: false });
        inFlightFetchPromise = null;
      }
    })();

    return inFlightFetchPromise;
  },

  addToCart: async (item) => {
    const productId = item.product_id || Number(item.id);
    const variantId = item.product_variant_id || null;
    const qty = item.quantity || 1;

    const res = await addToCartApi(productId, variantId, qty);
    if (res.success) {
      await get().fetchCart();
      showAddToCartToast(item.name);
      trackAddToCart({
        id: productId,
        name: item.name,
        price: Number(item.price || 0),
        quantity: qty,
        category: item.brand || '',
      });
      return { success: true, message: res.message };
    } else {
      import('react-hot-toast').then((mod) => {
        mod.toast.error(res.message || 'Failed to add item to cart', {
          style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' },
        });
      });
      return { success: false, message: res.message };
    }
  },

  removeFromCart: async (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== String(id)),
    }));

    const res = await removeCartItemApi(id);
    if (!res.success) {
      await get().fetchCart();
      import('react-hot-toast').then((mod) => {
        mod.toast.error(res.message || 'Failed to remove item', {
          style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' },
        });
      });
    }
  },

  updateQuantity: async (id, quantity) => {
    const targetQty = Math.max(1, quantity);
    set((state) => ({
      items: state.items.map((i) => (i.id === String(id) ? { ...i, quantity: targetQty } : i)),
    }));

    const res = await updateCartQtyApi(id, targetQty);
    if (!res.success) {
      await get().fetchCart();
      import('react-hot-toast').then((mod) => {
        mod.toast.error(res.message || 'Failed to update quantity', {
          style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' },
        });
      });
    }
  },

  clearCart: async () => {
    set({ items: [] });
    await clearCartApi();
  },

  getCartTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
  getCartCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
}));
