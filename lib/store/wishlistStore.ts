import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchWishlistApi, toggleWishlistApi, mergeWishlistApi, WishlistApiItem } from '@/lib/api/wishlist';
import { getVisitorId } from '@/lib/utils/visitorId';
import { showWishlistToast } from '@/lib/utils/cartToast';
import { trackAddToWishlist } from '@/lib/utils/analytics';

export interface WishlistItem {
  id: string;
  productId?: number;
  name: string;
  price: number;
  image: string;
  brand?: string;
  sku?: string;
  slug_url?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (item: WishlistItem) => Promise<void>;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
  fetchWishlist: () => Promise<void>;
  mergeWishlistOnLogin: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      fetchWishlist: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
        if (!token) return;

        set({ isLoading: true });
        try {
          const res = await fetchWishlistApi();
          if (res.success && Array.isArray(res.resources)) {
            const mappedItems: WishlistItem[] = res.resources.map((apiItem: WishlistApiItem) => ({
              id: String(apiItem.product_id),
              productId: apiItem.product_id,
              name: apiItem.product?.name || '',
              price: apiItem.product?.selling_price || 0,
              image: apiItem.product?.primary_image_url || '',
              slug_url: apiItem.product?.slug || '',
            }));
            set({ items: mappedItems });
          }
        } catch {
          // Fallback to local storage state
        } finally {
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (item) => {
        const rawId = item.productId || item.id;
        const numericId = typeof rawId === 'number' ? rawId : parseInt(String(rawId).split('-')[0], 10);
        const exists = get().isInWishlist(item.id) || (numericId ? get().isInWishlist(numericId) : false);

        // Optimistic UI update
        set((state) => {
          if (exists) {
            return { items: state.items.filter((i) => String(i.id) !== String(item.id) && String(i.id) !== String(numericId)) };
          }
          return { items: [...state.items, item] };
        });

        if (!exists) {
          trackAddToWishlist({
            id: numericId || item.id,
            name: item.name,
            price: Number(item.price || 0),
            category: item.brand || '',
          });
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;

        // If not logged in, maintain local storage only & show toast
        if (!token) {
          if (typeof window !== 'undefined') {
            showWishlistToast(
              exists ? 'Product removed from wishlist' : 'Product added to wishlist',
              !exists
            );
          }
          return;
        }

        // Backend Sync & Notification for logged-in users
        if (!isNaN(numericId) && numericId > 0) {
          try {
            const res = await toggleWishlistApi(numericId);
            const isAttached = res.resources?.attached ?? (res as any)?.attached;
            const message = res.message;

            if (res.success) {
              if (Boolean(isAttached)) {
                // Ensure item is in store
                set((state) => {
                  const alreadyIn = state.items.some((i) => String(i.id) === String(item.id) || String(i.id) === String(numericId));
                  if (!alreadyIn) {
                    return { items: [...state.items, item] };
                  }
                  return state;
                });
              } else {
                // Ensure item is removed from store
                set((state) => ({
                  items: state.items.filter((i) => String(i.id) !== String(item.id) && String(i.id) !== String(numericId)),
                }));
              }

              // Show Toast notification
              if (typeof window !== 'undefined') {
                showWishlistToast(message, Boolean(isAttached));
              }
            }
          } catch {
            // Revert state on network error
            set((state) => {
              if (exists) {
                return { items: [...state.items, item] };
              }
              return { items: state.items.filter((i) => String(i.id) !== String(item.id)) };
            });
          }
        }
      },

      removeFromWishlist: async (item) => {
        const rawId = item.productId || item.id;
        const numericId = typeof rawId === 'number' ? rawId : parseInt(String(rawId).split('-')[0], 10);

        set((state) => ({
          items: state.items.filter((i) => String(i.id) !== String(item.id) && String(i.id) !== String(numericId)),
        }));

        if (typeof window !== 'undefined') {
          showWishlistToast('Product removed from wishlist', false);
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
        if (token && !isNaN(numericId) && numericId > 0) {
          try {
            await toggleWishlistApi(numericId);
          } catch {
            // Revert or ignore error
          }
        }
      },

      mergeWishlistOnLogin: async () => {
        const guestToken = getVisitorId();
        if (!guestToken) {
          return;
        }

        try {
          const res = await mergeWishlistApi(guestToken);
          if (res.success && Array.isArray(res.resources)) {
            const mappedItems: WishlistItem[] = res.resources.map((apiItem) => ({
              id: String(apiItem.product_id),
              productId: apiItem.product_id,
              name: apiItem.product?.name || '',
              price: apiItem.product?.selling_price || 0,
              image: apiItem.product?.primary_image_url || '',
              slug_url: apiItem.product?.slug || '',
            }));
            set({ items: mappedItems });
          }
        } catch {
          // Handle error gracefully
        }
      },

      isInWishlist: (id) => get().items.some((i) => String(i.id) === String(id) || (i.productId && String(i.productId) === String(id))),
      clearWishlist: () => set({ items: [] }),
      getWishlistCount: () => get().items.length,
    }),
    {
      name: 'mohimaa-wishlist-storage',
    }
  )
);
