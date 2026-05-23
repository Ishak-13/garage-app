/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGarage } from '../context/GarageContext';
import { 
  Car, Hash, Gauge, LogOut, Award, User, Clock, CheckCircle, 
  ChevronRight, Plus, Receipt, Bell, ShieldAlert, BadgeCheck, Mail, MapPin, Edit3 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CustomerDashboard: React.FC = () => {
  const { 
    currentUser, vehicles, activeServices, bills, logout, addVehicle, updateProfile, 
    setSelectedBillId, activeCustomerTab, setActiveCustomerTab 
  } = useGarage();

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  
  // New vehicle state
  const [newMake, setNewMake] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newOdo, setNewOdo] = useState('');

  // Editable Profile fields
  const [profName, setProfName] = useState(currentUser?.name || '');
  const [profPhone, setProfPhone] = useState(currentUser?.phone || '');
  const [profEmail, setProfEmail] = useState(currentUser?.email || '');
  const [profAddress, setProfAddress] = useState(currentUser?.address || '');
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  if (!currentUser) return null;

  // Filter components owned by user
  const userVehicles = vehicles.filter(v => v.ownerId === currentUser.id);
  const userBills = bills.filter(b => b.customerId === currentUser.id || b.customerPhone === currentUser.phone);
  const activeService = activeServices.find(s => userVehicles.some(v => v.id === s.vehicleId));

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMake || !newPlate) return;
    
    addVehicle(currentUser.id, newMake, newPlate, 0);
    setNewMake('');
    setNewPlate('');
    setNewOdo('');
    setShowAddVehicleModal(false);
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profName, profEmail, profPhone, profAddress);
    setShowProfileSuccess(true);
    setTimeout(() => setShowProfileSuccess(false), 3000);
  };

  return (
    <div className="bg-[#fbf9fa] text-[#1b1c1d] min-h-screen pb-24 font-body antialiased selection:bg-[#cbd5e1] flex flex-col">
      {/* Top Application header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#c4c6cd]/50 h-16 shadow-xs select-none">
        <div className="flex justify-between items-center px-4 md:px-6 w-full max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#efedef] rounded-lg">
              <Car className="text-[#041627] h-5 w-5 stroke-[2]" />
            </span>
            <h1 className="font-headline text-lg font-bold text-[#041627] tracking-tight">
              {activeCustomerTab === 'dashboard' ? 'City Auto Garage' : activeCustomerTab === 'profile' ? 'My Profile' : 'My Invoices'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#efedef] rounded-full text-[#44474c] hover:text-[#041627] transition-all relative">
              <Bell className="h-5 w-5" />
              {activeService && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#b6171e]"></span>
              )}
            </button>
            <div className="w-10 h-10 rounded-full bg-[#d2e4fb] overflow-hidden border border-[#c4c6cd]/60 select-none">
              <img 
                alt="Member Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAb-Cl6uY93MaCfMDpwLf0oUEIm7R0_19szrSnQKdqllaYZktE7kcmNlMG04BB6PWywqu6Fvcl-TprE7te3VVXL41QiOChd5md7OB1fvI1mTeveKbwL-WsFpQBd28nQXbgDM2jRBPOjUpBl72RTp9PP-bHsPojJZMd3U8habl3vB3omxFlkB0OXyI1pesvHTZJ9-oLComtfd0Yjt83Rdmc4UJWg3cJO6u_Nh_esjCI7ziPJit9N6ZQ5nU2XUgXWLVYncJ5yNGQAIE"
              />
            </div>
            <button 
              onClick={logout} 
              title="Logout"
              className="p-2 hover:bg-[#ffdad6] text-[#b6171e] hover:text-[#da3433] rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 px-4 md:px-6 max-w-5xl w-full mx-auto flex-grow flex flex-col justify-start">
        <AnimatePresence mode="wait">
        {/* TAB 1: DASHBOARD VIEW */}
        {activeCustomerTab === 'dashboard' && (
          <motion.div 
            key="cust-dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6 mt-4"
          >
            {/* Greetings Banner */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="font-headline text-[10px] font-bold text-[#041627] tracking-widest uppercase mb-1">
                  DASHBOARD OVERVIEW
                </p>
                <h2 className="font-headline text-2xl font-bold text-[#1b1c1d]">
                  Welcome back, {currentUser.name.split(' ')[0]}
                </h2>
              </div>
              <div className="bg-white border border-[#c4c6cd]/50 rounded-xl p-4 flex items-center gap-4 shadow-[0_2px_4px_rgba(26,43,60,0.04)]">
                <div className="p-3 bg-[#feddb5] rounded-lg text-[#281802]">
                  <Award className="h-6 w-6 stroke-[2]" />
                </div>
                <div>
                  <p className="font-headline text-[10px] font-bold text-[#44474c] tracking-widest uppercase leading-none">
                    LOYALTY POINTS
                  </p>
                  <p className="font-headline text-2xl font-bold text-[#041627] mt-1 leading-none">
                    {currentUser.loyaltyPoints.toLocaleString()}{' '}
                    <span className="font-body text-xs font-normal text-[#44474c]">pts</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Live Service Status */}
            {activeService ? (
              <section className="bg-white border border-[#c4c6cd]/50 rounded-xl p-6 shadow-[0_2px_4px_rgba(26,43,60,0.04)] border-l-4 border-l-[#041627] relative overflow-hidden">
                <div className="absolute top-4 right-4 animate-pulse select-none">
                  <span className="px-3 py-1 bg-[#da3433] text-white text-[10px] font-bold tracking-widest rounded-full uppercase">
                    LIVE STATUS
                  </span>
                </div>
                <div className="flex flex-col h-full max-w-lg">
                  <div className="mb-6">
                    <h3 className="font-headline text-lg font-bold text-[#1b1c1d] mb-1.5">
                      {activeService.serviceName}
                    </h3>
                    <p className="text-[#44474c] flex items-center gap-1.5 text-sm font-semibold">
                      <Car className="h-4 w-4" />
                      {activeService.vehicleName} ({activeService.plateNumber})
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2.5">
                      <div>
                        <p className="font-headline text-xs font-bold text-[#041627] uppercase tracking-wider leading-none mb-1">
                          IN PROGRESS
                        </p>
                        <p className="text-xs text-[#44474c] leading-none">
                          Estimated completion: {activeService.estimatedCompletion}
                        </p>
                      </div>
                      <span className="font-headline text-xl font-bold text-[#041627] leading-none">{activeService.progress}%</span>
                    </div>
                    {/* Visual Progress Bar Shimmer */}
                    <div className="w-full bg-[#efedef] h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#041627] h-full rounded-full relative transition-all duration-500 ease-out"
                        style={{ width: `${activeService.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite_linear] bg-[length:200%_100%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-white border border-[#c4c6cd]/40 border-dashed rounded-xl p-6 text-center text-[#74777d]">
                <Clock className="h-8 w-8 mx-auto stroke-[1.5] mb-2 text-[#cbd5e1]" />
                <p className="text-sm font-bold">No active service appointments running right now.</p>
                <p className="text-xs mt-1 text-[#44474c]">Pull in any registered vehicle to initiate diagnostics.</p>
              </section>
            )}

            {/* Registered Vehicles View */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-[#1b1c1d]">My Vehicles</h3>
                <button 
                  onClick={() => setShowAddVehicleModal(true)}
                  className="text-[#041627] font-headline text-xs font-bold flex items-center gap-1 uppercase tracking-wider hover:underline"
                >
                  ADD NEW <Plus className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-[#cbd5e1] scrollbar-track-transparent">
                {userVehicles.map((vehicle, idx) => {
                  const isPrimaryGrad = vehicle.isPrimary;
                  return (
                    <div 
                      key={vehicle.id}
                      className={`flex-none w-72 p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] relative overflow-hidden group border ${
                        isPrimaryGrad 
                          ? 'bg-gradient-to-br from-[#041627] to-[#1a2b3c] text-white border-transparent' 
                          : 'bg-white border-[#c4c6cd]/50 text-[#1b1c1d] hover:border-[#041627] transition-all'
                      }`}
                    >
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                          <p className={`font-headline text-[9px] font-bold uppercase tracking-widest ${isPrimaryGrad ? 'text-white/60' : 'text-[#44474c]'}`}>
                            {vehicle.isPrimary ? 'PRIMARY VEHICLE' : (vehicle.type || 'VEHICLE').toUpperCase()}
                          </p>
                          <h4 className="font-headline text-lg font-bold mt-1.5">{vehicle.makeModel}</h4>
                        </div>
                        <div className="mt-8">
                          <div className={`rounded-lg p-2.5 inline-block ${isPrimaryGrad ? 'bg-white/10' : 'bg-[#f5f3f4] border border-[#cbd5e1]'}`}>
                            <p className={`text-[8px] font-headline font-bold leading-none uppercase ${isPrimaryGrad ? 'text-white/50' : 'text-[#44474c]/80'}`}>PLATE NUMBER</p>
                            <p className="font-headline font-semibold text-sm tracking-wider mt-1">{vehicle.plateNumber}</p>
                          </div>
                        </div>
                      </div>
                      <Car className={`absolute -bottom-4 -right-4 h-28 w-28 opacity-[0.06] transform rotate-12 transition-transform duration-500 group-hover:rotate-0 ${isPrimaryGrad ? 'text-white' : 'text-[#041627]'}`} />
                    </div>
                  );
                })}

                <div 
                  onClick={() => setShowAddVehicleModal(true)}
                  className="flex-none w-48 border-2 border-dashed border-[#c4c6cd]/80 hover:border-[#041627] hover:bg-[#f5f3f4]/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer text-[#44474c] hover:text-[#041627] transition-all"
                >
                  <Plus className="h-8 w-8 stroke-[1.8]" />
                  <span className="font-headline text-xs font-bold uppercase tracking-wider">REGISTER CAR</span>
                </div>
              </div>
            </section>

            {/* Recent Services */}
            <section className="bg-white border border-[#c4c6cd]/55 rounded-xl p-6 shadow-xs">
              <h3 className="font-headline text-lg font-bold text-[#1b1c1d] mb-5">Recent Service Histology</h3>
              {userBills.length > 0 ? (
                <div className="space-y-4">
                  {userBills.slice(0, 3).map((bill) => (
                    <div 
                      key={bill.id} 
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-lg bg-[#f5f3f4]/70 border border-[#c4c6cd]/30"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-white rounded-lg border border-[#c4c6cd]/40 flex items-center justify-center shadow-xs text-[#041627] shrink-0">
                          <Receipt className="h-6 w-6 stroke-[1.8]" />
                        </div>
                        <div>
                          <h4 className="font-headline text-sm font-bold text-[#1b1c1d]">
                            {bill.items[0]?.name || 'Standard Workshop Service'}
                          </h4>
                          <p className="text-xs text-[#44474c] mt-0.5 font-medium">
                            {bill.date} • ID: {bill.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-[#c4c6cd]/30 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] font-bold text-[#74777d] tracking-wider uppercase">COST</p>
                          <p className="font-headline text-base font-bold text-[#041627] mt-0.5">
                            ₹{bill.grandTotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            bill.status === 'Paid' 
                              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' 
                              : 'bg-[#ffdad6] border border-[#ffdad6] text-[#ba1a1a]'
                          }`}>
                            {bill.status === 'Paid' ? '✓ Completed' : 'Pending'}
                          </span>
                          <button 
                            onClick={() => {
                              setSelectedBillId(bill.id);
                              setActiveCustomerTab('bills');
                            }}
                            className="p-1.5 border border-[#cbd5e1] rounded-lg hover:bg-white text-[#041627] hover:border-[#041627] transition-all"
                            title="View Invoice Detail"
                          >
                            <Receipt className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#74777d] text-center py-4">No service history bills recorded yet.</p>
              )}
            </section>
          </motion.div>
        )}

        {/* TAB 2: PROFILE VIEW */}
        {activeCustomerTab === 'profile' && (
          <motion.div 
            key="cust-profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6 mt-4"
          >
            
            {/* Top User Header Section */}
            <section className="p-6 flex flex-col items-center gap-4 bg-[#f5f3f4] border border-[#c4c6cd]/40 rounded-xl relative overflow-hidden">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#041627] p-0.5 bg-white overflow-hidden shadow-md">
                  <img 
                    alt="Miller"
                    className="w-full h-full rounded-full object-cover select-none"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH_k5RpsHYaN-ADLvLbNrxsKyJns7MVQlyxu-6fJCCLg7n81eNOTDthJk1Byc8KlFSTqC6kkGv6_OnjIztb8TASc3BsizQ9JQK_eW6rDnst8Rihgw2uCD-Bbod29t4aJiJJ6TDvuDR9k9LFxrmTsVphstDFojgJ0kEI6kzJHQs2hD5J2ZkOtVhDJ6jqQduTjiiUsZwzv2kxhyek2u6PlDGf_jqxBSFgfVP4-iUmsSgsxhWQ7704rUpywSSLLPnGIeyr8dIacKFS70"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-[#041627] text-white p-1 rounded-full border-2 border-white flex items-center justify-center">
                  <BadgeCheck className="h-4.5 w-4.5 text-emerald-400" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-headline text-2xl font-bold text-[#1b1c1d]">{currentUser.name}</h2>
                <span className="inline-block mt-1.5 px-3 py-0.5 bg-[#b6171e]/10 text-[#b6171e] border border-[#b6171e]/20 rounded-full font-headline text-[10px] font-bold uppercase tracking-wider">
                  MEMBER SINCE {currentUser.memberSince || '2023'}
                </span>
              </div>
            </section>

            {/* Editable Details Form */}
            <section className="bg-white p-6 border border-[#c4c6cd]/50 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 mb-6 border-b border-[#efedef] pb-3">
                <User className="h-5 w-5 text-[#041627]" />
                <h3 className="font-headline text-lg font-bold text-[#041627]">Personal Details</h3>
              </div>

              {showProfileSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Your profile has been saved successfully.
                </div>
              )}

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-headline text-[10px] font-bold text-[#44474c] block uppercase tracking-widest">
                    FullName
                  </label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full h-11 px-4 border border-[#c4c6cd] rounded-lg focus:border-[#041627] focus:ring-1 focus:ring-[#041627] bg-white transition-all text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-headline text-[10px] font-bold text-[#44474c] block uppercase tracking-widest">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full h-11 px-4 border border-[#c4c6cd] rounded-lg focus:border-[#041627] focus:ring-1 focus:ring-[#041627] bg-white transition-all text-sm outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-headline text-[10px] font-bold text-[#44474c] block uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      className="w-full h-11 px-4 border border-[#c4c6cd] rounded-lg focus:border-[#041627] focus:ring-1 focus:ring-[#041627] bg-white transition-all text-sm outline-none"
                    />
                  </div>
                </div>



                <button
                  type="submit"
                  className="w-full h-12 bg-[#041627] text-white font-headline text-xs font-bold rounded-lg uppercase tracking-widest transition-all hover:bg-[#1a2b3c] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <BadgeCheck className="h-4.5 w-4.5" />
                  Update Profile
                </button>
              </form>
            </section>

            {/* Profile Vehicles Panel */}
            <section className="bg-white p-6 border border-[#c4c6cd]/50 rounded-xl shadow-xs">
              <div className="flex justify-between items-center mb-4 border-b border-[#efedef] pb-3">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#041627]" />
                  <h3 className="font-headline text-lg font-bold text-[#041627]">My Vehicles</h3>
                </div>
                <span className="text-[#44474c] font-headline text-2xs font-extrabold bg-[#efedef] px-2.5 py-1 rounded-full">{userVehicles.length} Registered</span>
              </div>

              <div className="space-y-3">
                {userVehicles.map(vehicle => (
                  <div key={vehicle.id} className="p-4 border border-[#c4c6cd]/40 hover:border-[#041627] rounded-lg flex items-center justify-between border-l-4 border-l-[#041627] bg-[#fbf9fa] shadow-2xs transition-all">
                    <div className="min-w-0 pr-4">
                      <p className="font-headline text-sm font-bold text-[#041627] truncate">{vehicle.makeModel}</p>
                      <p className="font-mono text-xs text-[#74777d] uppercase mt-1 tracking-wider">{vehicle.plateNumber}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {vehicle.isPrimary && (
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-300">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowAddVehicleModal(true)}
                className="mt-4 w-full h-11 border-2 border-dashed border-[#c4c6cd] hover:border-[#041627] hover:bg-[#fbf9fa] text-[#041627] font-headline text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="h-4.5 w-4.5" />
                ADD NEW VEHICLE
              </button>
            </section>
          </motion.div>
        )}

        {/* TAB 3: BILLS HISTORY */}
        {activeCustomerTab === 'bills' && (
          <motion.div 
            key="cust-bills"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="space-y-6 mt-4 select-none"
          >
            {userBills.length > 0 ? (
              <div className="space-y-4">
                {userBills.map((bill) => (
                  <div 
                    key={bill.id}
                    onClick={() => setSelectedBillId(bill.id)}
                    className="p-5 bg-white border border-[#c4c6cd]/50 hover:border-[#041627] rounded-xl flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-all group"
                  >
                    <div>
                      <p className="font-mono font-bold text-sm text-[#041627]">{bill.id}</p>
                      <h4 className="font-headline text-base font-bold text-[#1b1c1d] mt-1.5">
                        {bill.items[0]?.name || 'Routine Diagnostics Repair'}
                      </h4>
                      <p className="text-xs text-[#44474c] mt-1 font-semibold flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-[#74777d]" />
                        {bill.date} • {bill.items.length} items
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        bill.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-[#ffdad6] text-[#ba1a1a] border-transparent'
                      }`}>
                        {bill.status}
                      </span>
                      <p className="font-headline text-[#041627] font-bold text-lg">
                        ₹{bill.grandTotal.toLocaleString()}
                      </p>
                      <span className="text-xs text-[#041627] font-bold flex items-center gap-0.5 group-hover:translate-x-1.5 transition-all">
                        View Invoice <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 bg-white border border-[#c4c6cd]/50 rounded-xl text-center text-[#74777d]">
                <Receipt className="h-10 w-10 mx-auto stroke-[1.5] text-[#cbd5e1] mb-2" />
                <p className="text-sm font-bold">No historic invoices resolved yet.</p>
                <p className="text-xs mt-1 text-[#44474c]">All service checkout bills will populate dynamically here.</p>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* FIXED MOBILE NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-2 bg-white border-t border-[#c4c6cd]/50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] selection:bg-transparent">
        <button 
          onClick={() => {
            setActiveCustomerTab('dashboard');
            setSelectedBillId(null);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeCustomerTab === 'dashboard' && !setSelectedBillId
              ? 'text-[#041627] font-bold'
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <Clock className={`h-5 w-5 ${activeCustomerTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="font-headline text-[10px] font-bold uppercase tracking-wider mt-1 leading-none select-none">Dashboard</span>
        </button>

        <button 
          onClick={() => {
            setActiveCustomerTab('profile');
            setSelectedBillId(null);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeCustomerTab === 'profile'
              ? 'text-[#041627] font-bold'
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <User className={`h-5 w-5 ${activeCustomerTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="font-headline text-[10px] font-bold uppercase tracking-wider mt-1 leading-none select-none">Profile</span>
        </button>

        <button 
          onClick={() => {
            setActiveCustomerTab('bills');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
            activeCustomerTab === 'bills'
              ? 'text-[#041627] font-bold'
              : 'text-[#74777d] hover:text-[#041627]'
          }`}
        >
          <Receipt className={`h-5 w-5 ${activeCustomerTab === 'bills' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="font-headline text-[10px] font-bold uppercase tracking-wider mt-1 leading-none select-none">Bills</span>
        </button>
      </nav>

      {/* REGISTER CAR MODAL (OVERLAY) */}
      <AnimatePresence>
        {showAddVehicleModal && (
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
              className="bg-white rounded-xl border border-[#c4c6cd] p-6 max-w-sm w-full relative shadow-2xl"
            >
              <h3 className="font-headline text-lg font-bold text-[#041627] mb-5 flex items-center gap-1.5 sm:gap-2">
                <Car className="h-5 w-5 stroke-[2] text-[#b6171e]" />
                Register New Car
              </h3>

              <form onSubmit={handleAddVehicleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-2xs font-extrabold text-[#74777d] uppercase tracking-wider">Make / Model</label>
                  <input 
                    type="text" 
                    required
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    placeholder="e.g. Toyota RAV4"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#c4c6cd] rounded font-body text-sm focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-2xs font-extrabold text-[#74777d] uppercase tracking-wider">Plate Number</label>
                  <input 
                    type="text" 
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="XYZ-4567"
                    className="w-full px-3 py-2 bg-[#f5f3f4] border border-[#c4c6cd] rounded font-body text-sm tracking-wider uppercase focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-3 flex-row-reverse">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2.5 bg-[#041627] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1a2b3c] transition-all cursor-pointer"
                  >
                    Register
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddVehicleModal(false)}
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

// Help helper icon component
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>
);
