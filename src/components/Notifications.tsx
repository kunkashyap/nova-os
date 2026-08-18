import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/stores/notificationStore';
import * as Icons from 'lucide-react';

export const NotificationsProvider: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      className="fixed top-4 right-4 z-[99999] flex flex-col pointer-events-none"
      style={{ gap: '6px', width: '300px' }}
    >
      <AnimatePresence>
        {notifications.map((notif) => (
          <VoidNotification
            key={notif.id}
            notif={notif}
            onRemove={() => removeNotification(notif.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const VoidNotification: React.FC<{
  notif: any;
  onRemove: () => void;
}> = ({ notif, onRemove }) => {
  // Auto-dismiss
  useEffect(() => {
    const dur = notif.duration ?? 0;
    if (dur > 0) {
      const timer = setTimeout(onRemove, dur);
      return () => clearTimeout(timer);
    }
  }, [notif.duration, onRemove]);

  // Icon by type — shape carries semantics, no color needed
  const getIcon = () => {
    switch (notif.type) {
      case 'success': return <Icons.CheckCircle2 size={14} strokeWidth={1.5} />;
      case 'warning': return <Icons.AlertTriangle size={14} strokeWidth={1.5} />;
      case 'error':   return <Icons.XCircle size={14} strokeWidth={1.5} />;
      default:        return <Icons.Info size={14} strokeWidth={1.5} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="pointer-events-auto relative overflow-hidden group"
      style={{
        background: 'rgba(18,18,18,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30)',
        padding: '12px 14px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      {/* Icon */}
      <div style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0, marginTop: '1px' }}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1" style={{ gap: '2px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.3,
          }}
        >
          {notif.title}
        </span>
        {notif.message && (
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11.5px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.38)',
              lineHeight: 1.4,
            }}
          >
            {notif.message}
          </span>
        )}
      </div>

      {/* Dismiss button — visible on hover */}
      <button
        onClick={onRemove}
        className="flex items-center justify-center transition-colors duration-100 cursor-pointer opacity-0 group-hover:opacity-100"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '5px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.30)',
          flexShrink: 0,
          marginTop: '0px',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.30)';
        }}
      >
        <Icons.X size={11} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
};
