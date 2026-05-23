/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGarage } from '../context/GarageContext';
import { Wrench, UserPlus, ShieldAlert, Key, Lock, HelpCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GarageLogo } from './GarageLogo';

export const LoginView: React.FC = () => {
  const { loginCustomer, registerCustomer, loginAdmin } = useGarage();
  const [activeTab, setActiveTabState] = useState<'login' | 'signup' | 'admin'>('login');
  
  // Login form status
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLogining, setIsLogining] = useState(false);

  // Signup form status
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupError, setSignupError] = useState('');

  // Admin form status
  const [adminPhone, setAdminPhone] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLogining(true);

    setTimeout(() => {
      const cleanPhone = loginPhone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setLoginError('Please enter a valid 10-digit mobile number.');
        setIsLogining(false);
        return;
      }

      const success = loginCustomer(cleanPhone);
      if (!success) {
        setLoginError('Mobile number not found. Please click "Create Account" or enter your registered customer mobile number.');
      }
      setIsLogining(false);
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setSignupError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      registerCustomer(signupName, cleanPhone);
    } catch (err) {
      setSignupError('Failed to register. Please try another mobile number.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanPhone = adminPhone.replace(/\D/g, '');
    const success = loginAdmin(cleanPhone);
    if (!success) {
      setAdminError('Access denied. Administrator credentials not found.');
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-4 md:px-8 flex flex-col items-center justify-center font-body bg-[#fbf9fa]">
      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-10 flex justify-between items-center px-4 md:px-6 h-16 bg-white/95 border-b border-[#c4c6cd]/40 backdrop-blur-md">
        <div className="flex items-center h-10">
          <GarageLogo variant="full" textColor="dark" className="h-full w-auto" />
        </div>
        <div>
          {activeTab !== 'admin' ? (
            <button
              onClick={() => setActiveTabState('admin')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#efedef] hover:bg-[#e9e7e9] transition-colors text-[#041627] border border-[#c4c6cd]/50 text-xs font-semibold uppercase tracking-wider"
            >
              <Key className="h-3 w-3" />
              Admin Access
            </button>
          ) : (
            <button
              onClick={() => setActiveTabState('login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#efedef]/80 hover:bg-[#efedef] transition-colors text-[#041627] border border-[#c4c6cd]/50 text-xs font-semibold uppercase tracking-wider"
            >
              Customer Access
            </button>
          )}
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="w-full max-w-[440px] z-10 my-auto animate-fade-in">
        <div className="bg-white rounded-xl overflow-hidden border border-[#c4c6cd]/60 shadow-[0_4px_25px_rgba(4,22,39,0.08)]">
          
          {/* Tab Selection */}
          {activeTab !== 'admin' && (
            <div className="flex border-b border-[#c4c6cd]/50 relative">
              <button
                onClick={() => {
                  setActiveTabState('login');
                  setLoginError('');
                  setSignupError('');
                }}
                className={`flex-1 py-4 text-center font-headline text-xs font-bold uppercase tracking-widest relative transition-all ${
                  activeTab === 'login'
                    ? 'text-[#041627]'
                    : 'text-[#74777d] hover:text-[#041627]'
                }`}
              >
                Login
                {activeTab === 'login' && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b6171e]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTabState('signup');
                  setLoginError('');
                  setSignupError('');
                }}
                className={`flex-1 py-4 text-center font-headline text-xs font-bold uppercase tracking-widest relative transition-all ${
                  activeTab === 'signup'
                    ? 'text-[#041627]'
                    : 'text-[#74777d] hover:text-[#041627]'
                }`}
              >
                Create Account
                {activeTab === 'signup' && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b6171e]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          )}

          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              {/* Login Flow */}
              {activeTab === 'login' && (
                <motion.div 
                  key="login-form-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-[#041627] mb-1">Welcome back</h2>
                    <p className="text-[#44474c] text-sm">Access your service history and rewards.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {loginError && (
                      <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/10 rounded text-xs text-[#ba1a1a] font-medium leading-relaxed">
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="font-headline text-xs font-bold text-[#44474c] block uppercase tracking-widest">
                        Mobile Number
                      </label>
                      <div className="flex items-center border border-[#c4c6cd] rounded bg-[#f5f3f4] focus-within:ring-1 focus-within:ring-[#041627] focus-within:border-[#041627] focus-within:bg-white transition-all overflow-hidden h-12">
                        <span className="pl-4 pr-1 font-headline font-semibold text-sm text-[#44474c] select-none">+91</span>
                        <input
                          type="tel"
                          required
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full h-full py-3 px-2 bg-transparent border-none focus:outline-none focus:ring-0 text-[#1b1c1d] font-body text-base"
                        />
                      </div>
                      <p className="text-xs text-[#44474c]/80 leading-relaxed font-body">
                        One account per phone number. Verification required.
                      </p>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLogining}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-[#041627] text-white font-headline text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:bg-[#1a2b3c] disabled:opacity-75 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isLogining ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                          Validating...
                        </>
                      ) : (
                        <>
                          Get Verification Code
                          <span className="inline-block transform rotate-[-15deg]">✈</span>
                        </>
                      )}
                    </motion.button>

                    <p className="mt-3 text-center text-xs text-[#44474c]/70 font-body leading-relaxed">
                      By continuing, you agree to our{' '}
                      <a href="#" className="underline font-semibold hover:text-[#041627]">
                        Terms of Service
                      </a>
                    </p>
                  </form>
                </motion.div>
              )}

              {/* Signup Flow */}
              {activeTab === 'signup' && (
                <motion.div 
                  key="signup-form-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-[#041627] mb-1">New to City Auto?</h2>
                    <p className="text-[#44474c] text-sm">Join our membership for precision service tracking.</p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-5">
                    {signupError && (
                      <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/10 rounded text-xs text-[#ba1a1a] font-medium leading-relaxed">
                        {signupError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="font-headline text-xs font-bold text-[#44474c] block uppercase tracking-widest">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 h-12 bg-[#f5f3f4] border border-[#c4c6cd] rounded focus:ring-1 focus:ring-[#041627] focus:border-[#041627] focus:bg-white transition-all font-body text-base outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-headline text-xs font-bold text-[#44474c] block uppercase tracking-widest">
                        Mobile Number
                      </label>
                      <div className="flex items-center border border-[#c4c6cd] rounded bg-[#f5f3f4] focus-within:ring-1 focus-within:ring-[#041627] focus-within:border-[#041627] focus-within:bg-white transition-all overflow-hidden h-12">
                        <span className="pl-4 pr-1 font-headline font-semibold text-sm text-[#44474c] select-none">+91</span>
                        <input
                          type="tel"
                          required
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full h-full py-3 px-2 bg-transparent border-none focus:outline-none focus:ring-0 text-[#1b1c1d] font-body text-base"
                        />
                      </div>
                      <p className="text-xs text-[#44474c]/80 leading-relaxed font-body">
                        One account per phone number. Verification required.
                      </p>
                    </div>

                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-4 bg-[#b6171e] text-white font-headline text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm hover:bg-[#da3433] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Create Account
                        <UserPlus className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Admin Portal Flow */}
              {activeTab === 'admin' && (
                <motion.div 
                  key="admin-form-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="text-[#b6171e] h-6 w-6 stroke-[2]" />
                    <h2 className="font-headline text-2xl font-bold text-[#041627]">Admin Portal</h2>
                  </div>

                  <div className="p-3 bg-[#b6171e]/5 border border-[#b6171e]/10 rounded-lg">
                    <p className="text-[#b6171e] font-headline text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Authorized Personnel Only
                    </p>
                    <p className="text-[#44474c] text-xs mt-1 leading-relaxed">
                      Please provide your registered administrator phone number to log into the administrative desk.
                    </p>
                  </div>

                  <form onSubmit={handleAdminSubmit} className="space-y-6">
                    {adminError && (
                      <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/10 rounded text-xs text-[#ba1a1a] font-medium leading-relaxed">
                        {adminError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="font-headline text-xs font-bold text-[#44474c] block uppercase tracking-widest">
                        Administrator ID (Phone)
                      </label>
                      <div className="flex items-center border border-[#c4c6cd] rounded bg-[#f5f3f4] focus-within:ring-1 focus-within:ring-[#041627] focus-within:border-[#041627] focus-within:bg-white transition-all overflow-hidden h-12">
                        <span className="pl-4 pr-1 font-headline font-semibold text-sm text-[#44474c] select-none">+91</span>
                        <input
                          type="tel"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full h-full py-3 px-2 bg-transparent border-none focus:outline-none focus:ring-0 text-[#1b1c1d] font-body text-base"
                        />
                      </div>
                      <p className="text-xs text-[#44474c]/80 italic text-right">Access logs are strictly audited</p>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-[#041627] text-white font-headline text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:bg-[#1a2b3c] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Authenticate
                      <Lock className="h-4 w-4" />
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTabState('login');
                        setAdminError('');
                      }}
                      className="w-full py-2 text-center text-[#44474c] hover:text-[#041627] font-headline text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Return to Customer Login
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Common Help Footer */}
            <div className="mt-8 pt-6 border-t border-[#c4c6cd]/50">
              <div className="flex items-center justify-between text-[#44474c]">
                <div className="flex items-center gap-1.5 text-xs">
                  <HelpCircle className="h-4 w-4 text-[#74777d]" />
                  <span>
                    Facing issues?{' '}
                    <a href="#" className="font-bold text-[#041627] hover:underline">
                      Support
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#b6171e] uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px]">SSL Secured</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Meta */}
        <footer className="mt-8 text-center text-[#44474c] text-xs font-body">
          <p>© 2026 City Auto Garage Group. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-[#041627] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#041627] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#041627] transition-colors">Help</a>
          </div>
        </footer>
      </main>

      {/* Visual Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#fbf9fa]">
          <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg1Djoo_A8Jh_4IXk9YcFlVwhOihkQbjuMEv-DVfPYLjcj6s9xkQNSqve_uc3YAdtwnevGWNjgWuwAkfQFGBLg2HxyCnjQGw14TrX9ne4IkvUDcO3WNeUhW9E3qpe36MEH-mErzGtFkJYPRg0evYod12SdENCgDWfNSMWs-eEXMD5-eiMTvmlSbbj-2drvVvZbdsZnOUUbbH4pF6aKM_AlMos_3ggUxjL98hLJtELislknsG2b8osQSkX3SPr2hdOEGdJ5VwbN-2s"
              alt="Automotive workspace backdrop"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#fbf9fa] via-[#fbf9fa]/85 to-transparent"></div>
        </div>
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#d2e4fb]/30 filter blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#ffdad6]/20 filter blur-[80px]"></div>
      </div>
    </div>
  );
};
