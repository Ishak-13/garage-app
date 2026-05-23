/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GarageProvider, useGarage } from './context/GarageContext';
import { LoginView } from './components/LoginView';
import { CustomerOnboarding } from './components/CustomerOnboarding';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { InvoiceDetailView } from './components/InvoiceDetailView';
import { AnimatePresence, motion } from 'motion/react';

const GarageAppContent: React.FC = () => {
  const { currentUser, isAdmin, onboardingStep, selectedBillId } = useGarage();

  const getPage = () => {
    // 1. Not Authenticated
    if (!currentUser) {
      return (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen"
        >
          <LoginView />
        </motion.div>
      );
    }

    // 2. Active onboarding stage for customers
    if (onboardingStep !== null && !isAdmin) {
      return (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className="w-full min-h-screen"
        >
          <CustomerOnboarding />
        </motion.div>
      );
    }

    // 3. Inspecting a selected Invoice printout
    if (selectedBillId !== null) {
      return (
        <motion.div
          key="invoice"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen"
        >
          <InvoiceDetailView />
        </motion.div>
      );
    }

    // 4. Admin Management Center
    if (isAdmin) {
      return (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen"
        >
          <AdminDashboard />
        </motion.div>
      );
    }

    // 5. Customer Dashboard and Profile Center
    return (
      <motion.div
        key="customer-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full min-h-screen"
      >
        <CustomerDashboard />
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {getPage()}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <GarageProvider>
      <GarageAppContent />
    </GarageProvider>
  );
}
