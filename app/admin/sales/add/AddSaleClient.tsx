"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ProductGrid, POSProduct } from "@/app/admin/sales/add/components/ProductGrid";
import { CartPanel, CartItem } from "@/app/admin/sales/add/components/CartPanel";
import { CustomerModal, Customer } from "@/app/admin/sales/add/components/CustomerModal";
import { InvoiceReceiptModal, ReceiptData } from "@/app/admin/sales/add/components/InvoiceReceiptModal";
import { getProductDetails, checkProductByBarcode } from "@/lib/api/products";
import { createOrder } from "@/lib/api/orders";
import { Account } from "@/lib/api/accounts";

interface AddSaleClientProps {
  initialProducts: any[];
  initialCustomers: any[];
  initialAccounts: any[];
}

export default function AddSaleClient({ initialProducts, initialCustomers, initialAccounts }: AddSaleClientProps) {
  // Master Lists loaded from server or fallback mock data
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart/Checkout States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paidAmount, setPaidAmount] = useState<string>("");

  // Modals States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Variant selection
  const [variantProduct, setVariantProduct] = useState<POSProduct | null>(null);
  const [variantList, setVariantList] = useState<{ id: number; sku: string; barcode?: string | null; price: number; stock: number }[]>([]);
  const [isVariantLoading, setIsVariantLoading] = useState(false);

  // VAT Tax percentage default
  const [taxRate, setTaxRate] = useState<number>(0);

  // Map API Product payload to POSProduct interface
  const mapToPOSProduct = (p: any): POSProduct => {
    if (p.sellPrice !== undefined) {
      return {
        id: String(p.id),
        name: p.name,
        banglaName: p.banglaName,
        sellPrice: Number(p.sellPrice),
        stock: Number(p.qty),
        barcode: p.barcode,
        category: p.category || "General",
        image: p.image,
        brand: p.brand,
        sku: p.sku,
        hasVariant: false,
        variantId: p.id,
      };
    }
    return {
      id: String(p.id),
      name: p.name,
      banglaName: p.bangla_name || undefined,
      sellPrice: Number(p.price || p.min_price || 0),
      stock: Number(p.total_stock || 0),
      barcode: p.slug || String(p.id),
      category: p.category?.name || "General",
      image: p.thumbnail || undefined,
      brand: p.brand?.name || undefined,
      sku: p.slug || undefined,
      hasVariant: p.has_variants || false,
      variantId: p.variants?.[0]?.id || undefined,
    };
  };

  // Map API AdminUser payload to Customer interface
  const mapToCustomer = (u: any): Customer => {
    return {
      id: String(u.id),
      name: u.name,
      phone: u.phone || "",
      email: u.email || undefined,
      address: u.address || undefined,
    };
  };

  // Initialize and Sync initial data collections
  useEffect(() => {
    // 1. Process products
    let finalProducts: POSProduct[] = [];
    if (initialProducts && initialProducts.length > 0) {
      finalProducts = initialProducts.map(mapToPOSProduct);
    }
    setProducts(finalProducts);

    // 2. Process customers
    let finalCustomers: Customer[] = [];
    if (initialCustomers && initialCustomers.length > 0) {
      finalCustomers = initialCustomers.map(mapToCustomer);
    }
    setCustomers(finalCustomers);

    // 3. Process accounts
    let finalAccounts: Account[] = [];
    if (initialAccounts && initialAccounts.length > 0) {
      finalAccounts = initialAccounts;
    }
    setAccounts(finalAccounts);

    const cashAccount = finalAccounts.find(a => a.type === "cash") || finalAccounts[0];
    if (cashAccount) {
      setPaymentMethod(String(cashAccount.id));
    }

    setIsLoading(false);
  }, [initialProducts, initialCustomers, initialAccounts]);

  // Cart operations
  const handleAddToCart = (product: POSProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return prevCart;
        
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                total: (item.quantity + 1) * item.unitPrice 
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          id: `ITEM-${Date.now()}-${product.id}`,
          product,
          quantity: 1,
          unitPrice: product.sellPrice,
          total: product.sellPrice,
        },
      ];
    });
  };

  const handleSelectProduct = async (product: POSProduct) => {
    if (!product.hasVariant) {
      handleAddToCart(product);
      return;
    }

    const toastId = toast.loading("Checking variants...");
    try {
      const res = await getProductDetails(product.id);
      if (res.success && res.resources?.variants) {
        const variants = res.resources.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          barcode: v.barcode,
          price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
          stock: v.stock,
        }));

        if (variants.length === 1) {
          const singleVariant = variants[0];
          const cartItem: POSProduct = {
            id: `var-${singleVariant.id}`,
            name: `${product.name || ''} - ${singleVariant.sku}`,
            sellPrice: singleVariant.price,
            stock: singleVariant.stock,
            barcode: singleVariant.sku,
            category: product.category || 'General',
            sku: singleVariant.sku,
            variantId: singleVariant.id,
            hasVariant: false,
          };
          handleAddToCart(cartItem);
        } else if (variants.length > 1) {
          setVariantProduct(product);
          setVariantList(variants);
        } else {
          handleAddToCart(product);
        }
      } else {
        handleAddToCart(product);
      }
    } catch {
      handleAddToCart(product);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleAddVariant = (variant: { id: number; sku: string; barcode?: string | null; price: number; stock: number }) => {
    const product = variantProduct;
    if (!product) return;
    const cartItem: POSProduct = {
      id: `var-${variant.id}`,
      name: `${product.name || ''} - ${variant.sku}`,
      sellPrice: variant.price,
      stock: variant.stock,
      barcode: variant.sku,
      category: product.category || 'General',
      sku: variant.sku,
      variantId: variant.id,
      hasVariant: false,
    };
    handleAddToCart(cartItem);
    setVariantProduct(null);
    setVariantList([]);
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: qty, total: qty * item.unitPrice }
          : item
      )
    );
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, unitPrice: price, total: item.quantity * price }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Barcode scanner lookup and add
  const handleScanBarcode = async (barcode: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = barcode.trim();
    if (!trimmed) {
      return { success: false, message: "Empty barcode!" };
    }

    try {
      const res = await checkProductByBarcode(trimmed);
      if (res.success && res.resources) {
        const productData = res.resources;

        const mappedProduct: POSProduct = {
          id: String(productData.id),
          name: productData.name,
          banglaName: productData.banglaName || undefined,
          sellPrice: Number(productData.sellPrice),
          stock: Number(productData.stock),
          barcode: productData.barcode,
          category: productData.category || "General",
          image: productData.image || undefined,
          brand: productData.brand || undefined,
          sku: productData.sku || undefined,
          variantId: Number(productData.variant_id) || undefined,
          hasVariant: Boolean(productData.hasVariant),
        };

        handleAddToCart(mappedProduct);

        return {
          success: true,
          message: `Added "${mappedProduct.name}"`,
        };
      } else {
        return {
          success: false,
          message: res.message || `Barcode "${trimmed}" not found!`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Product not found or out of stock.",
      };
    }
  };

  // Add new customer local state registration
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setActiveCustomer(newCustomer);
  };

  // Generate cart quantities mapped by ID
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  // Checkout process — calls backend API
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckoutLoading(true);

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const discountAmount =
      discountType === "percentage"
        ? (subtotal * (discountValue || 0)) / 100
        : discountValue || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * taxRate) / 100;
    const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
    if (paidAmount.trim() === "") {
      toast.error("Please enter the amount paid.");
      setIsCheckoutLoading(false);
      return;
    }

    const paid = parseFloat(paidAmount);
    if (isNaN(paid) || paid < 0) {
      toast.error("Please enter a valid amount paid.");
      setIsCheckoutLoading(false);
      return;
    }

    if (paid < grandTotal && !activeCustomer) {
      toast.error("Walk-in customers cannot have a due balance. Please select a customer or pay in full.");
      setIsCheckoutLoading(false);
      return;
    }

    const clientId = activeCustomer?.id ? Number(activeCustomer.id) : null;
    const payload = {
      items: cart.map((item) => ({
        product_variant_id: item.product.variantId || parseInt(item.product.id.replace("var-", "")),
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
      account_id: paid > 0 && paymentMethod ? parseInt(paymentMethod) : null,
      client_id: Number.isFinite(clientId) ? clientId : null,
      discount_amount: discountAmount || 0,
      tax_rate: taxRate || 0,
      paid_amount: paid,
    };

    const result = await createOrder(payload);

    if (!result.success) {
      toast.error(result.message || "Failed to create order");
      setIsCheckoutLoading(false);
      return;
    }

    const order = result.resources;

    const newReceipt: ReceiptData = {
      invoiceId: order.invoice_no,
      date: new Date(order.date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      customerName: activeCustomer ? activeCustomer.name : "Walk-in Customer",
      customerPhone: activeCustomer ? activeCustomer.phone : "",
      items: order.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        banglaName: undefined,
        sellPrice: item.unit_price,
        quantity: item.quantity,
        total: item.total,
      })),
      subtotal: order.subtotal,
      discountAmount: order.discount_amount,
      taxAmount: order.tax_amount,
      grandTotal: order.grand_total,
      paymentMethod: order.payment_method,
      paidAmount: order.paid_amount,
      changeAmount: order.change_amount,
    };

    setReceiptData(newReceipt);
    setIsReceiptModalOpen(true);
    setIsCheckoutLoading(false);
  };

  // Reset page checkout states
  const handleNewSale = () => {
    setCart([]);
    setActiveCustomer(null);
    setDiscountValue(0);
    setTaxRate(0);
    setPaidAmount("");
    const cashAccount = accounts.find(a => a.type === "cash") || accounts[0];
    if (cashAccount) {
      setPaymentMethod(String(cashAccount.id));
    } else {
      setPaymentMethod("cash");
    }
    setIsReceiptModalOpen(false);
    setReceiptData(null);
  };

  return (
    <div className="pt-1.5 pl-2 pr-1 pb-2 md:pt-2 md:pl-3 md:pr-2 md:pb-3 lg:pt-2.5 lg:pl-4 lg:pr-3 lg:pb-4 w-full space-y-3.5">
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-pulse">
          {/* Left Grid skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <div className="h-12 bg-slate-200 rounded-xl"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-3/4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          {/* Right Panel skeleton */}
          <div className="lg:col-span-6 h-[600px] bg-slate-200 rounded-2xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left side: Products Grid */}
          <div className="lg:col-span-6 h-[calc(100vh-45px)] min-h-[600px]">
            <ProductGrid
              products={products}
              onSelectProduct={handleSelectProduct}
              cartQuantities={cartQuantities}
            />
          </div>

          {/* Right side: checkout details */}
          <div className="lg:col-span-6 h-[calc(100vh-45px)] min-h-[600px]">
            <CartPanel
              cartItems={cart}
              onUpdateQty={handleUpdateQty}
              onUpdatePrice={handleUpdatePrice}
              onRemoveItem={handleRemoveItem}
              customers={customers}
              activeCustomer={activeCustomer}
              onSelectCustomer={setActiveCustomer}
              onOpenAddCustomer={() => setIsCustomerModalOpen(true)}
              discountType={discountType}
              onDiscountTypeChange={setDiscountType}
              discountValue={discountValue}
              onDiscountValueChange={setDiscountValue}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              accounts={accounts}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              paidAmount={paidAmount}
              onPaidAmountChange={setPaidAmount}
              onCheckout={handleCheckout}
              onClearCart={handleClearCart}
              isCheckoutLoading={isCheckoutLoading}
              onScanBarcode={handleScanBarcode}
            />
          </div>
        </div>
      )}

      {/* Inline Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <InvoiceReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={handleNewSale}
        data={receiptData}
        mode="pos_success"
        onNewSale={handleNewSale}
      />

      {/* Variant Selection Modal */}
      {variantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{variantProduct.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select a variant to add to cart</p>
            </div>
            {isVariantLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm">Loading variants...</div>
            ) : variantList.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm">No variants available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafafa] text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">SKU</th>
                      <th className="px-4 py-3 font-semibold">Barcode</th>
                      <th className="px-4 py-3 font-semibold text-right">Stock</th>
                      <th className="px-4 py-3 font-semibold text-right">Price</th>
                      <th className="px-4 py-3 font-semibold text-center w-14">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variantList.map((v) => (
                      <tr key={v.id} className={`hover:bg-slate-50/40 transition-colors ${v.stock <= 0 ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <span className="text-[13px] text-slate-800 font-bold">{variantProduct.name}</span>
                          <span className="text-[13px] text-slate-400 mx-1">-</span>
                          <span className="text-[13px] text-slate-500">{v.sku}</span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-500">{v.barcode || '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-right text-slate-700">{v.stock}</td>
                        <td className="px-4 py-3 text-[13px] text-right text-indigo-600 font-extrabold">৳{v.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAddVariant(v)}
                            disabled={v.stock <= 0}
                            className="h-7 w-7 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center mx-auto transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-3 border-t border-slate-100 bg-[#fafafa]/50 flex justify-end">
              <button
                onClick={() => { setVariantProduct(null); setVariantList([]); }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
