import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/stores/notificationStore';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';

export const NotificationsProvider: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          let Icon = Icons.Info;
          let colorClass = 'text-info';
          
          switch (notif.type) {
            case 'success': Icon = Icons.CheckCircle2; colorClass = 'text-success'; break;
            case 'warning': Icon = Icons.AlertTriangle; colorClass = 'text-warning'; break;
            case 'error': Icon = Icons.XCircle; colorClass = 'text-error'; break;
          }

          React.useEffect(() => {
            const dur = notif.duration ?? 0;
            if (dur > 0) {
              const timer = setTimeout(() => removeNotification(notif.id), dur);
              return () => clearTimeout(timer);
            }
          }, [notif.duration, notif.id, removeNotification]);

          return (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass p-4 rounded-xl shadow-notification pointer-events-auto flex gap-3 items-start relative overflow-hidden group"
            >
              <div className={clsx("mt-0.5", colorClass)}>
                <Icon size={18} />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="font-semibold text-sm text-nova-text">{notif.title}</span>
                {notif.message && (
                  <span className="text-xs text-nova-text-dim mt-1">{notif.message}</span>
                )}
              </div>
              <button 
                onClick={() => removeNotification(notif.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded absolute top-2 right-2 text-nova-text-dim hover:text-white"
              >
                <Icons.X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
