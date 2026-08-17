import { create } from 'zustand';
import type { Notification, NotificationType } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  addNotification: (n) => {
    const id = crypto.randomUUID();
    const notification: Notification = {
      ...n,
      id,
      createdAt: Date.now(),
      duration: n.duration ?? 4000,
    };
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));
    return id;
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}));

// Convenience helper
export function notify(
  title: string,
  options?: { message?: string; type?: NotificationType; duration?: number }
) {
  const store = useNotificationStore.getState();
  return store.addNotification({
    title,
    message: options?.message,
    type: options?.type ?? 'info',
    duration: options?.duration ?? 4000,
  });
}
