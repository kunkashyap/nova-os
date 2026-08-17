import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShellStore } from '@/stores/shellStore';
import { Loader2 } from 'lucide-react';

export const BootSequence: React.FC = () => {
  const { setPhase, isBooted, setIsBooted } = useShellStore();

  useEffect(() => {
    if (isBooted) {
      setPhase('login');
      return;
    }

    const timer = setTimeout(() => {
      setIsBooted(true);
      setPhase('login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [isBooted, setPhase, setIsBooted]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-nova-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-accent to-accent-light shadow-glow-accent flex items-center justify-center animate-nova-pulse">
          <span className="text-4xl font-bold tracking-tighter text-white">N</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-widest text-nova-text uppercase mb-12">
          NOVA OS
        </h1>
        
        <div className="flex items-center gap-3 text-nova-text-dim text-sm">
          <Loader2 className="animate-spin" size={16} />
          <span>Initializing kernel...</span>
        </div>
      </motion.div>
    </div>
  );
};
