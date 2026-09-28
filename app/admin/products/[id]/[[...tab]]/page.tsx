import { getProductDetails, getProducts } from "@/lib/api/products";
import { getStockMovements } from "@/lib/api/stock";
import ProductListPanel from "@/app/admin/products/[id]/components/ProductListPanel";
import ProductInfoCard from "@/app/admin/products/[id]/components/ProductInfoCard";
import TransactionHistoryCard from "@/app/admin/products/[id]/components/TransactionHistoryCard";
import VariantsCard from "@/app/admin/products/[id]/components/VariantsCard";
import type { VariantData } from "@/app/admin/products/[id]/components/VariantsCard";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string; tab?: string[] }> }) {
  const resolvedParams = await params;
  const activeId = resolvedParams.id;
  const tabArray = resolvedParams.tab;
  const activeTab = tabArray && tabArray.length > 0 ? tabArray[0] : "all";

  // 1. Fetch real product details
  const detailRes = await getProductDetails(activeId);
  if (!detailRes.success || !detailRes.resources) {
    return notFound();
  }
  const product = detailRes.resources;

  // 2. Fetch real products list for left panel
  const listRes = await getProducts();
  const productsList = listRes.success ? listRes.resources : [];

  // 3. Fetch stock movements for the TransactionHistoryCard adjustment tab
  const movementsRes = await getStockMovements(Number(activeId));
  const stockMovements = movementsRes.success ? movementsRes.resources?.data || [] : [];

  // Map variants to VariantsCard layout format
  const mappedVariants: VariantData[] = (product.variants || []).map((v) => ({
    id: v.id,
    title: product.has_variants ? v.sku.replace(new RegExp(`^${product.slug}-`), '') : "Default",
    sku: v.sku,
    price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
    purchasePrice: v.purchase_price != null ? (typeof v.purchase_price === 'string' ? parseFloat(v.purchase_price) : v.purchase_price) : null,
    discountPrice: v.discount_price ? (typeof v.discount_price === 'string' ? parseFloat(v.discount_price) : v.discount_price) : null,
    barcode: v.barcode || "—",
    stock: v.stock,
  }));

  const variantInfos = mappedVariants.map((v) => ({
    id: v.id,
    title: v.title,
    stock: v.stock,
    price: v.price,
    purchasePrice: v.purchasePrice,
  }));

  const sampleColorImages: Record<string, string> = {};

  // Mock transaction list for non-adjustment tabs
  const mockTransactions: any[] = [];

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative text-slate-800 bg-slate-50/30">
      {/* Main Grid Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column - Total Items List */}
        <div className="col-span-1 lg:col-span-3">
          <ProductListPanel 
            products={productsList} 
            activeProductId={String(product.id)} 
          />
        </div>

        {/* Right column - Details cards */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* Top Card: Product Details */}
          <ProductInfoCard product={product} variants={variantInfos} />

          {/* Variants Card */}
          <VariantsCard variants={mappedVariants} colorImages={sampleColorImages} />

          {/* Bottom Card: Tabs & Transactions */}
          <TransactionHistoryCard 
            transactions={mockTransactions}
            stockMovements={stockMovements}
            productId={Number(activeId)}
            activeTab={activeTab}
          />

        </div>
      </div>
    </div>
  );
}
