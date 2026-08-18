import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShellStore } from '@/stores/shellStore';

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
    }, 1800);

    return () => clearTimeout(timer);
  }, [isBooted, setPhase, setIsBooted]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Grain texture */}
      <div className="void-grain" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center select-none"
        style={{ gap: '32px' }}
      >
        {/* NOVA // VOID wordmark */}
        <div className="flex flex-col items-center" style={{ gap: '6px' }}>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.30em',
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
            }}
          >
            NOVA
          </span>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '8.5px',
              fontWeight: 400,
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.20)',
              textTransform: 'uppercase',
            }}
          >
            OPERATING ENVIRONMENT
          </span>
        </div>

        {/* Three-dot progress indicator */}
        <div className="flex items-center" style={{ gap: '6px' }} role="status" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.50)',
                display: 'block',
                flexShrink: 0,
              }}
              className={`void-dot-${i + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
