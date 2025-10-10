// src/application/services/NotificationService.ts
import toast from 'react-hot-toast';

export interface NotificationService {
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  loading(message: string): string;
  dismiss(toastId: string): void;
}

export class ToastNotificationService implements NotificationService {
  success(message: string): void {
    toast.success(message);
  }

  error(message: string): void {
    toast.error(message);
  }

  info(message: string): void {
    toast(message, {
      icon: 'ℹ️',
    });
  }

  warning(message: string): void {
    toast(message, {
      icon: '⚠️',
    });
  }

  loading(message: string): string {
    return toast.loading(message);
  }

  dismiss(toastId: string): void {
    toast.dismiss(toastId);
  }
}

// Singleton instance
export const notificationService = new ToastNotificationService();
