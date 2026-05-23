/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGarage } from '../context/GarageContext';
import { Car, Hash, Gauge, ArrowRight, Lock, User, Mail, MapPin, BadgeCheck, History, Bell } from 'lucide-react';

export const CustomerOnboarding: React.FC = () => {
  const { currentUser, onboardingStep, setOnboardingStep, addVehicle, updateProfile } = useGarage();

  // Step 1: Vehicle Form State
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [odometer, setOdometer] = useState('0');
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting1, setIsSubmitting1] = useState(false);

  // Step 2: Profile Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || '');
  const [billingAddress, setBillingAddress] = useState(currentUser?.address || '');
  const [isSubmitting2, setIsSubmitting2] = useState(false);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carMake || !carModel || !plateNumber) return;

    setIsSubmitting1(true);
    setTimeout(() => {
      if (currentUser) {
        const fullMakeModel = `${carMake.trim()} ${carModel.trim()}`;
        addVehicle(currentUser.id, fullMakeModel, plateNumber, parseInt(odometer) || 0);
      }
      setIsSubmitting1(false);
      setOnboardingStep(2); // Progress to Step 2
    }, 1200);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting2(true);

    setTimeout(() => {
      if (currentUser) {
        updateProfile(fullName, emailAddress, currentUser.phone, '');
      }
      setIsSubmitting2(false);
      setOnboardingStep(null); // Onboarding complete!
    }, 1500);
  };

  return (
    <div className="bg-[#fbf9fa] text-[#1b1c1d] font-body min-h-screen select-none overflow-x-hidden pt-24 pb-12">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9fa] border-b border-[#c4c6cd]/50 h-16 flex items-center px-4 md:px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <span className="font-headline text-lg font-bold tracking-tight text-[#041627]">CITY AUTO GARAGE</span>
          <div className="flex items-center gap-2">
            <span className="font-headline text-xs font-bold text-[#44474c] uppercase tracking-widest">
              {onboardingStep === 1 ? 'Step 01 / 02' : 'Setup Phase'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      {onboardingStep === 1 ? (
        // STEP 1 - Add First Vehicle
        <main className="max-w-4xl mx-auto px-4 md:px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column Description */}
            <div className="hidden md:flex md:col-span-5 flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="font-headline text-3xl font-extrabold text-[#041627] leading-tight">
                  Welcome to the workshop.
                </h1>
                <p className="text-[#44474c] leading-relaxed">
                  Let's get your first vehicle registered in the system. This allows us to track service history and schedule maintenance with precision.
                </p>
              </div>

              <div className="relative rounded-xl overflow-hidden aspect-square border border-[#c4c6cd]/40 shadow-sm">
                <img
                  alt="Workshop environment"
                  className="object-cover w-full h-full opacity-95"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOY7xv9uuaY1hppQSezmEQSirH-3qcm4H98IcetfTPhsfY9952zJlGI89V_sSnVzI3fdPhzfV5lq_oQWm8yKVdfwHlv74R2xXDjKgdFUoOgXHCO7zgmwRuJK8HVBVu5uSrmNPWt3LkRW_KlLPpDAQ3EYUL6WdBSTxeTaSigykSpt8qiFiREFPaA7hTc7r9ZjfB5JBcSupTepVvKkROBPxQdieRvqLK8YpLhQcHjk-I6_QzHj4q5gvTSf7dNcstOvQ9aZIuFJ2pp-8"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041627]/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white font-headline text-xs font-bold uppercase tracking-wider">
                  <BadgeCheck className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
                  Authorized Service Center
                </div>
              </div>
            </div>

            {/* Right Column Form */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="bg-white border border-[#c4c6cd]/50 rounded-xl p-8 md:p-10 border-l-4 border-l-[#041627] shadow-[0_2px_4px_rgba(26,43,60,0.05)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-[#da3433]/10 p-2.5 rounded-lg text-[#da3433]">
                    <Car className="h-6 w-6 stroke-[2]" />
                  </div>
                  <h2 className="font-headline text-xl font-bold text-[#041627]">Add Your First Vehicle</h2>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-6">
                  {/* Make and Model fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-headline text-xs font-bold text-[#44474c] tracking-widest block uppercase">
                        Car Make
                      </label>
                      <div className="relative">
                        <Car className="h-5 w-5 text-[#cbd5e1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={carMake}
                          onChange={(e) => {
                            setCarMake(e.target.value);
                            setShowWarning(true);
                          }}
                          placeholder="e.g. Maruti Suzuki, Toyota"
                          className="w-full pl-11 pr-4 py-3 bg-[#f5f3f4] border border-[#c4c6cd] rounded-lg font-body focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-headline text-xs font-bold text-[#44474c] tracking-widest block uppercase">
                        Car Model
                      </label>
                      <div className="relative">
                        <Car className="h-5 w-5 text-[#cbd5e1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={carModel}
                          onChange={(e) => {
                            setCarModel(e.target.value);
                            setShowWarning(true);
                          }}
                          placeholder="e.g. Swift, Camry"
                          className="w-full pl-11 pr-4 py-3 bg-[#f5f3f4] border border-[#c4c6cd] rounded-lg font-body focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plate Number input */}
                  <div className="space-y-2">
                    <label className="font-headline text-xs font-bold text-[#44474c] tracking-widest block uppercase">
                      Plate Number
                    </label>
                    <div className="relative">
                      <Hash className="h-5 w-5 text-[#cbd5e1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="ABC-1234"
                        className="w-full pl-11 pr-4 py-3 bg-[#f5f3f4] border border-[#c4c6cd] rounded-lg font-body font-semibold tracking-wider uppercase focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Info Alert Box */}
                  {showWarning && (
                    <div className="flex items-center gap-2.5 p-4 bg-[#feddb5]/40 text-[#584326] rounded-lg border border-[#feddb5]/60">
                      <span className="text-[#584326] font-extrabold text-sm font-headline">ⓘ</span>
                      <p className="text-xs font-body">Please ensure all technical vehicle details are accurate.</p>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row-reverse gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting1}
                      className="flex-1 bg-[#041627] text-white font-headline text-xs font-bold uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1a2b3c] active:scale-[0.98] transition-all disabled:opacity-75"
                    >
                      {isSubmitting1 ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="flex-1 bg-transparent border border-[#c4c6cd] text-[#44474c] font-headline text-xs font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-[#e9e7e9] active:opacity-75 transition-all text-center"
                    >
                      Skip for now
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Banner */}
              <p className="mt-6 text-center md:text-left text-xs text-[#74777d] flex items-center justify-center md:justify-start gap-1.5 font-body">
                <Lock className="h-3.5 w-3.5" />
                Your data is stored securely in accordance with workshop protocols.
              </p>
            </div>

          </div>
        </main>
      ) : (
        // STEP 2 - Complete Profile Details
        <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 min-h-[calc(100vh-120px)] flex flex-col justify-center">
          {/* Form Progress Header */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="font-headline text-2xl font-bold text-[#041627] mb-1">Finish your profile</h1>
                <p className="text-[#44474c] text-sm">Last step to getting your vehicle in the queue.</p>
              </div>
              <div className="text-right flex flex-col">
                <span className="font-headline text-xs font-bold text-[#041627] tracking-wider">STEP 02 OF 02</span>
                <span className="text-xs text-[#44474c] mt-0.5">Finalizing setup</span>
              </div>
            </div>
            {/* Fully loaded progress bar */}
            <div className="h-2 w-full bg-[#efedef] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#041627] to-[#1a2b3c] w-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(4,22,39,0.3)]"></div>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="bg-white border border-[#c4c6cd]/50 p-8 shadow-[0_2px_4px_rgba(26,43,60,0.05)] relative overflow-hidden rounded-xl">
            {/* Structural vertical anchor strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#041627]"></div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full name input */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block font-headline text-xs font-bold text-[#44474c] uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 text-[#cbd5e1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. James Peterson"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#cbd5e1] rounded-lg focus:border-[#041627] focus:ring-1 focus:ring-[#041627] outline-none transition-all font-body text-base text-[#1b1c1d]"
                    />
                  </div>
                </div>

                {/* Email Address input */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block font-headline text-xs font-bold text-[#44474c] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="h-5 w-5 text-[#cbd5e1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="james@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#cbd5e1] rounded-lg focus:border-[#041627] focus:ring-1 focus:ring-[#041627] outline-none transition-all font-body text-base text-[#1b1c1d]"
                    />
                  </div>
                </div>



              </div>

              {/* Red pulse secure banner */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b6171e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b6171e]"></span>
                  </div>
                  <span className="font-headline text-xs font-extrabold text-[#44474c] tracking-wider uppercase">
                    SECURE ENCRYPTION ACTIVE
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting2}
                  className="w-full sm:w-auto bg-[#041627] text-white font-headline text-xs font-bold uppercase tracking-widest py-4 px-10 rounded-lg hover:bg-[#1a2b3c] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isSubmitting2 ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      COMPLETE REGISTRATION
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Core priority support banners */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <BadgeCheck className="h-5 w-5 text-[#041627] shrink-0 stroke-[2]" />
              <div>
                <p className="font-headline text-xs font-bold text-[#041627] tracking-wider uppercase">Priority Access</p>
                <p className="text-[11px] leading-relaxed text-[#44474c] mt-0.5">
                  Profile completion grants you first-row access to service booking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <History className="h-5 w-5 text-[#041627] shrink-0 stroke-[1.8]" />
              <div>
                <p className="font-headline text-xs font-bold text-[#041627] tracking-wider uppercase">Service Logs</p>
                <p className="text-[11px] leading-relaxed text-[#44474c] mt-0.5">
                  Automatic tracking of all your vehicle maintenance history.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-[#041627] shrink-0 stroke-[1.8]" />
              <div>
                <p className="font-headline text-xs font-bold text-[#041627] tracking-wider uppercase">Smart Alerts</p>
                <p className="text-[11px] leading-relaxed text-[#44474c] mt-0.5">
                  Get notified for oil changes and safety inspections automatically.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
