/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isAdmin: boolean;
  memberSince: string;
  loyaltyPoints: number;
  gstin?: string;
  operatingHours?: string;
  avatarUrl?: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  makeModel: string;
  plateNumber: string;
  odometer: number;
  isPrimary: boolean;
  type?: 'primary' | 'station-wagon' | 'suv' | 'other';
}

export interface ActiveService {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  serviceName: string;
  progress: number; // e.g. 75
  status: 'Pending' | 'In Progress' | 'Completed';
  estimatedCompletion: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  name: string;
  category: 'Parts' | 'Labour';
  qty: string; // e.g. "4.5L" or "1"
  rate: number;
  total: number;
}

export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleDetails: {
    makeModel: string;
    plateNumber: string;
    odometer: number;
  };
  date: string;
  items: LineItem[];
  status: 'Paid' | 'Pending' | 'Overdue';
  notes: string;
  partsTotal: number;
  laborTotal: number;
  gst: number;
  grandTotal: number;
}

export interface GarageStats {
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  allTimeRevenue: string;
}
