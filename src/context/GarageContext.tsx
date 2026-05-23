/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vehicle, ActiveService, Bill, LineItem, GarageStats } from '../types';

interface GarageContextProps {
  users: User[];
  vehicles: Vehicle[];
  activeServices: ActiveService[];
  bills: Bill[];
  currentUser: User | null;
  isAdmin: boolean;
  stats: GarageStats;
  onboardingStep: number | null; // 1 | 2 | null
  selectedBillId: string | null;
  activeAdminTab: 'dashboard' | 'customers' | 'bills' | 'settings' | 'new-bill';
  activeCustomerTab: 'dashboard' | 'profile' | 'bills';
  loginCustomer: (phone: string) => boolean;
  registerCustomer: (name: string, phone: string) => User;
  loginAdmin: (phone: string) => boolean;
  logout: () => void;
  addVehicle: (ownerId: string, makeModel: string, plateNumber: string, odometer: number) => Vehicle;
  updateProfile: (name: string, email: string, phone: string, address: string, extra?: { gstin?: string; operatingHours?: string; avatarUrl?: string }) => void;
  addBill: (billData: Omit<Bill, 'id' | 'partsTotal' | 'laborTotal' | 'gst' | 'grandTotal'>) => Bill;
  updateBillStatus: (billId: string, status: 'Paid' | 'Pending' | 'Overdue') => void;
  deleteBill: (billId: string) => void;
  updateActiveServiceProgress: (serviceId: string, progress: number, status: 'Pending' | 'In Progress' | 'Completed') => void;
  addActiveService: (serviceData: Omit<ActiveService, 'id'>) => ActiveService;
  setOnboardingStep: (step: number | null) => void;
  setSelectedBillId: (id: string | null) => void;
  setActiveAdminTab: (tab: 'dashboard' | 'customers' | 'bills' | 'settings' | 'new-bill') => void;
  setActiveCustomerTab: (tab: 'dashboard' | 'profile' | 'bills') => void;
}

const GarageContext = createContext<GarageContextProps | undefined>(undefined);

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Alexander Miller',
    phone: '9876543210',
    email: 'alexander@example.com',
    address: 'Plot 402, Industrial Estate, Sector 18, Gurugram, HR - 122015',
    isAdmin: false,
    memberSince: '2023',
    loyaltyPoints: 2450
  },
  {
    id: 'usr-2',
    name: 'James Sullivan',
    phone: '5550123456',
    email: 'james@sullivan.com',
    address: '101 Pine Wood Street, Detroit, MI',
    isAdmin: false,
    memberSince: '2022',
    loyaltyPoints: 1200
  },
  {
    id: 'usr-3',
    name: 'Elena Martinez',
    phone: '5559876543',
    email: 'elena@martinez.com',
    address: '202 Austin Heights Blvd, Austin, TX',
    isAdmin: false,
    memberSince: '2023',
    loyaltyPoints: 850
  },
  {
    id: 'usr-4',
    name: 'Bradley Watson',
    phone: '5554433221',
    email: 'bradley@watson.com',
    address: '303 Alpine Ridge Apt 14, Seattle, WA',
    isAdmin: false,
    memberSince: '2021',
    loyaltyPoints: 3100
  },
  {
    id: 'usr-5',
    name: 'Linda Thompson',
    phone: '5551122334',
    email: 'linda@thompson.com',
    address: '404 Palm Tree Way, Miami, FL',
    isAdmin: false,
    memberSince: '2024',
    loyaltyPoints: 450
  },
  {
    id: 'usr-doe',
    name: 'John Doe',
    phone: '9000012345',
    email: 'customer.doe@example.com',
    address: '123 Meadow Parkway, Auto City, 560001',
    isAdmin: false,
    memberSince: '2024',
    loyaltyPoints: 680
  }
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    ownerId: 'usr-1',
    makeModel: 'Toyota Camry',
    plateNumber: 'ABC-1234',
    odometer: 42500,
    isPrimary: true,
    type: 'primary'
  },
  {
    id: 'veh-2',
    ownerId: 'usr-1',
    makeModel: 'Subaru Outback',
    plateNumber: 'XYZ-9876',
    odometer: 85400,
    isPrimary: false,
    type: 'station-wagon'
  },
  {
    id: 'veh-3',
    ownerId: 'usr-2',
    makeModel: 'Ford Explorer',
    plateNumber: 'JAS-5566',
    odometer: 92100,
    isPrimary: true,
    type: 'suv'
  },
  {
    id: 'veh-4',
    ownerId: 'usr-2',
    makeModel: 'Chevrolet Bolt EV',
    plateNumber: 'EV-7788',
    odometer: 15400,
    isPrimary: false,
    type: 'other'
  },
  {
    id: 'veh-5',
    ownerId: 'usr-3',
    makeModel: 'Tesla Model 3',
    plateNumber: 'ELT-9876',
    odometer: 28200,
    isPrimary: true,
    type: 'primary'
  },
  {
    id: 'veh-6',
    ownerId: 'usr-4',
    makeModel: 'BMW M3 G80',
    plateNumber: 'BMW-3333',
    odometer: 31500,
    isPrimary: true,
    type: 'primary'
  },
  {
    id: 'veh-7',
    ownerId: 'usr-4',
    makeModel: 'Honda Odyssey',
    plateNumber: 'FAM-4444',
    odometer: 112000,
    isPrimary: false,
    type: 'station-wagon'
  },
  {
    id: 'veh-8',
    ownerId: 'usr-4',
    makeModel: 'Mazda MX-5',
    plateNumber: 'FUN-5555',
    odometer: 24000,
    isPrimary: false,
    type: 'other'
  },
  {
    id: 'veh-9',
    ownerId: 'usr-5',
    makeModel: 'Jeep Wrangler',
    plateNumber: 'OFF-1122',
    odometer: 68100,
    isPrimary: true,
    type: 'suv'
  },
  {
    id: 'veh-doe',
    ownerId: 'usr-doe',
    makeModel: 'Toyota Camry 2021',
    plateNumber: 'KA 01 MG 2456',
    odometer: 42500,
    isPrimary: true,
    type: 'primary'
  }
];

const INITIAL_SERVICES: ActiveService[] = [
  {
    id: 'srv-1',
    vehicleId: 'veh-1',
    vehicleName: 'Toyota Camry',
    plateNumber: 'ABC-1234',
    serviceName: 'Brake Pad Cleaning',
    progress: 75,
    status: 'In Progress',
    estimatedCompletion: '2:30 PM Today',
    createdAt: '2026-05-23T05:00:00Z'
  }
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'CAG-2024-102',
    customerId: 'usr-1',
    customerName: 'Alexander Hamilton',
    customerPhone: '9876543210',
    customerEmail: 'alexander@example.com',
    vehicleDetails: { makeModel: '2018 BMW M4', plateNumber: 'Engine Tuning', odometer: 24000 },
    date: 'Oct 24, 2023',
    items: [
      { id: '1', name: 'Performance ECU Tune', category: 'Labour', qty: '1', rate: 1000, total: 1000 },
      { id: '2', name: 'High Flow Intake Parts', category: 'Parts', qty: '1', rate: 450, total: 450 }
    ],
    status: 'Paid',
    notes: 'Engine mapped perfectly. Checked with OBD2 diagnostics.',
    partsTotal: 450.0,
    laborTotal: 1000.0,
    gst: 0,
    grandTotal: 1450.0
  },
  {
    id: 'CAG-2024-101',
    customerId: 'usr-5',
    customerName: 'Sarah Connor',
    customerPhone: '5551122334',
    customerEmail: 'linda@thompson.com',
    vehicleDetails: { makeModel: '1984 Jeep Renegade', plateNumber: 'Brake Repair', odometer: 135000 },
    date: 'Oct 22, 2023',
    items: [
      { id: '1', name: 'Brake Caliper Assembly', category: 'Parts', qty: '2', rate: 221.07, total: 442.15 },
      { id: '2', name: 'Brake Bleeding & Labor', category: 'Labour', qty: '1', rate: 400.0, total: 400.0 }
    ],
    status: 'Pending',
    notes: 'Awaiting rear drum check confirmation from client.',
    partsTotal: 442.15,
    laborTotal: 400.0,
    gst: 0,
    grandTotal: 842.15
  },
  {
    id: 'CAG-2024-100',
    customerId: 'usr-3',
    customerName: 'Dominic Toretto',
    customerPhone: '5559876543',
    customerEmail: 'elena@martinez.com',
    vehicleDetails: { makeModel: '1970 Dodge Charger', plateNumber: 'Full Overhaul', odometer: 18000 },
    date: 'Oct 21, 2023',
    items: [
      { id: '1', name: 'Supercharger V8 Gasket Kit', category: 'Parts', qty: '1', rate: 2200, total: 2200 },
      { id: '2', name: 'Custom Blower Installation Labor', category: 'Labour', qty: '1', rate: 1000, total: 1000 }
    ],
    status: 'Paid',
    notes: 'Living life a quarter mile at a time. Supercharger boosts fine.',
    partsTotal: 2200.0,
    laborTotal: 1000.0,
    gst: 0,
    grandTotal: 3200.0
  },
  {
    id: 'CAG-2024-099',
    customerId: 'usr-4',
    customerName: 'Bruce Wayne',
    customerPhone: '5554433221',
    customerEmail: 'bradley@watson.com',
    vehicleDetails: { makeModel: 'Lamborghini Aventador', plateNumber: 'Detailing', odometer: 1200 },
    date: 'Oct 19, 2023',
    items: [
      { id: '1', name: 'Nanoskin Ceramic Coating Polish', category: 'Parts', qty: '1', rate: 120, total: 120 },
      { id: '2', name: 'Multi Stage Paint Correction Labor', category: 'Labour', qty: '1', rate: 1000, total: 1000 }
    ],
    status: 'Paid',
    notes: 'Delivered in Gotham Black shade. Kept inside secured bay.',
    partsTotal: 120.0,
    laborTotal: 1000.0,
    gst: 0,
    grandTotal: 1120.0
  },
  {
    id: 'INV-8821',
    customerId: 'usr-2',
    customerName: 'Robert Mitchell',
    customerPhone: '5550123456',
    customerEmail: 'james@sullivan.com',
    vehicleDetails: { makeModel: 'BMW X5', plateNumber: '2022', odometer: 32000 },
    date: 'Oct 24, 2024',
    items: [
      { id: '1', name: 'Genuine BMW Brake Pads', category: 'Parts', qty: '1', rate: 840, total: 840 },
      { id: '2', name: 'Technical Brake Swap Labor', category: 'Labour', qty: '1', rate: 400, total: 400 }
    ],
    status: 'Paid',
    notes: 'Replaced front pads. Cleaned wear sensor contacts.',
    partsTotal: 840.0,
    laborTotal: 400.0,
    gst: 0,
    grandTotal: 1240.0
  },
  {
    id: 'INV-8822',
    customerId: 'usr-2',
    customerName: 'Sarah Jenkins',
    customerPhone: '5550123456',
    customerEmail: 'james@sullivan.com',
    vehicleDetails: { makeModel: 'Audi A4', plateNumber: '2020', odometer: 45000 },
    date: 'Oct 23, 2024',
    items: [
      { id: '1', name: 'Air & Cabin Filters Combo Pack', category: 'Parts', qty: '1', rate: 150, total: 150 },
      { id: '2', name: 'Scheduled Maintenance Diagnostic inspection', category: 'Labour', qty: '1', rate: 300, total: 300 }
    ],
    status: 'Pending',
    notes: 'Filters ready. Client notified to pull in vehicle.',
    partsTotal: 150.0,
    laborTotal: 300.0,
    gst: 0,
    grandTotal: 450.0
  },
  {
    id: 'INV-8823',
    customerId: 'usr-4',
    customerName: 'David Thompson',
    customerPhone: '5554433221',
    customerEmail: 'bradley@watson.com',
    vehicleDetails: { makeModel: 'Ford F-150', plateNumber: '2021', odometer: 58000 },
    date: 'Oct 22, 2024',
    items: [
      { id: '1', name: 'Heavy Duty Suspension Struts Set', category: 'Parts', qty: '1', rate: 1500, total: 1500 },
      { id: '2', name: 'Rear Axle Alignment & Install', category: 'Labour', qty: '1', rate: 600, total: 600 }
    ],
    status: 'Paid',
    notes: 'Suspension feels extremely sturdy. Rigorous flex road tested.',
    partsTotal: 1500.0,
    laborTotal: 600.0,
    gst: 0,
    grandTotal: 2100.0
  },
  {
    id: 'INV-8824',
    customerId: 'usr-3',
    customerName: 'Elena Rodriguez',
    customerPhone: '5559876543',
    customerEmail: 'elena@martinez.com',
    vehicleDetails: { makeModel: 'Honda Civic', plateNumber: '2023', odometer: 11000 },
    date: 'Oct 21, 2024',
    items: [
      { id: '1', name: 'Engine Bay Coolant Flushing Kit', category: 'Parts', qty: '1', rate: 85, total: 85 },
      { id: '2', name: 'Direct Coolant Refill Labor', category: 'Labour', qty: '1', rate: 100, total: 100 }
    ],
    status: 'Pending',
    notes: 'Coolant flushed. Final pressure assessment remaining.',
    partsTotal: 85.0,
    laborTotal: 100.0,
    gst: 0,
    grandTotal: 185.0
  },
  {
    id: 'CAG-2024-892',
    customerId: 'usr-doe',
    customerName: 'John Doe',
    customerPhone: '9000012345',
    customerEmail: 'customer.doe@example.com',
    vehicleDetails: { makeModel: 'Toyota Camry 2021', plateNumber: 'KA 01 MG 2456', odometer: 42500 },
    date: 'October 24, 2024',
    items: [
      { id: 'b1', name: 'Engine Oil Replacement', category: 'Parts', qty: '4.5L', rate: 850, total: 3825 },
      { id: 'b2', name: 'Oil Filter', category: 'Parts', qty: '1', rate: 450, total: 450 },
      { id: 'b3', name: 'General Service Labor', category: 'Labour', qty: '-', rate: 1200, total: 1200 },
      { id: 'b4', name: 'Brake Pad Cleaning', category: 'Labour', qty: '-', rate: 800, total: 800 }
    ],
    status: 'Paid',
    notes: 'Next service recommended at 50,000 KM. Brake pads show 40% wear. Air filter cleaned but may need replacement in next cycle.',
    partsTotal: 4275.0,
    laborTotal: 2000.0,
    gst: 0,
    grandTotal: 6275.0
  }
];

export const GarageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cag_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('cag_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [activeServices, setActiveServices] = useState<ActiveService[]>(() => {
    const saved = localStorage.getItem('cag_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('cag_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cag_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem('cag_is_admin');
    return saved ? JSON.parse(saved) === 'true' : false;
  });

  const [onboardingStep, setOnboardingStepState] = useState<number | null>(() => {
    const saved = localStorage.getItem('cag_onboarding_step');
    return saved ? (saved === 'null' ? null : parseInt(saved, 10)) : null;
  });

  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'customers' | 'bills' | 'settings' | 'new-bill'>('dashboard');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'dashboard' | 'profile' | 'bills'>('dashboard');

  useEffect(() => {
    localStorage.setItem('cag_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cag_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('cag_services', JSON.stringify(activeServices));
  }, [activeServices]);

  useEffect(() => {
    localStorage.setItem('cag_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cag_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cag_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cag_is_admin', String(isAdmin));
  }, [isAdmin]);

  const setOnboardingStep = (step: number | null) => {
    setOnboardingStepState(step);
    localStorage.setItem('cag_onboarding_step', step === null ? 'null' : String(step));
  };

  const loginCustomer = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const user = users.find(u => u.phone.replace(/\D/g, '') === cleanPhone || (u.phone === '9876543210' && cleanPhone === '9876543210'));
    if (user) {
      setCurrentUser(user);
      setIsAdmin(false);
      // If user has no vehicles registered, prompt onboarding step 1
      const userVehicles = vehicles.filter(v => v.ownerId === user.id);
      if (userVehicles.length === 0) {
        setOnboardingStep(1);
      } else {
        setOnboardingStep(null);
      }
      return true;
    }
    return false;
  };

  const registerCustomer = (name: string, phone: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      phone: phone.replace(/\D/g, ''),
      email: '',
      address: '',
      isAdmin: false,
      memberSince: String(new Date().getFullYear()),
      loyaltyPoints: 100 // starting bonus
    };

    setUsers(prev => [...prev, newUser]);
    if (!isAdmin) {
      setCurrentUser(newUser);
      setIsAdmin(false);
      setOnboardingStep(1); // Go to step 1: add vehicle
    }
    return newUser;
  };

  const loginAdmin = (phone: string) => {
    // Registered admin numbers or any check
    const clean = phone.replace(/\D/g, '');
    if (clean === '9885376846' || clean === '9876543210' || clean === '123' || clean === '') {
      setIsAdmin(true);
      const isCustomAdmin = clean === '9885376846';
      setCurrentUser({
        id: 'admin-alex',
        name: 'Alex Miller',
        phone: isCustomAdmin ? '9885376846' : '9876543210',
        email: 'alex.miller@cityautogarage.com',
        address: 'Plot 402, Industrial Estate, Sector 18, Gurugram, HR - 122015',
        isAdmin: true,
        memberSince: '2020',
        loyaltyPoints: 0,
        gstin: '07AAGCC8114K1Z1',
        operatingHours: 'Monday - Saturday | 09:00 AM - 08:00 PM',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH_k5RpsHYaN-ADLvLbNrxsKyJns7MVQlyxu-6fJCCLg7n81eNOTDthJk1Byc8KlFSTqC6kkGv6_OnjIztb8TASc3BsizQ9JQK_eW6rDnst8Rihgw2uCD-Bbod29t4aJiJJ6TDvuDR9k9LFxrmTsVphstDFojgJ0kEI6kzJHQs2hD5J2ZkOtVhDJ6jqQduTjiiUsZwzv2kxhyek2u6PlDGf_jqxBSFgfVP4-iUmsSgsxhWQ7704rUpywSSLLPnGIeyr8dIacKFS70'
      });
      setOnboardingStep(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setOnboardingStep(null);
    setSelectedBillId(null);
  };

  const addVehicle = (ownerId: string, makeModel: string, plateNumber: string, odometer: number) => {
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      ownerId,
      makeModel,
      plateNumber: plateNumber.toUpperCase(),
      odometer,
      isPrimary: true, // Auto set as primary if first
      type: makeModel.toLowerCase().includes('outback') ? 'station-wagon' : (makeModel.toLowerCase().includes('f-150') || makeModel.toLowerCase().includes('wrangler') ? 'suv' : 'primary')
    };

    // Update isPrimary of others if needed
    setVehicles(prev => {
      const owned = prev.filter(v => v.ownerId === ownerId);
      if (owned.length > 0) {
        newVehicle.isPrimary = false;
      }
      return [...prev, newVehicle];
    });

    return newVehicle;
  };

  const updateProfile = (name: string, email: string, phone: string, address: string, extra?: { gstin?: string; operatingHours?: string; avatarUrl?: string }) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name,
      email,
      phone: phone.replace(/\D/g, ''),
      address,
      ...(extra || {})
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const addBill = (billData: Omit<Bill, 'id' | 'partsTotal' | 'laborTotal' | 'gst' | 'grandTotal'>) => {
    const partsTotal = billData.items
      .filter(item => item.category === 'Parts')
      .reduce((sum, item) => sum + item.total, 0);

    const laborTotal = billData.items
      .filter(item => item.category === 'Labour')
      .reduce((sum, item) => sum + item.total, 0);

    const subtotal = partsTotal + laborTotal;
    const gstValue = 0; // No GST is added to bills as requested
    const grandTotal = subtotal;

    const newBillId = `CAG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBill: Bill = {
      ...billData,
      id: newBillId,
      partsTotal,
      laborTotal,
      gst: parseFloat(gstValue.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2))
    };

    setBills(prev => [newBill, ...prev]);

    // Also update customer's loyalty points for support (e.g. 1 point for every $10 spent)
    const pointsEarned = Math.floor(grandTotal / 10);
    setUsers(prev => prev.map(u => {
      if (u.id === billData.customerId) {
        return {
          ...u,
          loyaltyPoints: u.loyaltyPoints + pointsEarned
        };
      }
      return u;
    }));

    return newBill;
  };

  const updateBillStatus = (billId: string, status: 'Paid' | 'Pending' | 'Overdue') => {
    setBills(prev => prev.map(b => b.id === billId ? { ...b, status } : b));
  };

  const deleteBill = (billId: string) => {
    setBills(prev => prev.filter(b => b.id !== billId));
  };

  const updateActiveServiceProgress = (serviceId: string, progress: number, status: 'Pending' | 'In Progress' | 'Completed') => {
    setActiveServices(prev => prev.map(s => s.id === serviceId ? { ...s, progress, status } : s));
  };

  const addActiveService = (serviceData: Omit<ActiveService, 'id'>) => {
    const newService: ActiveService = {
      ...serviceData,
      id: `srv-${Date.now()}`
    };

    setActiveServices(prev => [newService, ...prev]);
    return newService;
  };

  // Derive Stats dynamically for Workshop Overview
  const getStats = (): GarageStats => {
    const weeklyRevenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.grandTotal, 0) * 0.15; // Simulated weekly portion
    const monthlyRevenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.grandTotal, 0) * 0.6; // Simulated monthly portion
    const yearlyRevenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.grandTotal, 0);
    const allTimeRevenue = '₹1.42Cr'; // Standard benchmark from mocks

    return {
      weeklyRevenue: Math.floor(weeklyRevenue || 4250),
      monthlyRevenue: Math.floor(monthlyRevenue || 18920),
      yearlyRevenue: Math.floor(yearlyRevenue || 214000),
      allTimeRevenue
    };
  };

  return (
    <GarageContext.Provider
      value={{
        users,
        vehicles,
        activeServices,
        bills,
        currentUser,
        isAdmin,
        stats: getStats(),
        onboardingStep,
        selectedBillId,
        activeAdminTab,
        activeCustomerTab,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        logout,
        addVehicle,
        updateProfile,
        addBill,
        updateBillStatus,
        deleteBill,
        updateActiveServiceProgress,
        addActiveService,
        setOnboardingStep,
        setSelectedBillId,
        setActiveAdminTab,
        setActiveCustomerTab
      }}
    >
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (context === undefined) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
};
