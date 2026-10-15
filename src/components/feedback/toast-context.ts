import { createContext } from 'react';

export type ToastVariant = 'success' | 'error';

export type ShowToastOptions = {
  dedupeKey?: string;
};

export type ToastContextValue = {
  success: (message: string, options?: ShowToastOptions) => void;
  error: (message: string, options?: ShowToastOptions) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
