import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ToastContext,
  type ToastContextValue,
  type ToastVariant,
  type ShowToastOptions,
} from './toast-context';

const TOAST_VISIBLE_MS = 3000;
const TOAST_EXIT_MS = 200;

type ToastRecord = {
  id: string;
  message: string;
  variant: ToastVariant;
  dedupeKey?: string;
  exiting: boolean;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const scheduledDismissRef = useRef<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    const timers = timersRef.current;
    for (const key of [id, `${id}-remove`]) {
      const pending = timers.get(key);
      if (pending) {
        clearTimeout(pending);
        timers.delete(key);
      }
    }
    scheduledDismissRef.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: string) => {
      const timers = timersRef.current;
      if (timers.has(id)) {
        return;
      }

      const hideTimer = setTimeout(() => {
        setToasts((current) =>
          current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)),
        );
        const removeTimer = setTimeout(() => dismiss(id), TOAST_EXIT_MS);
        timers.set(`${id}-remove`, removeTimer);
        timers.delete(id);
      }, TOAST_VISIBLE_MS);
      timers.set(id, hideTimer);
    },
    [dismiss],
  );

  useEffect(() => {
    for (const toast of toasts) {
      if (toast.exiting || scheduledDismissRef.current.has(toast.id)) {
        continue;
      }
      scheduledDismissRef.current.add(toast.id);
      scheduleDismiss(toast.id);
    }
  }, [toasts, scheduleDismiss]);

  const show = useCallback((message: string, variant: ToastVariant, options?: ShowToastOptions) => {
    setToasts((current) => {
      if (options?.dedupeKey && current.some((toast) => toast.dedupeKey === options.dedupeKey)) {
        return current;
      }
      return [
        ...current,
        {
          id: crypto.randomUUID(),
          message,
          variant,
          dedupeKey: options?.dedupeKey,
          exiting: false,
        },
      ];
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message, options) => show(message, 'success', options),
      error: (message, options) => show(message, 'error', options),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-viewport"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.variant}${toast.exiting ? ' toast--exit' : ''}`}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
