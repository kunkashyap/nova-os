import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useShellStore } from '@/stores/shellStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ArrowRight, User } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setPhase } = useShellStore();
  const { settings } = useSettingsStore();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setPhase('desktop');
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-nova-dark">
      {/* Background blur/gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-dim/30 to-nova-black backdrop-blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex flex-col items-center glass p-10 rounded-2xl shadow-panel min-w-[320px]"
      >
        <div className="w-24 h-24 rounded-full bg-nova-surface-3 border border-nova-border flex items-center justify-center mb-6 shadow-xl">
          <User size={40} className="text-nova-text-dim" />
        </div>
        
        <h2 className="text-xl font-semibold mb-8 text-nova-text">{settings.username}</h2>

        <form onSubmit={handleLogin} className="w-full relative group">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full bg-black/40 border border-nova-border-2 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-light transition-colors text-center placeholder:text-nova-text-dim/50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all disabled:opacity-50"
          >
            <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
