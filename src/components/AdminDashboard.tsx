/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGarage } from '../context/GarageContext';
import { Bill, LineItem, User, Vehicle } from '../types';
import { 
  Wrench, Users, Receipt, Settings, Plus, TrendingUp, TrendingDown, 
  Search, Filter, ChevronRight, HelpCircle, ShieldAlert, BadgeCheck, 
  Trash2, Save, FileText, LayoutDashboard, PlusCircle, WrenchIcon, LogOut,
  Car, PlusIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GarageLogo } from './GarageLogo';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, updateProfile, users, vehicles, bills, stats, logout, addBill, updateBillStatus, deleteBill,
    activeAdminTab, setActiveAdminTab, setSelectedBillId, registerCustomer, addVehicle
  } = useGarage();

  // Search/Filters State
  const [customerSearch, setCustomerSearch] = useState('');
  const [billSearch, setBillSearch] = useState('');
  const [billFilter, setBillFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Owner settings profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editOwnerAddress, setEditOwnerAddress] = useState('');
  const [editGstin, setEditGstin] = useState('');
  const [editOperatingHours, setEditOperatingHours] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  // Service categories states
  const [serviceCategories, setServiceCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('cag_service_categories');
    return saved ? JSON.parse(saved) : ['Engine Work', 'Body Paint', 'Diagnostics', 'Brakes & Suspension', 'AC & Heating', 'Electrical Diagnostics', 'Detailing & Polish'];
  });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const exists = serviceCategories.some(c => c.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        const updated = [...serviceCategories, trimmed];
        setServiceCategories(updated);
        localStorage.setItem('cag_service_categories', JSON.stringify(updated));
      }
    }
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const updated = serviceCategories.filter(c => c !== catToDelete);
    setServiceCategories(updated);
    localStorage.setItem('cag_service_categories', JSON.stringify(updated));
  };

  const handleOpenEditProfile = () => {
    setEditOwnerName(currentUser?.name || 'Alex Miller');
    setEditOwnerEmail(currentUser?.email || 'alex.miller@cityautogarage.com');
    setEditOwnerPhone(currentUser?.phone || '9876543210');
    setEditOwnerAddress(currentUser?.address || 'Plot 402, Industrial Estate, Sector 18, Gurugram, HR - 122015');
    setEditGstin(currentUser?.gstin || '07AAGCC8114K1Z1');
    setEditOperatingHours(currentUser?.operatingHours || 'Monday - Saturday | 09:00 AM - 08:00 PM');
    setEditAvatarUrl(currentUser?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH_k5RpsHYaN-ADLvLbNrxsKyJns7MVQlyxu-6fJCCLg7n81eNOTDthJk1Byc8KlFSTqC6kkGv6_OnjIztb8TASc3BsizQ9JQK_eW6rDnst8Rihgw2uCD-Bbod29t4aJiJJ6TDvuDR9k9LFxrmTsVphstDFojgJ0kEI6kzJHQs2hD5J2ZkOtVhDJ6jqQduTjiiUsZwzv2kxhyek2u6PlDGf_jqxBSFgfVP4-iUmsSgsxhWQ7704rUpywSSLLPnGIeyr8dIacKFS70');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editOwnerName, editOwnerEmail, editOwnerPhone, editOwnerAddress, {
      gstin: editGstin,
      operatingHours: editOperatingHours,
      avatarUrl: editAvatarUrl
    });
    setIsEditingProfile(false);
  };

  // Dynamic monthly chart generator using realistic base curves updated by actual paid bills
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    const now = new Date();
    
    // We want the past 6 months (ending with current month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      
      const monthBills = bills.filter(b => {
        if (b.status !== 'Paid') return false;
        
        // Exact date parsing
        const bDate = new Date(b.date);
        if (isNaN(bDate.getTime())) {
          // Fallback parsing for static mock dates string like "Oct 24, 2023"
          const parts = b.date.replace(/,/g, '').split(' ');
          const billMonth = parts[0]; // e.g. "Oct"
          const billYear = parts[2]; // e.g. "2023"
          return (
            billMonth && billYear &&
            billMonth.toLowerCase().startsWith(mName.toLowerCase().slice(0, 3)) &&
            billYear === year.toString()
          );
        }
        return bDate.getMonth() === d.getMonth() && bDate.getFullYear() === d.getFullYear();
      });

      let partsTotal = 0;
      let labourTotal = 0;

      monthBills.forEach(b => {
        b.items.forEach(item => {
          if (item.category === 'Parts') {
            partsTotal += item.total;
          } else {
            labourTotal += item.total;
          }
        });
      });

      // Realistic business growth background curves per month
      let baseParts = 0;
      let baseLabour = 0;

      switch(mName) {
        case 'Dec': baseParts = 21000; baseLabour = 14000; break;
        case 'Jan': baseParts = 28000; baseLabour = 19000; break;
        case 'Feb': baseParts = 32000; baseLabour = 22000; break;
        case 'Mar': baseParts = 29000; baseLabour = 21000; break;
        case 'Apr': baseParts = 35000; baseLabour = 26000; break;
        case 'May': baseParts = 39000; baseLabour = 29000; break;
        default: baseParts = 25000; baseLabour = 18000;
      }

      const finalParts = baseParts + partsTotal;
      const finalLabour = baseLabour + labourTotal;
      const finalTotal = finalParts + finalLabour;

      result.push({
        month: `${mName} ${year.toString().slice(-2)}`,
        Parts: finalParts,
        Labour: finalLabour,
        Revenue: finalTotal
      });
    }
    return result;
  };

  const chartData = getChartData();

  // New Customer Modal States
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Service Entry / New Bill drafting State
  const [draftCustomerId, setDraftCustomerId] = useState('');
  const [draftVehicleId, setDraftVehicleId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'Parts' | 'Labour'>('Parts');
  const [itemQty, setItemQty] = useState('1');
  const [itemRate, setItemRate] = useState('');
  const [draftItems, setDraftItems] = useState<LineItem[]>([]);
  const [draftNotes, setDraftNotes] = useState('');

  // Add Item to Draft list
  const handleAddItemToDraft = () => {
    if (!itemName || !itemQty || !itemRate) return;

    const qtyVal = parseFloat(itemQty) || 1;
    const rateVal = parseFloat(itemRate) || 0;

    const newItem: LineItem = {
      id: `li-${Date.now()}`,
      name: itemName,
      category: itemCategory,
      qty: itemCategory === 'Parts' && itemName.toLowerCase().includes('oil') ? `${itemQty}L` : itemQty,
      rate: rateVal,
      total: qtyVal * rateVal
    };

    setDraftItems(prev => [...prev, newItem]);
    setItemName('');
    setQuantityAndRateDefaults();
  };

  const setQuantityAndRateDefaults = () => {
    setItemQty('1');
    setItemRate('');
  };

  const handleRemoveItemFromDraft = (id: string) => {
    setDraftItems(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCustomerId || draftItems.length === 0) return;

    const selectedCust = users.find(u => u.id === draftCustomerId);
    const selectedVeh = vehicles.find(v => v.id === draftVehicleId);

    if (!selectedCust) return;

    // Build the bill Omit parts
    const newBill = addBill({
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      customerPhone: selectedCust.phone,
      customerEmail: selectedCust.email || `${selectedCust.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      vehicleDetails: {
        makeModel: selectedVeh ? selectedVeh.makeModel : 'General Workshop Service',
        plateNumber: selectedVeh ? selectedVeh.plateNumber : 'N/A',
        odometer: selectedVeh ? selectedVeh.odometer : 0,
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: draftItems,
      status: 'Paid',
      notes: draftNotes || 'Standard maintenance completed successfully.'
    });

    // Reset draft state
    setDraftCustomerId('');
    setDraftVehicleId('');
    setDraftItems([]);
    setDraftNotes('');
    
    // View detail immediately
    setSelectedBillId(newBill.id);
    setActiveAdminTab('bills');
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newUser = registerCustomer(newCustName, newCustPhone);
    setNewCustName('');
    setNewCustPhone('');
    setShowAddCustomerModal(false);
    
    // Pre-select the newly added customer if drafting
    setDraftCustomerId(newUser.id);
  };

  // Live total calculations for the drafted invoice
  const draftSubtotal = draftItems.reduce((sum, item) => sum + item.total, 0);
  const draftTax = 0; // GST is removed from bills
  const draftTotalAmount = draftSubtotal;

  // Filter bills list
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.id.toLowerCase().includes(billSearch.toLowerCase()) || 
                          bill.customerName.toLowerCase().includes(billSearch.toLowerCase()) ||
                          bill.vehicleDetails.makeModel.toLowerCase().includes(billSearch.toLowerCase());
    
    const matchesCategory = billFilter === 'All' || bill.status === billFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#fbf9fa] text-[#1b1c1d] min-h-screen pb-24 md:pb-0 md:pl-72 font-body selection:bg-[#cbd5e1] antialiased">
      
      {/* HEADER BAR FOR ADMINS */}
      <header className="fixed top-0 right-0 left-0 md:left-72 z-40 bg-white border-b border-[#c4c6cd]/50 h-16 shadow-xs select-none">
        <div className="flex justify-between items-center px-4 md:px-6 w-full max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-2.5 h-10">
            <GarageLogo variant="shield" className="h-full w-auto" />
            <h1 className="font-headline text-lg font-bold text-[#041627] tracking-tight">Workshop Console</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-headline text-xs font-bold text-[#041627] leading-none mb-0.5">Alex Miller</p>
              <p className="text-[10px] text-[#74777d] font-semibold uppercase leading-none">Workshop Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c4c6cd]/60 bg-[#d2e4fb]">
              <img 
                alt="Admin Owner Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH_k5RpsHYaN-ADLvLbNrxsKyJns7MVQlyxu-6fJCCLg7n81eNOTDthJk1Byc8KlFSTqC6kkGv6_OnjIztb8TASc3BsizQ9JQK_eW6rDnst8Rihgw2uCD-Bbod29t4aJiJJ6TDvuDR9k9LFxrmTsVphstDFojgJ0kEI6kzJHQs2hD5J2ZkOtVhDJ6jqQduTjiiUsZwzv2kxhyek2u6PlDGf_jqxBSFgfVP4-iUmsSgsxhWQ7704rUpywSSLLPnGIeyr8dIacKFS70"
              />
            </div>
          </div>
        </div>
      </header>

      {/* LEFT NAVIGATION SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex flex-col h-full w-72 fixed left-0 top-0 border-r border-[#c4c6cd]/50 bg-white p-4 gap-2 z-50 select-none">
        <div className="flex flex-col gap-1 mb-8 p-3 bg-[#f5f3f4] rounded-lg items-center text-center">
          <GarageLogo variant="full" textColor="dark" className="h-16 w-auto" />
          <p className="text-[10px] text-[#74777d] font-bold leading-none mt-4.5 uppercase tracking-wide">Workshop #402</p>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          <button 
            onClick={() => { setActiveAdminTab('dashboard'); setSelectedBillId(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeAdminTab === 'dashboard' 
                ? 'bg-[#1a2b3c] text-white shadow-xs' 
                : 'text-[#44474c] hover:bg-[#f5f3f4]'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveAdminTab('customers'); setSelectedBillId(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeAdminTab === 'customers' 
                ? 'bg-[#1a2b3c] text-white shadow-xs' 
                : 'text-[#44474c] hover:bg-[#f5f3f4]'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            Customers
          </button>
          <button 
            onClick={() => { setActiveAdminTab('bills'); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeAdminTab === 'bills' 
                ? 'bg-[#1a2b3c] text-white shadow-xs' 
                : 'text-[#44474c] hover:bg-[#f5f3f4]'
            }`}
          >
            <Receipt className="h-4.5 w-4.5" />
            Bills
          </button>
          <button 
            onClick={() => { setActiveAdminTab('new-bill'); setSelectedBillId(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeAdminTab === 'new-bill' 
                ? 'bg-[#1a2b3c] text-white shadow-xs' 
                : 'text-[#44474c] hover:bg-[#f5f3f4]'
            }`}
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Service Entry
          </button>
          <button 
            onClick={() => { setActiveAdminTab('settings'); setSelectedBillId(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeAdminTab === 'settings' 
                ? 'bg-[#1a2b3c] text-white shadow-xs' 
                : 'text-[#44474c] hover:bg-[#f5f3f4]'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            Settings
          </button>

          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg text-[#b6171e] hover:bg-[#ffdad6]/60 mt-auto transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="mt-16 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
        {/* VIEW 1: WORKSHOP MAIN OVERVIEW (DASHBOARD) */}
        {activeAdminTab === 'dashboard' && (
          <motion.div 
            key="admin-dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            
            {/* Header section with CTA */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold text-[#041627]">Workshop Overview</h2>
                <p className="text-[#44474c] text-xs mt-0.5">Real-time status indicators and financial tracking parameters.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => setActiveAdminTab('new-bill')}
                  className="bg-[#041627] text-white px-5 py-2.5 rounded-lg font-headline text-xs font-bold uppercase tracking-widest shrink-0 transition-transform active:scale-[0.98] select-none shadow-xs hover:bg-[#1a2b3c] flex items-center gap-1.5"
                >
                  <PlusIcon className="h-4 w-4 stroke-[2.5]" />
                  New Bill
                </button>
              </div>
            </div>

            {/* Revenue Bento Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
              
              {/* Weekly */}
              <div className="bg-white border-l-4 border-l-[#041627] border border-[#cbd5e1]/40 p-5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-headline text-[10px] font-bold text-[#44474c] tracking-widest uppercase">Weekly Revenue</span>
                  <span className="text-[#041627] font-bold text-xs">Wkly</span>
                </div>
                <div className="font-headline text-xl font-bold text-[#041627]">₹{stats.weeklyRevenue.toLocaleString()}.00</div>
                <div className="flex items-center gap-1 text-emerald-600 mt-2 text-xs font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+12% from last week</span>
                </div>
              </div>

              {/* Monthly */}
              <div className="bg-white border-l-4 border-l-[#041627] border border-[#cbd5e1]/40 p-5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-headline text-[10px] font-bold text-[#44474c] tracking-widest uppercase">Monthly Revenue</span>
                  <span className="text-[#041627] font-bold text-xs">Mthly</span>
                </div>
                <div className="font-headline text-xl font-bold text-[#041627]">₹{stats.monthlyRevenue.toLocaleString()}.50</div>
                <div className="flex items-center gap-1 text-emerald-600 mt-2 text-xs font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+5.4% from last month</span>
                </div>
              </div>

              {/* Yearly */}
              <div className="bg-white border-l-4 border-l-[#041627] border border-[#cbd5e1]/40 p-5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-headline text-[10px] font-bold text-[#44474c] tracking-widest uppercase">Yearly Revenue</span>
                  <span className="text-[#041627] font-bold text-xs">Yrly</span>
                </div>
                <div className="font-headline text-xl font-bold text-[#041627]">₹{stats.yearlyRevenue.toLocaleString()}.00</div>
                <div className="flex items-center gap-1 text-[#b6171e] mt-2 text-xs font-semibold">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>-2% vs target</span>
                </div>
              </div>

              {/* All time */}
              <div className="bg-white border-l-4 border-l-[#1a2b3c] border border-[#cbd5e1]/40 p-5 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-headline text-[10px] font-bold text-[#44474c] tracking-widest uppercase">All-time Revenue</span>
                  <span className="text-[#041627] font-bold text-xs">Total</span>
                </div>
                <div className="font-headline text-xl font-bold text-[#041627]">{stats.allTimeRevenue}</div>
                <div className="text-[10px] text-[#74777d] mt-2 font-bold uppercase tracking-wider">Since October 2023</div>
              </div>
            </section>

            {/* Revenue Analytics Graph Section */}
            <div className="bg-white rounded-xl shadow-2xs border border-[#cbd5e1]/40 p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-headline text-base font-bold text-[#041627] uppercase tracking-wider">Labour Revenue Trend</h3>
                  <p className="text-[#74777d] text-xs">Dynamic monthly analysis tracking engineering and repair service labour revenue.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#44474c]">
                    <span className="w-3 h-3 rounded-full bg-[#b6171e] block"></span>
                    <span>Labour Revenue (₹)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efedef" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#74777d" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#74777d" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px',
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                      formatter={(value: any, name: string) => [
                        `₹${(value as number).toLocaleString('en-IN')}`,
                        name
                      ]}
                    />
                    <Bar 
                      dataKey="Labour" 
                      fill="#b6171e" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Services and sidebar stats */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Recent Bills widget card list */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-2xs border border-[#c4c6cd]/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#c4c6cd]/40 flex justify-between items-center bg-[#f5f3f4]/70 select-none">
                  <h3 className="font-headline text-sm font-bold text-[#041627] uppercase tracking-wider">Recent Service Invoices</h3>
                  <button 
                    onClick={() => setActiveAdminTab('bills')}
                    className="text-[#041627] font-headline text-xs font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-white text-[#74777d] border-b border-[#c4c6cd]/45 font-headline font-bold text-[10px] uppercase">
                        <th className="p-4">Bill ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Vehicle</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c6cd]/30 font-body text-[#1b1c1d]">
                      {bills.slice(0, 5).map((bill) => (
                        <tr 
                          key={bill.id} 
                          onClick={() => setSelectedBillId(bill.id)}
                          className="hover:bg-[#f5f3f4]/40 cursor-pointer transition-colors group"
                        >
                          <td className="p-4 font-mono font-semibold text-[#041627]">{bill.id}</td>
                          <td className="p-4 font-semibold">{bill.customerName}</td>
                          <td className="p-4 text-[#44474c]">{bill.vehicleDetails.makeModel}</td>
                          <td className="p-4 text-right font-bold text-[#041627]">
                            ₹{bill.grandTotal.toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider leading-relaxed ${
                              bill.status === 'Paid' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                            }`}>
                              {bill.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advanced Diagnostic Box block */}
              <div className="flex flex-col gap-4 select-none">
                <div className="bg-[#041627] text-white p-6 rounded-xl shadow-md relative overflow-hidden group">
                  <div className="absolute right-[-15px] bottom-[-15px] opacity-10 transform rotate-12 transition-transform duration-500 group-hover:rotate-0">
                    <WrenchIcon className="h-28 w-28 text-white" />
                  </div>
                  <h4 className="font-headline text-lg font-bold mb-1">Technical Support</h4>
                  <p className="text-[#8192a7] text-xs leading-relaxed mb-5">
                    Access master parts catalog, schematic parameters, or diagnostic tools securely here.
                  </p>
                  <button 
                    onClick={() => setActiveAdminTab('new-bill')}
                    className="bg-white text-[#041627] px-4 py-2.5 rounded hover:bg-[#e9e7e9] font-headline text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                  >
                    Draft Invoice
                  </button>
                </div>
              </div>

            </section>
          </motion.div>
        )}

        {/* VIEW 2: CUSTOMERS MANAGEMENT DIRECTORY */}
        {activeAdminTab === 'customers' && (
          <motion.div 
            key="admin-customers"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold text-[#041627]">Customer Management</h2>
                <p className="text-[#74777d] text-xs mt-0.5">Manage details, history logs, and vehicle registrations.</p>
              </div>
              <button 
                onClick={() => setShowAddCustomerModal(true)}
                className="bg-[#b6171e] text-white px-5 py-2.5 rounded-lg font-headline text-xs font-bold uppercase tracking-widest hover:bg-[#da3433] select-none transition-transform active:scale-[0.98] shadow-xs flex items-center gap-1.5"
              >
                <Plus className="h-4.5 w-4.5" />
                Add New Customer
              </button>
            </div>

            {/* Search filter input */}
            <div className="relative max-w-md select-none">
              <Search className="h-5 w-5 text-[#cbd5e1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search clients by name, email, or mobile..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#c4c6cd] rounded-xl focus:ring-1 focus:ring-[#041627] focus:border-[#041627] transition-all font-body text-sm outline-none shadow-2xs"
              />
            </div>

            {/* Customers list and selected breakdown */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-7 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#74777d] uppercase tracking-wider list-none select-none px-1">
                  <span>Active Customers ({users.filter(u => !u.isAdmin).length})</span>
                  <span>Click to view Profile</span>
                </div>

                <div className="space-y-3.5">
                  {users
                    .filter(u => {
                      if (u.isAdmin) return false;
                      const term = customerSearch.toLowerCase();
                      return u.name.toLowerCase().includes(term) || 
                             u.phone.includes(term) || 
                             (u.email || '').toLowerCase().includes(term);
                    })
                    .map(user => {
                      const custVehicles = vehicles.filter(v => v.ownerId === user.id);
                      const isSelected = selectedCustomerId === user.id;

                      return (
                        <div 
                          key={user.id}
                          onClick={() => setSelectedCustomerId(isSelected ? null : user.id)}
                          className={`p-4 bg-white border rounded-lg shadow-2xs hover:shadow-xs border-l-4 transition-all cursor-pointer flex justify-between items-center ${
                            isSelected 
                              ? 'border-[#cbd5e1] border-l-[#b6171e] bg-[#f5f3f4]/30' 
                              : 'border-[#cbd5e1]/50 border-l-[#041627] hover:border-[#041627]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#1a2b3c] text-white flex items-center justify-center font-bold text-sm select-none">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-headline text-sm font-bold text-[#041627]">{user.name}</h4>
                              <p className="font-mono text-xs text-[#74777d] mt-1 flex items-center gap-1">
                                <span>+91 {user.phone}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-4">
                            <span className="bg-[#1a2b3c]/5 border border-[#1a2b3c]/20 text-[#1a2b3c] font-headline text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                              <Car className="h-3 w-3" />
                              {custVehicles.length} {custVehicles.length === 1 ? 'Car' : 'Cars'}
                            </span>
                            <ChevronRight className={`h-4.5 w-4.5 text-[#cbd5e1] transform transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Selected Customer Side Detailed Breakdown Panel */}
              <div className="lg:col-span-5 select-none">
                {selectedCustomerId ? (
                  (() => {
                    const customer = users.find(u => u.id === selectedCustomerId);
                    if (!customer) return null;
                    const custVehicles = vehicles.filter(v => v.ownerId === customer.id);
                    const custBills = bills.filter(b => b.customerId === customer.id || b.customerPhone === customer.phone);

                    return (
                      <div className="bg-white rounded-xl border border-[#c4c6cd]/55 shadow-xs p-6 space-y-6 animate-fade-in border-t-4 border-t-[#041627]">
                        
                        {/* Profile header */}
                        <div className="flex items-center gap-3 border-b border-[#efedef] pb-4">
                          <div className="h-12 w-12 rounded-full bg-[#1a2b3c] text-white flex items-center justify-center font-bold text-base">
                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-headline text-base font-extrabold text-[#041627]">{customer.name}</h3>
                            <p className="text-xs text-[#74777d]">Member since {customer.memberSince || '2024'} • Loyalty {customer.loyaltyPoints} pts</p>
                          </div>
                        </div>

                        {/* Registered Vehicles of this owner */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Registered Vehicles ({custVehicles.length})</p>
                          {custVehicles.length > 0 ? (
                            <div className="divide-y divide-[#c4c6cd]/20">
                              {custVehicles.map(veh => (
                                <div key={veh.id} className="py-2 flex justify-between items-center">
                                  <span className="text-sm font-semibold text-[#041627]">{veh.makeModel}</span>
                                  <span className="font-mono text-xs text-[#44474c] uppercase tracking-wider">{veh.plateNumber}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#74777d] italic">No cars registered. Draft invoice tool will handle general appointment.</p>
                          )}
                        </div>

                        {/* Historical invoices for this owner */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Invoice History ({custBills.length})</p>
                          {custBills.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                              {custBills.map(bill => (
                                <div 
                                  key={bill.id} 
                                  onClick={() => setSelectedBillId(bill.id)}
                                  className="p-2 border border-[#cbd5e1]/40 rounded hover:border-[#041627] flex justify-between items-center transition-all cursor-pointer"
                                >
                                  <div>
                                    <p className="font-mono text-[11px] font-semibold text-[#041627]">{bill.id}</p>
                                    <p className="text-[10px] text-[#44474c] mt-0.5">{bill.date}</p>
                                  </div>
                                  <div className="text-right flex items-center gap-2">
                                    <p className="text-[11px] font-bold text-[#1b1c1d]">
                                      ₹{bill.grandTotal.toLocaleString()}
                                    </p>
                                    <span className="text-[#041627] font-bold">&gt;</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#74777d] italic">No transaction logs available.</p>
                          )}
                        </div>

                        {/* Fast CTA */}
                        <div className="pt-3">
                          <button 
                            onClick={() => {
                              setDraftCustomerId(customer.id);
                              // Auto resolve vehicle if one exists
                              if (custVehicles.length > 0) {
                                setDraftVehicleId(custVehicles[0].id);
                              }
                              setActiveAdminTab('new-bill');
                            }}
                            className="w-full py-3 border border-[#cbd5e1] hover:border-[#041627] hover:bg-[#fbf9fa] text-[#041627] font-headline text-xs font-bold uppercase tracking-widest rounded-lg transition-colors text-center"
                          >
                            Draft Service Invoice
                          </button>
                        </div>

                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-[#f5f3f4]/70 p-10 rounded-xl border border-[#c4c6cd]/40 border-dashed text-center text-[#74777d] flex flex-col items-center justify-center min-h-[300px]">
                    <Users className="h-10 w-10 stroke-[1.5] text-[#cbd5e1] mb-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Select Customer</p>
                    <p className="text-xs text-[#44474c] mt-1 max-w-[240px]">
                      Choose any Customer profile from the left list to inspect registered vehicles, bills, and profile logs instantly.
                    </p>
                  </div>
                )}
              </div>

            </section>
          </motion.div>
        )}

        {/* VIEW 3: INVOICES & BILLS DIRECTORY VIEW */}
        {activeAdminTab === 'bills' && (
          <motion.div 
            key="admin-bills"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold text-[#041627]">Billing Management</h2>
                <p className="text-[#74777d] text-sm mt-0.5">Track resolved customer invoices, sales totals, and outstanding dues.</p>
              </div>
              <button 
                onClick={() => setActiveAdminTab('new-bill')}
                className="bg-[#041627] text-white px-5 py-2.5 rounded-lg font-headline text-xs font-bold uppercase tracking-widest hover:bg-[#1a2b3c] transition-all active:scale-[0.98] shadow-xs flex items-center gap-1.5"
              >
                <Plus className="h-4.5 w-4.5" />
                Draft New Bill
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 select-none">
              
              <div className="p-4 bg-white border border-[#c4c6cd]/50 rounded-xl flex flex-col justify-between h-30 border-l-4 border-l-[#041627]">
                <span className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Total Revenue Resolves</span>
                <span className="font-headline text-2xl font-extrabold text-[#041627]">₹42,850.00</span>
              </div>

              <div className="lg:col-span-3 bg-white border border-[#cbd5e1]/50 p-3 rounded-xl flex flex-wrap items-center gap-2 overflow-x-auto">
                <button 
                  onClick={() => setBillFilter('All')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    billFilter === 'All' 
                      ? 'bg-[#1a2b3c] text-white shadow-xs' 
                      : 'text-[#44474c] hover:bg-[#f5f3f4]'
                  }`}
                >
                  All Invoices
                </button>
                <button 
                  onClick={() => setBillFilter('Paid')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    billFilter === 'Paid' 
                      ? 'bg-[#1a2b3c] text-white shadow-xs' 
                      : 'text-[#44474c] hover:bg-[#f5f3f4]'
                  }`}
                >
                  Paid Only
                </button>
                <button 
                  onClick={() => setBillFilter('Pending')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    billFilter === 'Pending' 
                      ? 'bg-[#1a2b3c] text-white shadow-xs' 
                      : 'text-[#44474c] hover:bg-[#f5f3f4]'
                  }`}
                >
                  Pending Action
                </button>

                <div className="ml-auto relative min-w-[200px]">
                  <Search className="h-4 w-4 text-[#cbd5e1] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                    placeholder="Search invoice number..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#f5f3f4] border border-[#c4c6cd] rounded-lg focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

            </div>

            {/* Bills List Table */}
            <div className="bg-white border border-[#cbd5e1]/50 rounded-xl overflow-hidden shadow-2xs">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f5f3f4]/70 border-b border-[#cbd5e1]/45 font-headline font-semibold text-[10px] text-[#74777d] uppercase tracking-wider select-none">
                <div className="col-span-2">Invoice ID</div>
                <div className="col-span-4">Customer Details / Car</div>
                <div className="col-span-2">Service Date</div>
                <div className="col-span-2 text-right">Grand Total</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              <div className="divide-y divide-[#c4c6cd]/25">
                {filteredBills.map((bill) => (
                  <div 
                    key={bill.id} 
                    onClick={() => setSelectedBillId(bill.id)}
                    className="flex flex-col md:grid md:grid-cols-12 gap-2.5 md:gap-4 px-6 py-5 hover:bg-[#fbf9fa] transition-colors cursor-pointer group rounded"
                  >
                    <div className="col-span-2 flex items-center md:gap-0 bg-[#041627]/5 md:bg-transparent rounded px-2.5 py-1 md:p-0">
                      <span className="md:hidden text-[10px] font-bold text-[#74777d] uppercase tracking-wider mr-2">ID: </span>
                      <span className="font-mono text-xs font-bold text-[#041627] tracking-wider">{bill.id}</span>
                    </div>

                    <div className="col-span-4 flex flex-col justify-center">
                      <span className="text-sm font-bold text-[#1b1c1d]">{bill.customerName}</span>
                      <span className="text-xs text-[#74777d] mt-1 font-semibold">{bill.vehicleDetails.makeModel}</span>
                    </div>

                    <div className="col-span-2 flex items-center text-xs text-[#44474c] font-semibold mt-1 md:mt-0">
                      <span className="md:hidden text-[10px] font-bold text-[#74777d] uppercase tracking-wider mr-2">DATE: </span>
                      {bill.date}
                    </div>

                    <div className="col-span-2 flex items-center md:justify-end font-headline text-[#041627] font-bold text-sm">
                      <span className="md:hidden text-[10px] font-bold text-[#74777d] uppercase tracking-wider mr-2">TOTAL: </span>
                      ₹{bill.grandTotal.toLocaleString()}
                    </div>

                    <div className="col-span-2 flex items-center justify-between md:justify-center mt-2.5 md:mt-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider leading-relaxed ${
                        bill.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-3xs' 
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}>
                        {bill.status}
                      </span>
                      <ChevronRight className="md:hidden h-5 w-5 text-[#cbd5e1] group-hover:translate-x-1 transition-all" />
                      <div className="hidden md:block absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                        <ChevronRight className="h-5 w-5 text-[#041627]" />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredBills.length === 0 && (
                  <p className="text-center py-8 text-xs text-[#74777d]">No invoices found matching current sorting selectors.</p>
                )}
              </div>
            </div>

            {/* Pagination footnote */}
            <div className="flex justify-between items-center text-xs text-[#74777d] select-none">
              <span>Showing 1 to {filteredBills.length} of {filteredBills.length} invoices</span>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: OPERATING HOURS, CATEGORIES, SETTINGS PANEL */}
        {activeAdminTab === 'settings' && (
          <motion.div 
            key="admin-settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            
            {/* Owner Section Details */}
            <section className="bg-gradient-to-br from-[#041627] to-[#1a2b3c] relative overflow-hidden rounded-xl h-48 flex items-end p-6 md:p-8 text-white select-none shadow-sm">
              <div className="absolute inset-0 bg-linear-to-t from-[#041627] to-transparent opacity-60"></div>
              
              <button 
                onClick={handleOpenEditProfile}
                className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/25 hover:border-white/40 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Settings className="h-3.5 w-3.5" />
                Edit Profile
              </button>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white p-0.5 shadow-md">
                    <img 
                      alt="Owner Profile" 
                      className="w-full h-full rounded-full object-cover" 
                      src={currentUser?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAH_k5RpsHYaN-ADLvLbNrxsKyJns7MVQlyxu-6fJCCLg7n81eNOTDthJk1Byc8KlFSTqC6kkGv6_OnjIztb8TASc3BsizQ9JQK_eW6rDnst8Rihgw2uCD-Bbod29t4aJiJJ6TDvuDR9k9LFxrmTsVphstDFojgJ0kEI6kzJHQs2hD5J2ZkOtVhDJ6jqQduTjiiUsZwzv2kxhyek2u6PlDGf_jqxBSFgfVP4-iUmsSgsxhWQ7704rUpywSSLLPnGIeyr8dIacKFS70"}
                    />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="font-headline text-2xl font-bold leading-none">{currentUser?.name || "Alex Miller"}</h2>
                  <p className="text-[#8192a7] text-xs font-semibold mt-1.5 uppercase tracking-widest leading-none">{currentUser?.email || "alex.miller@cityautogarage.com"} • City Auto Garage</p>
                </div>
              </div>
            </section>

            {/* Bento Grid Settings Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
              
              {/* Business details bento */}
              <div className="bg-white p-6 rounded-xl border border-[#c4c6cd]/55 shadow-3xs border-l-4 border-l-[#041627] space-y-4">
                <div className="flex justify-between items-center border-b border-[#efedef] pb-2">
                  <h3 className="font-headline text-sm font-bold text-[#041627] uppercase tracking-wider">Business Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Workshop Address</label>
                    <p className="text-sm font-semibold text-[#1b1c1d] mt-1 leading-normal">
                      {currentUser?.address || "Plot 402, Industrial Estate, Sector 18, Gurugram, HR - 122015"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Phone Line</label>
                      <p className="text-sm font-semibold text-[#1b1c1d] mt-1">
                        {currentUser?.phone ? (currentUser.phone.startsWith('+91') || currentUser.phone.startsWith('091') ? currentUser.phone : `+91 ${currentUser.phone}`) : "+91 98765 43210"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">GSTIN RESOLVE</label>
                      <p className="font-mono text-xs font-extrabold text-[#1b1c1d] mt-1 tracking-wide">
                        {currentUser?.gstin || "07AAGCC8114K1Z1"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating details bento */}
              <div className="bg-white p-6 rounded-xl border border-[#c4c6cd]/55 shadow-3xs border-l-4 border-l-[#041627] space-y-4">
                <div className="flex justify-between items-center border-b border-[#efedef] pb-2">
                  <h3 className="font-headline text-sm font-bold text-[#041627] uppercase tracking-wider">Garage Operating Parameters</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Operating Hours</label>
                    <div className="mt-1 text-sm font-semibold text-[#1b1c1d]">
                      {currentUser?.operatingHours || "Monday - Saturday | 09:00 AM - 08:00 PM"}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Service Categories</label>
                      <button 
                        onClick={() => setShowAddCategoryModal(true)}
                        className="text-[#b6171e] hover:text-[#da3433] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                        Add Service
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {serviceCategories.map((cat) => (
                        <div 
                          key={cat}
                          className="px-3 py-1 bg-[#efedef] rounded-full text-[10px] font-extrabold text-[#041627] uppercase tracking-wider border border-[#c4c6cd]/40 flex items-center gap-1.5 transition-colors group"
                        >
                          <span>{cat}</span>
                          <button 
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-[#74777d] hover:text-[#b6171e] font-sans font-bold text-xs cursor-pointer inline-flex items-center justify-center w-3 h-3 hover:bg-black/10 rounded-full"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      {serviceCategories.length === 0 && (
                        <span className="text-xs text-[#74777d] italic">No active categories.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security bento */}
              <div className="bg-white p-6 rounded-xl border border-[#c4c6cd]/55 shadow-3xs border-l-4 border-l-[#041627] space-y-4">
                <div className="flex justify-between items-center border-b border-[#efedef] pb-2">
                  <h3 className="font-headline text-sm font-bold text-[#041627] uppercase tracking-wider">Security Controls</h3>
                </div>
                <div className="divide-y divide-[#efedef]">
                  <button className="w-full flex justify-between items-center py-2.5 hover:text-[#041627] font-semibold text-sm transition-colors text-left">
                    <span>Change Portal Password</span>
                    <span>&gt;</span>
                  </button>
                  <button className="w-full flex justify-between items-center py-2.5 hover:text-[#041627] font-semibold text-sm transition-colors text-left">
                    <span>Configure Access Auditing</span>
                    <span>&gt;</span>
                  </button>
                </div>
              </div>

              {/* End session logout bento */}
              <div className="bg-[#f5f3f4]/70 p-6 rounded-xl border border-[#b6171e]/30 border-l-4 border-l-[#b6171e] flex flex-col justify-between h-full hover:shadow-xs transition-shadow">
                <div>
                  <h3 className="font-headline text-base font-bold text-[#b6171e]">End Session</h3>
                  <p className="text-xs text-[#44474c] mt-1.5 leading-relaxed font-semibold">
                    Sign out of administrative database panel and flush all local browser cached logs secure.
                  </p>
                </div>
                <button 
                  onClick={logout}
                  className="mt-6 w-full py-3 bg-[#b6171e] hover:bg-[#da3433] text-white rounded-lg font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm transition-all focus:ring-2 focus:ring-[#ffdad6]"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Logout Session
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 5: SERVICE ENTRY / CREATE BILL INTERFACE */}
        {activeAdminTab === 'new-bill' && (
          <motion.div 
            key="admin-new-bill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#041627]">Invoice Draft Room</h2>
              <p className="text-[#44474c] text-xs mt-0.5">Quickly key in diagnostics, parts pricing, or labor categories for a resolved checkout ticket.</p>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left column form */}
              <form onSubmit={handleGenerateInvoice} className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Select Client or Customer Details */}
                <div className="bg-white p-5 rounded-xl border border-[#cbd5e1]/50 shadow-3xs space-y-4">
                  <h3 className="font-headline text-xs font-extrabold text-[#041627] uppercase tracking-widest border-b border-[#efedef] pb-2">Client parameters</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Select Owner</label>
                        <button 
                          type="button"
                          onClick={() => setShowAddCustomerModal(true)}
                          className="text-[#b6171e] text-[10px] font-bold hover:underline uppercase tracking-wider"
                        >
                          + New Customer
                        </button>
                      </div>
                      <select 
                        required
                        value={draftCustomerId}
                        onChange={(e) => {
                          setDraftCustomerId(e.target.value);
                          // Reset vehicle
                          const ownedVehicles = vehicles.filter(v => v.ownerId === e.target.value);
                          setDraftVehicleId(ownedVehicles.length > 0 ? ownedVehicles[0].id : '');
                        }}
                        className="w-full p-2.5 bg-[#f5f3f4] border border-[#cbd5e1] rounded text-[#1b1c1d] focus:bg-white text-sm"
                      >
                        <option value="">-- Choose Client Profile --</option>
                        {users.filter(u => !u.isAdmin).map(u => (
                          <option key={u.id} value={u.id}>{u.name} (+91 {u.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider mb-1">Select Car</label>
                      <select 
                        required
                        value={draftVehicleId}
                        onChange={(e) => setDraftVehicleId(e.target.value)}
                        className="w-full p-2.5 bg-[#f5f3f4] border border-[#cbd5e1] rounded text-[#1b1c1d] focus:bg-white text-sm"
                      >
                        <option value="">-- Choose Car Details --</option>
                        {vehicles.filter(v => v.ownerId === draftCustomerId).map(v => (
                          <option key={v.id} value={v.id}>{v.makeModel} ({v.plateNumber})</option>
                        ))}
                        {draftCustomerId && vehicles.filter(v => v.ownerId === draftCustomerId).length === 0 && (
                          <option value="none">General Appointment (No Vehicle)</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Entry addition Form */}
                <div className="bg-white p-5 rounded-xl border border-[#cbd5e1]/50 shadow-3xs space-y-4">
                  <h3 className="font-headline text-xs font-extrabold text-[#041627] uppercase tracking-widest border-b border-[#efedef] pb-2">Line-Item additions</h3>

                  <div className="space-y-4 animate-scale-up">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Item / Service Name</label>
                      <input 
                        type="text" 
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g. Synthetic Engine Oil Swap"
                        className="w-full p-2.5 bg-[#f5f3f4] border border-[#cbd5e1] rounded text-sm focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider mb-1">Category</label>
                        <select 
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value as 'Parts' | 'Labour')}
                          className="w-full p-2.5 bg-[#f5f3f4] border border-[#cbd5e1] rounded text-sm focus:bg-white"
                        >
                          <option value="Parts">Parts</option>
                          <option value="Labour">Labour</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Quantity / Volume</label>
                        <input 
                          type="text" 
                          value={itemQty}
                          onChange={(e) => setItemQty(e.target.value)}
                          placeholder="e.g. 4.5 or 1"
                          className="w-full p-2.5 bg-[#f5f3f4] border border-[#cbd5e1] rounded text-sm focus:outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#74777d] uppercase tracking-wider">Rate Cost (Per Unit)</label>
                      <input 
                        type="number" 
                        value={itemRate}
                        onChange={(e) => setItemRate(e.target.value)}
                        placeholder="e.g. 850"
                        className="w-full p-2.5 bg-[#f5f3f4] border border-[#cbd5e1] rounded text-sm focus:outline-none focus:bg-white"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddItemToDraft}
                      className="w-full py-3 bg-[#b6171e] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#da3433] select-none transition-all"
                    >
                      + Add to Invoice
                    </button>
                  </div>
                </div>

              </form>

              {/* Right column running draft */}
              <div className="lg:col-span-7 flex flex-col justify-start">
                <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-md flex flex-col justify-between h-full min-h-[500px]">
                  
                  {/* Draft Header */}
                  <div className="px-5 py-4 border-b border-[#c4c6cd]/50 bg-[#f5f3f4]/70 select-none flex justify-between items-center">
                    <div>
                      <h3 className="font-headline text-[#041627] font-bold text-sm uppercase tracking-wider">Running Invoices draft</h3>
                      <p className="text-xs text-[#74777d] leading-none mt-1">Status: Drafting invoice</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-800 text-[9px] font-bold tracking-widest uppercase border border-yellow-300 rounded-full">Drafting</span>
                  </div>

                  {/* Added Draft list entries */}
                  <div className="p-4 flex-grow overflow-y-auto space-y-3 font-body">
                    {draftItems.map(it => (
                      <div key={it.id} className="p-3 bg-[#f5f3f4] border-l-4 border-l-[#041627] rounded flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-[#041627]">{it.name} <span className="text-[8px] tracking-widest uppercase font-bold text-white px-2 py-0.5 bg-[#041627] rounded ml-1.5">{it.category}</span></p>
                          <p className="text-xs mt-0.5 text-[#44474c] font-semibold">{it.qty} unit{parseFloat(it.qty as string) !== 1 && 's'} x ₹{it.rate.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-mono text-sm text-[#041627] font-extrabold">₹{it.total.toLocaleString()}</p>
                          <button 
                            type="button"
                            onClick={() => handleRemoveItemFromDraft(it.id)}
                            className="p-1 hover:bg-[#ffdad6] text-[#b6171e] rounded"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {draftItems.length === 0 && (
                      <div className="p-10 text-[#74777d] text-center flex flex-col items-center justify-center h-full opacity-60">
                        <FileText className="h-10 w-10 stroke-[1.5] mb-2" />
                        <p className="text-xs font-bold">Invoices Summary is empty.</p>
                        <p className="text-xs text-[#44474c] mt-0.5">Please add labor services or replacement parts from the left menu.</p>
                      </div>
                    )}
                  </div>

                  {/* Notes remark input and totals checkout */}
                  <div className="p-5 border-t border-[#c4c6cd] bg-[#f5f3f4]/70 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-[#74777d] uppercase tracking-wider mb-1">Notes / Remark recommendation</label>
                      <input 
                        type="text" 
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder="Next service details recommendation..."
                        className="w-full px-3 py-2 bg-white border border-[#c4c6cd] rounded text-xs focus:outline-none"
                      />
                    </div>

                    <div className="border-t border-[#c4c6cd]/55 pt-3.5 space-y-1.5 text-xs text-[#44474c] font-semibold leading-relaxed">
                      <div className="flex justify-between">
                        <span>Parts &amp; Labour Subtotal</span>
                        <span className="font-mono text-sm text-[#1b1c1d]">₹{draftSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (0%)</span>
                        <span className="font-mono text-sm text-[#1b1c1d]">₹{draftTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#c4c6cd] pt-2.5 font-headline font-bold text-sm text-[#041627]">
                        <span>GRAND TOTAL RESOLVE</span>
                        <span>₹{draftTotalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3 select-none">
                      <button 
                        type="button"
                        onClick={() => {
                          setDraftCustomerId('');
                          setDraftVehicleId('');
                          setDraftItems([]);
                        }}
                        className="flex-1 py-3 border border-[#c4c6cd] hover:bg-white font-headline text-xs font-bold uppercase tracking-widest text-[#44474c] hover:text-[#041627] rounded-lg transition-colors text-center"
                      >
                        Reset
                      </button>
                      <button 
                        type="button"
                        disabled={draftItems.length === 0 || !draftCustomerId}
                        onClick={handleGenerateInvoice}
                        className="flex-1 py-3 bg-[#041627] text-white font-headline text-xs font-bold uppercase tracking-widest hover:bg-[#1a2b3c] rounded-lg transition-colors select-none text-center shadow-xs disabled:opacity-75"
                      >
                        Generate Invoice
                      </button>
                    </div>

                  </div>

                </div>
              </div>

            </section>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAVIGATION DRAWERS BAR */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-2 bg-white border-t border-[#c4c6cd]/50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] md:hidden">
        <button 
          onClick={() => { setActiveAdminTab('dashboard'); setSelectedBillId(null); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeAdminTab === 'dashboard' 
              ? 'text-[#041627] font-bold' 
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-headline text-[10px] uppercase font-bold tracking-wider leading-none mt-1 select-none">Dashboard</span>
        </button>

        <button 
          onClick={() => { setActiveAdminTab('customers'); setSelectedBillId(null); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeAdminTab === 'customers' 
              ? 'text-[#041627] font-bold' 
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="font-headline text-[10px] uppercase font-bold tracking-wider leading-none mt-1 select-none">Clients</span>
        </button>

        <button 
          onClick={() => { setActiveAdminTab('bills'); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeAdminTab === 'bills' 
              ? 'text-[#041627] font-bold' 
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <Receipt className="h-5 w-5" />
          <span className="font-headline text-[10px] uppercase font-bold tracking-wider leading-none mt-1 select-none">Bills</span>
        </button>

        <button 
          onClick={() => { setActiveAdminTab('settings'); setSelectedBillId(null); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeAdminTab === 'settings' 
              ? 'text-[#041627] font-bold' 
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="font-headline text-[10px] uppercase font-bold tracking-wider leading-none mt-1 select-none">Settings</span>
        </button>
      </nav>

      {/* NEW CUSTOMER OVERLAY MODAL */}
      <AnimatePresence>
        {showAddCustomerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#041627]/60 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="bg-white rounded-xl border border-[#cbd5e1] p-6 max-w-sm w-full relative shadow-2xl select-none"
            >
              <h3 className="font-headline text-lg font-bold text-[#041627] mb-5 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#b6171e]" />
                Add Customer Profile
              </h3>

              <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-2xs font-extrabold text-[#74777d] uppercase tracking-wider">Customer Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-2xs font-extrabold text-[#74777d] uppercase tracking-wider">Mobile Number</label>
                  <div className="flex items-center bg-[#f5f3f4] border border-[#cbd5e1] rounded focus-within:bg-white focus-within:border-black transition-all">
                    <span className="pl-3 pr-1 text-sm font-semibold text-[#44474c]">+91</span>
                    <input 
                      type="tel" 
                      required
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="90000 12345"
                      className="w-full py-2 px-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 flex-row-reverse">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2.5 bg-[#041627] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1a2b3c] transition-all cursor-pointer"
                  >
                    Create
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddCustomerModal(false)}
                    className="flex-1 py-2.5 bg-transparent border border-[#cbd5e1] text-[#44474c] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f5f3f4] transition-all cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT PERSONAL PROFILE MODAL */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#041627]/60 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="bg-white rounded-xl border border-[#cbd5e1] p-6 max-w-md w-full relative shadow-2xl select-none max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-headline text-lg font-bold text-[#041627] mb-5 flex items-center gap-2 border-b border-[#efedef] pb-3">
                <Settings className="h-5 w-5 text-[#b6171e]" />
                Edit Owner & Workshop Settings
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">Owner name</label>
                  <input 
                    type="text" 
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    placeholder="Alex Miller"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">Owner email / credentials</label>
                  <input 
                    type="email" 
                    required
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    placeholder="alex.miller@cityautogarage.com"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">Hotline Number</label>
                  <input 
                    type="text" 
                    required
                    value={editOwnerPhone}
                    onChange={(e) => setEditOwnerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">Workshop Location / Address</label>
                  <textarea 
                    rows={2}
                    required
                    value={editOwnerAddress}
                    onChange={(e) => setEditOwnerAddress(e.target.value)}
                    placeholder="Plot 402, Industrial Estate, Gurugram"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">GSTIN RESOLVE</label>
                  <input 
                    type="text" 
                    required
                    value={editGstin}
                    onChange={(e) => setEditGstin(e.target.value)}
                    placeholder="07AAGCC8114K1Z1"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-mono text-sm uppercase focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">Operating Parameters (Hours)</label>
                  <input 
                    type="text" 
                    required
                    value={editOperatingHours}
                    onChange={(e) => setEditOperatingHours(e.target.value)}
                    placeholder="Monday - Saturday | 09:00 AM - 08:00 PM"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-[#74777d] uppercase tracking-wider">Profile Avatar Image Link</label>
                  <input 
                    type="text" 
                    required
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    placeholder="HTTPS Image URL"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-3 flex-row-reverse border-t border-[#efedef]">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2.5 bg-[#041627] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1a2b3c] transition-all cursor-pointer"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2.5 bg-transparent border border-[#cbd5e1] text-[#44474c] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f5f3f4] transition-all cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD SERVICE CATEGORY MODAL */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#041627]/60 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="bg-white rounded-xl border border-[#cbd5e1] p-6 max-w-sm w-full relative shadow-2xl select-none"
            >
              <h3 className="font-headline text-lg font-bold text-[#041627] mb-5 flex items-center gap-2 border-b border-[#efedef] pb-3">
                <Wrench className="h-5 w-5 text-[#b6171e]" />
                Add Service Category
              </h3>

              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-2xs font-extrabold text-[#74777d] uppercase tracking-wider text-left">Category / Service Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Wheel Alignment, Brake Swap"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#cbd5e1] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-3 flex-row-reverse border-t border-[#efedef]">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2.5 bg-[#041627] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1a2b3c] transition-all cursor-pointer"
                  >
                    Add Target
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowAddCategoryModal(false);
                      setNewCategoryName('');
                    }}
                    className="flex-1 py-2.5 bg-transparent border border-[#cbd5e1] text-[#44474c] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f5f3f4] transition-all cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
