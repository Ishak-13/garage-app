import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GarageLogo } from './GarageLogo';
import { Cpu, Activity } from 'lucide-react';

interface SplashAnimationProps {
  onComplete: () => void;
}

export const SplashAnimation: React.FC<SplashAnimationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Powering up workshop systems...');

  useEffect(() => {
    // Smoother and more progressive loading intervals
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Small progressive increments for high-end loading curve
        const step = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(prev + step, 100);
        
        if (next > 85) {
          setStatusText('Initiating systems diagnostic telemetry...');
        } else if (next > 60) {
          setStatusText('Resolving active server gateways...');
        } else if (next > 40) {
          setStatusText('Synchronizing database nodes & active inventory...');
        } else if (next > 20) {
          setStatusText('Connecting securely to City Auto Garage host...');
        }
        
        return next;
      });
    }, 110);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 650); // Slide-out buffer
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        y: -15,
        filter: 'blur(10px)',
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#041627] overflow-hidden select-none"
    >
      {/* Blueprint Grid Wave Background */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(227,30,36,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(227,30,36,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial overlay to dim corners and highlight beautiful Guntur red core */}
      <div 
        className="absolute inset-0 opacity-[0.16] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #e31e24 0%, transparent 70%)'
        }}
      />

      {/* Main Glassmorphic Panel Container (To capture the focus perfectly) */}
      <div className="flex flex-col items-center max-w-md px-6 text-center z-10">
        
        {/* Animated Brand Emblem & Text container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 w-72 md:w-88"
        >
          {/* Main Logo Container */}
          <div className="relative group p-4">
            {/* Ambient Red Aura Pulse under the logo to elevate contrast */}
            <div className="absolute inset-x-8 -bottom-4 -top-4 bg-gradient-to-r from-red-600/25 to-red-500/20 opacity-30 blur-2xl rounded-2xl animate-pulse" />
            
            <GarageLogo variant="full" textColor="light" className="w-full relative drop-shadow-[0_4px_24px_rgba(227,30,36,0.2)]" />
          </div>
        </motion.div>

        {/* Technical Diagnostics Meter & Progress bar */}
        <div className="w-full max-w-[280px] mt-4 space-y-4">
          
          {/* Progress Loading Track */}
          <div className="relative h-[2.5px] w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-[#e31e24] shadow-[0_0_12px_#e31e24]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Loader Information metadata */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-[#8192a7] leading-none">
              <Cpu className="h-3.5 w-3.5 text-[#e31e24]/90 animate-pulse" />
              <span>Workshop Core Init</span>
              <span className="text-white font-extrabold ml-1">{progress}%</span>
            </div>
            
            <motion.p 
              key={statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#74777d]/90 font-body text-[10px] tracking-wide leading-none min-h-[14px]"
            >
              {statusText}
            </motion.p>
          </div>

        </div>

      </div>

      {/* Decorative Technical UI Corner Details */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] text-[#74777d] font-mono opacity-65">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
        <Activity className="h-3.5 w-3.5 text-green-500" />
        <span>SYS_STATUS: CONNECTED</span>
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] text-[#8192a7] font-mono opacity-50 flex items-center gap-1.5">
        <span>GUNTUR AP INDIA</span>
        <span>•</span>
        <span>EST. 2026.05.23</span>
      </div>
    </motion.div>
  );
};

