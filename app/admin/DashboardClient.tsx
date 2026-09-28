"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Store, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  PlusCircle, 
  ArrowUpRight, 
  AlertTriangle,
  Layers,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Link from "next/link";

// Mock data for graphs
const monthlySalesData = [
  { name: 'Jan', revenue: 4200, profit: 1800 },
  { name: 'Feb', revenue: 5800, profit: 2400 },
  { name: 'Mar', revenue: 8100, profit: 3600 },
  { name: 'Apr', revenue: 7600, profit: 3200 },
  { name: 'May', revenue: 10400, profit: 4600 },
  { name: 'Jun', revenue: 12850, profit: 5400 },
];

const categoryData = [
  { name: 'Electronics', sales: 45 },
  { name: 'Clothing', sales: 78 },
  { name: 'Home & Kitchen', sales: 24 },
  { name: 'Fitness', sales: 36 },
  { name: 'Accessories', sales: 52 },
];

// Mock data for tables
const lowStockProducts = [
  { id: 1, name: "Nike Pegasus 40 Running Shoes", category: "Footwear", stock: 2, price: "$120.00" },
  { id: 2, name: "Wireless Mechanical Keyboard", category: "Electronics", stock: 3, price: "$85.00" },
  { id: 3, name: "Premium Leather Wallet", category: "Accessories", stock: 1, price: "$45.00" },
];

const recentOrders = [
  { id: "ORD-9304", customer: "John Doe", product: "Wireless Earbuds", date: "June 05, 2026", status: "Completed", amount: "$59.99" },
  { id: "ORD-9281", customer: "Sarah Smith", product: "Yoga Mat Pro", date: "June 04, 2026", status: "Processing", amount: "$39.50" },
  { id: "ORD-9252", customer: "Mike Johnson", product: "Waterproof Backpack", date: "June 03, 2026", status: "Shipped", amount: "$79.00" },
  { id: "ORD-9210", customer: "Emily Davis", product: "Mechanical Keyboard", date: "June 02, 2026", status: "Completed", amount: "$85.00" },
];

export default function DashboardClient() {
  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[24px] p-6 md:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-[30%] h-full opacity-25 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-indigo-500 blur-[80px]" />
          <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-purple-500 blur-[60px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Store size={12} />
              Admin Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa"}</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">
              Manage your warehouse, view sales analytics, and control product inventory. Here is an overview of your business today.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link 
              href="/admin/products/add" 
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all hover:-translate-y-0.5 duration-300"
            >
              <PlusCircle size={16} />
              Add Product
            </Link>
            <Link 
              href="/admin/cat/category"
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all hover:-translate-y-0.5 duration-300"
            >
              <Layers size={16} />
              Create Category
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales Card */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                <h3 className="text-2xl font-bold text-slate-800">$12,850.40</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-all group-hover:scale-110">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-500 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={14} className="mr-0.5" />
                +14.8%
              </span>
              <span className="text-slate-400 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Monthly Orders</p>
                <h3 className="text-2xl font-bold text-slate-800">184</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 transition-all group-hover:scale-110">
                <ShoppingCart size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-500 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={14} className="mr-0.5" />
                +8.2%
              </span>
              <span className="text-slate-400 ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Active Products</p>
                <h3 className="text-2xl font-bold text-slate-800">32 / 36</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 transition-all group-hover:scale-110">
                <Package size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-indigo-500 flex items-center font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                4 Pending
              </span>
              <span className="text-slate-400 ml-2">approval</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Warning Card */}
        <Card className="relative overflow-hidden border-rose-100 group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
                <h3 className="text-2xl font-bold text-rose-600">3</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 transition-all group-hover:scale-110">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-rose-500 flex items-center font-medium bg-rose-50 px-2 py-0.5 rounded-md animate-pulse">
                Action Required
              </span>
              <span className="text-slate-400 ml-2">reorder soon</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Revenue & Profit Overview</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Monthly breakdown of your sales performance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">Last 6 Months</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }}
                  />
                  <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" name="Net Profit" dataKey="profit" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categories Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Category Sales</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Product orders grouped by category</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 8 }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="sales" name="Sales Unit" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid of details tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Widget */}
        <Card className="border border-rose-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle size={16} />
              </div>
              <div>
                <CardTitle className="text-base">Critical Stock Warnings</CardTitle>
                <p className="text-xs text-slate-400">Products with stock at or below minimum threshold</p>
              </div>
            </div>
            <Link href="/admin/products/list" className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold flex items-center gap-1">
              Manage Inventory
              <ChevronRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="px-0 py-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Product</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-center">Stock</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.category}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          {p.stock} left
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ClipboardList size={16} />
              </div>
              <div>
                <CardTitle className="text-base">Recent Sales Orders</CardTitle>
                <p className="text-xs text-slate-400">List of last orders processed in your store</p>
              </div>
            </div>
            <Link href="/admin/sales/list" className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold flex items-center gap-1">
              View All Orders
              <ChevronRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="px-0 py-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Order ID</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-indigo-600 hover:underline cursor-pointer">{order.id}</span>
                        <div className="text-[10px] text-slate-400">{order.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{order.customer}</div>
                        <div className="text-xs text-slate-400">{order.product}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${order.status === "Completed" ? "bg-emerald-50 text-emerald-700" : ""}
                          ${order.status === "Processing" ? "bg-amber-50 text-amber-700" : ""}
                          ${order.status === "Shipped" ? "bg-blue-50 text-blue-700" : ""}
                        `}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
