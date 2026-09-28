/**
 * Standard E-commerce Event Tracker for Meta Pixel, GA4, TikTok Pixel, and Server CAPI.
 * Follows official Meta Pixel Standard Events and Conversions API deduplication specifications.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    ttq?: {
      track: (eventName: string, params?: Record<string, any>, options?: Record<string, any>) => void;
      page: () => void;
      identify: (params: Record<string, any>) => void;
      instances?: any;
    };
  }
}

export interface AnalyticsProduct {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
  brand?: string;
}

export interface PurchaseData {
  orderId: string;
  value: number;
  currency?: string;
  items?: AnalyticsProduct[];
  numItems?: number;
  eventId?: string;
}

/**
 * Utility to retrieve cookie value by name.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

export function getFbpCookie(): string | null {
  return getCookie("_fbp");
}

export function getFbcCookie(): string | null {
  return getCookie("_fbc");
}

/**
 * Generate a unique event ID for Meta Pixel + CAPI Deduplication and TikTok tracking.
 */
export function generateEventId(prefix: string = "evt"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Identify user for Meta Pixel and TikTok Pixel advanced matching.
 */
export function identifyAnalyticsUser(user: { email?: string; phone?: string; externalId?: string; name?: string }) {
  if (typeof window === "undefined") return;

  // TikTok identify
  if (window.ttq && typeof window.ttq.identify === "function") {
    try {
      const ttqData: Record<string, any> = {};
      if (user.email) ttqData.email = user.email.trim().toLowerCase();
      if (user.phone) ttqData.phone_number = user.phone.trim();
      if (user.externalId) ttqData.external_id = String(user.externalId);
      window.ttq.identify(ttqData);
    } catch (err) {
      console.warn("[TikTok] identify error:", err);
    }
  }

  // Meta Pixel user properties
  if (typeof window.fbq === "function") {
    try {
      const fbData: Record<string, any> = {};
      if (user.email) fbData.em = user.email.trim().toLowerCase();
      if (user.phone) fbData.ph = user.phone.trim();
      if (user.externalId) fbData.external_id = String(user.externalId);
      if (user.name) fbData.fn = user.name.trim();
      window.fbq("setUserProperties", fbData);
    } catch (err) {
      console.warn("[Meta Pixel] setUserProperties error:", err);
    }
  }
}

/**
 * Fire-and-forget hybrid server-side event dispatcher.
 */
export async function sendServerCapiEvent(payload: {
  event_name: string;
  event_id?: string;
  user_data?: Record<string, any>;
  custom_data?: Record<string, any>;
  event_source_url?: string;
}) {
  if (typeof window === "undefined") return;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const bodyPayload = {
      ...payload,
      event_source_url: payload.event_source_url || window.location.href,
      user_data: {
        ...payload.user_data,
        fbp: getFbpCookie(),
        fbc: getFbcCookie(),
      },
    };

    fetch(`${baseUrl}/customer/analytics/track-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(bodyPayload),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    // Non-blocking catch
  }
}

/**
 * Track PageView
 */
export function trackPageView(url?: string, eventId?: string) {
  if (typeof window === "undefined") return;

  const currentUrl = url || window.location.href;
  const eid = eventId || generateEventId("pv");

  // 1. Meta Pixel
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", "PageView", {}, { eventID: eid });
    } catch (err) {
      console.warn("[Meta Pixel] PageView error:", err);
    }
  }

  // 2. Google Analytics 4
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "page_view", {
        page_location: currentUrl,
      });
    } catch (err) {
      console.warn("[GA4] page_view error:", err);
    }
  }

  // 3. TikTok Pixel
  if (window.ttq) {
    try {
      if (typeof window.ttq.page === "function") {
        window.ttq.page();
      } else if (typeof window.ttq.track === "function") {
        window.ttq.track("PageView");
      }
    } catch (err) {
      console.warn("[TikTok] PageView error:", err);
    }
  }
}

/**
 * Track ViewContent (Product details view)
 */
export function trackViewContent(product: AnalyticsProduct, customEventId?: string) {
  if (typeof window === "undefined") return;

  const price = Number(product.price) || 0;
  const productId = String(product.id);
  const eventId = customEventId || generateEventId(`vc_${productId}`);

  // 1. Meta (Facebook) Pixel (with Deduplication eventID)
  if (typeof window.fbq === "function") {
    try {
      window.fbq(
        "track",
        "ViewContent",
        {
          content_name: product.name,
          content_category: product.category || "",
          content_ids: [productId],
          content_type: "product",
          value: price,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.warn("[Meta Pixel] ViewContent error:", err);
    }
  }

  // 2. Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "view_item", {
        currency: "BDT",
        value: price,
        items: [
          {
            item_id: productId,
            item_name: product.name,
            item_category: product.category || "",
            price: price,
            quantity: product.quantity || 1,
          },
        ],
      });
    } catch (err) {
      console.warn("[GA4] view_item error:", err);
    }
  }

  // 3. TikTok Pixel (ttq)
  if (window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track(
        "ViewContent",
        {
          contents: [
            {
              content_id: productId,
              content_type: "product",
              content_name: product.name,
              content_category: product.category || "",
              price: price,
              quantity: product.quantity || 1,
            },
          ],
          content_id: productId,
          content_type: "product",
          content_name: product.name,
          content_category: product.category || "",
          value: price,
          currency: "BDT",
        },
        { event_id: eventId }
      );
    } catch (err) {
      console.warn("[TikTok] ViewContent error:", err);
    }
  }

  // 4. Fire server CAPI asynchronously
  sendServerCapiEvent({
    event_name: "ViewContent",
    event_id: eventId,
    custom_data: {
      content_name: product.name,
      content_category: product.category || "",
      content_ids: [productId],
      content_type: "product",
      value: price,
      currency: "BDT",
    },
  });
}

/**
 * Track AddToCart (Product added to shopping cart)
 */
export function trackAddToCart(product: AnalyticsProduct, customEventId?: string) {
  if (typeof window === "undefined") return;

  const price = Number(product.price) || 0;
  const quantity = Number(product.quantity) || 1;
  const totalValue = price * quantity;
  const productId = String(product.id);
  const eventId = customEventId || generateEventId(`atc_${productId}`);

  // 1. Meta (Facebook) Pixel
  if (typeof window.fbq === "function") {
    try {
      window.fbq(
        "track",
        "AddToCart",
        {
          content_name: product.name,
          content_category: product.category || "",
          content_ids: [productId],
          content_type: "product",
          value: totalValue,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.warn("[Meta Pixel] AddToCart error:", err);
    }
  }

  // 2. Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "add_to_cart", {
        currency: "BDT",
        value: totalValue,
        items: [
          {
            item_id: productId,
            item_name: product.name,
            item_category: product.category || "",
            price: price,
            quantity: quantity,
          },
        ],
      });
    } catch (err) {
      console.warn("[GA4] add_to_cart error:", err);
    }
  }

  // 3. TikTok Pixel (ttq)
  if (window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track(
        "AddToCart",
        {
          contents: [
            {
              content_id: productId,
              content_type: "product",
              content_name: product.name,
              content_category: product.category || "",
              price: price,
              quantity: quantity,
            },
          ],
          content_id: productId,
          content_type: "product",
          content_name: product.name,
          value: totalValue,
          currency: "BDT",
          quantity: quantity,
        },
        { event_id: eventId }
      );
    } catch (err) {
      console.warn("[TikTok] AddToCart error:", err);
    }
  }

  // 4. Fire server CAPI asynchronously
  sendServerCapiEvent({
    event_name: "AddToCart",
    event_id: eventId,
    custom_data: {
      content_name: product.name,
      content_category: product.category || "",
      content_ids: [productId],
      content_type: "product",
      value: totalValue,
      currency: "BDT",
      contents: [
        {
          id: productId,
          quantity: quantity,
          item_price: price,
        },
      ],
    },
  });
}

/**
 * Track AddToWishlist
 */
export function trackAddToWishlist(product: AnalyticsProduct, customEventId?: string) {
  if (typeof window === "undefined") return;

  const price = Number(product.price) || 0;
  const productId = String(product.id);
  const eventId = customEventId || generateEventId(`atw_${productId}`);

  // 1. Meta (Facebook) Pixel
  if (typeof window.fbq === "function") {
    try {
      window.fbq(
        "track",
        "AddToWishlist",
        {
          content_name: product.name,
          content_category: product.category || "",
          content_ids: [productId],
          content_type: "product",
          value: price,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.warn("[Meta Pixel] AddToWishlist error:", err);
    }
  }

  // 2. TikTok Pixel (ttq)
  if (window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track(
        "AddToWishlist",
        {
          contents: [
            {
              content_id: productId,
              content_type: "product",
              content_name: product.name,
              content_category: product.category || "",
              price: price,
              quantity: 1,
            },
          ],
          content_id: productId,
          content_type: "product",
          content_name: product.name,
          value: price,
          currency: "BDT",
        },
        { event_id: eventId }
      );
    } catch (err) {
      console.warn("[TikTok] AddToWishlist error:", err);
    }
  }

  // 3. Fire server CAPI asynchronously
  sendServerCapiEvent({
    event_name: "AddToWishlist",
    event_id: eventId,
    custom_data: {
      content_name: product.name,
      content_category: product.category || "",
      content_ids: [productId],
      content_type: "product",
      value: price,
      currency: "BDT",
    },
  });
}

/**
 * Track InitiateCheckout (User enters checkout page)
 */
export function trackInitiateCheckout(params: {
  items: AnalyticsProduct[];
  value: number;
  currency?: string;
  eventId?: string;
}) {
  if (typeof window === "undefined") return;

  const value = Number(params.value) || 0;
  const currency = params.currency || "BDT";
  const contentIds = params.items.map((item) => String(item.id));
  const numItems = params.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const eventId = params.eventId || generateEventId("ic");

  // 1. Meta (Facebook) Pixel
  if (typeof window.fbq === "function") {
    try {
      window.fbq(
        "track",
        "InitiateCheckout",
        {
          content_ids: contentIds,
          content_type: "product",
          num_items: numItems,
          value: value,
          currency: currency,
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.warn("[Meta Pixel] InitiateCheckout error:", err);
    }
  }

  // 2. Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "begin_checkout", {
        currency: currency,
        value: value,
        items: params.items.map((item) => ({
          item_id: String(item.id),
          item_name: item.name,
          price: Number(item.price) || 0,
          quantity: item.quantity || 1,
        })),
      });
    } catch (err) {
      console.warn("[GA4] begin_checkout error:", err);
    }
  }

  // 3. TikTok Pixel (ttq)
  if (window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track(
        "InitiateCheckout",
        {
          contents: params.items.map((item) => ({
            content_id: String(item.id),
            content_type: "product",
            content_name: item.name,
            quantity: item.quantity || 1,
            price: Number(item.price) || 0,
          })),
          content_type: "product",
          value: value,
          currency: currency,
        },
        { event_id: eventId }
      );
    } catch (err) {
      console.warn("[TikTok] InitiateCheckout error:", err);
    }
  }

  // 4. Fire server CAPI asynchronously
  sendServerCapiEvent({
    event_name: "InitiateCheckout",
    event_id: eventId,
    custom_data: {
      content_ids: contentIds,
      content_type: "product",
      num_items: numItems,
      value: value,
      currency: currency,
    },
  });
}

/**
 * Track Purchase (Order completed successfully)
 * Includes deduplication guard and eventID matching for CAPI & TikTok.
 */
export function trackPurchase(data: PurchaseData) {
  if (typeof window === "undefined" || !data.orderId) return;

  const dedupKey = `tracked_purchase_${data.orderId}`;
  try {
    if (sessionStorage.getItem(dedupKey)) {
      return; // Already tracked this purchase on browser
    }
    sessionStorage.setItem(dedupKey, "true");
  } catch {}

  const value = Number(data.value) || 0;
  const currency = data.currency || "BDT";
  const contentIds = data.items?.map((item) => String(item.id)) || [];
  const numItems = data.numItems || (data.items ? data.items.reduce((acc, i) => acc + (i.quantity || 1), 0) : 1);
  const eventId = data.eventId || `order_${data.orderId}`;

  // 1. Meta (Facebook) Pixel with Deduplication eventID
  if (typeof window.fbq === "function") {
    try {
      window.fbq(
        "track",
        "Purchase",
        {
          content_ids: contentIds,
          content_type: "product",
          num_items: numItems,
          value: value,
          currency: currency,
          order_id: String(data.orderId),
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.warn("[Meta Pixel] Purchase error:", err);
    }
  }

  // 2. Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "purchase", {
        transaction_id: String(data.orderId),
        value: value,
        currency: currency,
        items:
          data.items?.map((item) => ({
            item_id: String(item.id),
            item_name: item.name,
            price: Number(item.price) || 0,
            quantity: item.quantity || 1,
          })) || [],
      });
    } catch (err) {
      console.warn("[GA4] purchase error:", err);
    }
  }

  // 3. TikTok Pixel (ttq - CompletePayment event)
  if (window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track(
        "CompletePayment",
        {
          contents: data.items?.map((item) => ({
            content_id: String(item.id),
            content_type: "product",
            content_name: item.name,
            quantity: item.quantity || 1,
            price: Number(item.price) || 0,
          })) || [
            {
              content_id: String(data.orderId),
              content_type: "product",
              quantity: numItems,
              price: value,
            },
          ],
          content_type: "product",
          content_id: String(data.orderId),
          value: value,
          currency: currency,
        },
        { event_id: eventId }
      );
    } catch (err) {
      console.warn("[TikTok] CompletePayment error:", err);
    }
  }
}

/**
 * Track Search Event across Meta, GA4, and TikTok Pixel
 */
export function trackSearchEvent(query: string) {
  if (typeof window === "undefined" || !query) return;

  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  // 1. Meta Pixel
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", "Search", { search_string: cleanQuery });
    } catch (err) {
      console.warn("[Meta Pixel] Search error:", err);
    }
  }

  // 2. GA4
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "search", { search_term: cleanQuery });
    } catch (err) {
      console.warn("[GA4] search error:", err);
    }
  }

  // 3. TikTok Pixel
  if (window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track("Search", { query: cleanQuery });
    } catch (err) {
      console.warn("[TikTok] Search error:", err);
    }
  }
}
