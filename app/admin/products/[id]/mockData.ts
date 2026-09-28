export type Transaction = {
  date: string;
  type: string;
  title: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type ProductMockData = {
  id: string;
  name: string;
  banglaName?: string;
  qty: number;
  sellPrice: number;
  purchasePrice: number;
  barcode: string;
  itemCode: string;
  sku: string;
  supplier: string;
  minStock: number;
  warranty: string;
  brand: string;
  category: string;
  status: "Published" | "Draft" | "Inactive";
  image: string;
  transactions: Transaction[];
};

export const mockProducts: ProductMockData[] = [
  {
    id: "1",
    name: "New Summer T-shirt",
    banglaName: "নতুন সামার টি-শার্ট",
    qty: 9.00,
    sellPrice: 150.00,
    purchasePrice: 120.00,
    barcode: "070626104324963",
    itemCode: "151170",
    sku: "35689070626",
    supplier: "Zakir",
    minStock: 1.00,
    warranty: "N/A",
    brand: "N/A",
    category: "N/A",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "New", qty: 0.00, unitPrice: 150.00, total: 0.00 },
      { date: "2026-06-07", type: "Sale", title: "Zobbar Khan", qty: 1.00, unitPrice: 150.00, total: 150.00 },
      { date: "2026-06-07", type: "Purchase", title: "Zakir", qty: 10.00, unitPrice: 120.00, total: 1200.00 },
      { date: "2026-06-07", type: "Sale Return", title: "Zobbar Khan", qty: 3.00, unitPrice: 150.00, total: 450.00 }
    ]
  },
  {
    id: "2",
    name: "Formal Shirt (Man)",
    banglaName: "ফরমাল শার্ট (ম্যান)",
    qty: 83.00,
    sellPrice: 1200.00,
    purchasePrice: 900.00,
    barcode: "070626104324964",
    itemCode: "151171",
    sku: "35689070627",
    supplier: "Karim Supplier",
    minStock: 5.00,
    warranty: "N/A",
    brand: "Easy",
    category: "Clothing",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "Opening Stock", qty: 50.00, unitPrice: 900.00, total: 45000.00 },
      { date: "2026-06-07", type: "Sale", title: "Zobbar Khan", qty: 5.00, unitPrice: 1200.00, total: 6000.00 },
      { date: "2026-06-07", type: "Purchase", title: "Karim Supplier", qty: 40.00, unitPrice: 900.00, total: 36000.00 },
      { date: "2026-06-07", type: "Sale Return", title: "Zobbar Khan", qty: 2.00, unitPrice: 1200.00, total: 2400.00 }
    ]
  },
  {
    id: "3",
    name: "Vision Infrared Cooker VISION-XI-26",
    qty: 74.00,
    sellPrice: 4500.00,
    purchasePrice: 3800.00,
    barcode: "070626104324965",
    itemCode: "151172",
    sku: "35689070628",
    supplier: "Vision Distributor",
    minStock: 2.00,
    warranty: "1 Year",
    brand: "Vision",
    category: "Home Appliances",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "New Batch", qty: 80.00, unitPrice: 3800.00, total: 304000.00 },
      { date: "2026-06-07", type: "Sale", title: "Walk-in Customer", qty: 6.00, unitPrice: 4500.00, total: 27000.00 }
    ]
  },
  {
    id: "4",
    name: "Kalponik rice cooker 1.8L",
    qty: 46.50,
    sellPrice: 2800.00,
    purchasePrice: 2200.00,
    barcode: "070626104324966",
    itemCode: "151173",
    sku: "35689070629",
    supplier: "Sagor",
    minStock: 3.00,
    warranty: "N/A",
    brand: "Kalponik",
    category: "Kitchen Appliances",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "Opening Stock", qty: 50.00, unitPrice: 2200.00, total: 110000.00 },
      { date: "2026-06-07", type: "Sale", title: "Customer A", qty: 3.50, unitPrice: 2800.00, total: 9800.00 }
    ]
  },
  {
    id: "5",
    name: "Itallano 3.5\" Square Coffee Mugw vrlants",
    qty: 31.00,
    sellPrice: 350.00,
    purchasePrice: 250.00,
    barcode: "070626104324967",
    itemCode: "151174",
    sku: "35689070630",
    supplier: "Itallano Imports",
    minStock: 10.00,
    warranty: "N/A",
    brand: "Itallano",
    category: "Tableware",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "Opening Stock", qty: 40.00, unitPrice: 250.00, total: 10000.00 },
      { date: "2026-06-07", type: "Sale", title: "Customer Cafe", qty: 9.00, unitPrice: 350.00, total: 3150.00 }
    ]
  },
  {
    id: "6",
    name: "Arraf rice cooker 3.0L",
    qty: 27.00,
    sellPrice: 3200.00,
    purchasePrice: 2600.00,
    barcode: "070626104324968",
    itemCode: "151175",
    sku: "35689070631",
    supplier: "Arraf Electronics",
    minStock: 2.00,
    warranty: "2 Years",
    brand: "Arraf",
    category: "Kitchen Appliances",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "Opening Stock", qty: 30.00, unitPrice: 2600.00, total: 78000.00 },
      { date: "2026-06-07", type: "Sale", title: "Walk-in Buyer", qty: 3.00, unitPrice: 3200.00, total: 9600.00 }
    ]
  },
  {
    id: "7",
    name: "Sumu premium rice cooker 2.8L",
    qty: 56.00,
    sellPrice: 3100.00,
    purchasePrice: 2500.00,
    barcode: "070626104324969",
    itemCode: "151176",
    sku: "35689070632",
    supplier: "Sumu Trade",
    minStock: 4.00,
    warranty: "1.5 Years",
    brand: "Sumu",
    category: "Kitchen Appliances",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "Opening Stock", qty: 60.00, unitPrice: 2500.00, total: 150000.00 },
      { date: "2026-06-07", type: "Sale", title: "Retail Sale", qty: 4.00, unitPrice: 3100.00, total: 12400.00 }
    ]
  },
  {
    id: "8",
    name: "Arraf Induction Cooker",
    qty: 57.00,
    sellPrice: 3800.00,
    purchasePrice: 3100.00,
    barcode: "070626104324970",
    itemCode: "151177",
    sku: "35689070633",
    supplier: "Arraf Electronics",
    minStock: 3.00,
    warranty: "1 Year",
    brand: "Arraf",
    category: "Kitchen Appliances",
    status: "Published",
    image: "/images/cosmetic_bottles.png",
    transactions: [
      { date: "2026-06-07", type: "Opening", title: "Initial Stock", qty: 60.00, unitPrice: 3100.00, total: 186000.00 },
      { date: "2026-06-07", type: "Sale", title: "Hasan", qty: 3.00, unitPrice: 3800.00, total: 11400.00 }
    ]
  }
];

export const tabs = [
  { id: "all", name: "Transactions" },
  { id: "sale", name: "Sales" },
  { id: "sale_return", name: "Sale Returns" },
  { id: "sale_change", name: "Sale Changes" },
  { id: "purchase", name: "Purchases" },
  { id: "purchase_return", name: "Purchase Returns" },
  { id: "adjustment", name: "Adjustments" }
];
