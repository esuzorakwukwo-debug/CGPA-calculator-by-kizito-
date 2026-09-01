import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface UpdateNotificationProps {
  /** Optional override to force the Update Required state (e.g. for critical version migrations) */
  isRequired?: boolean;
  /** Whether the notification is permitted to be shown (e.g. false during splash/privacy/tour) */
  enabled?: boolean;
}

export function UpdateNotification({ isRequired = false, enabled = true }: UpdateNotificationProps) {
  const [isDismissedForSession, setIsDismissedForSession] = useState(() => {
    try {
      return sessionStorage.getItem('cgpa-pro-update-postponed') === 'true';
    } catch {
      return false;
    }
  });

  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const swUrlRef = useRef<string>('/sw.js');

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (swUrl) swUrlRef.current = swUrl;
      if (registration) {
        swRegistrationRef.current = registration;

        // If a worker is already waiting in the background, surface the update immediately
        if (registration.waiting) {
          setNeedRefresh(true);
        }

        // Trigger an immediate check on initial registration
        try {
          registration.update().then(() => {
            if (registration.waiting) {
              setNeedRefresh(true);
            }
          }).catch(() => {});
        } catch {}
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Dedicated update check trigger across app lifecycle
  const checkServiceWorkerUpdate = useCallback(async () => {
    const reg = swRegistrationRef.current;
    if (!reg) return;
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) return;

    try {
      // If already waiting, notify right away
      if (reg.waiting) {
        setNeedRefresh(true);
        return;
      }

      // Check server for new sw.js with cache: no-store
      try {
        await fetch(swUrlRef.current, {
          cache: 'no-store',
          headers: {
            'cache': 'no-store',
            'cache-control': 'no-cache',
          },
        });
      } catch {}

      await reg.update();
      if (reg.waiting) {
        setNeedRefresh(true);
      }
    } catch {
      // Silently ignore transient network errors
    }
  }, [setNeedRefresh]);

  // Lifecycle listeners: app visibility resume, window focus, online reconnect, periodic timer
  useEffect(() => {
    // 1. Initial check when component mounts
    checkServiceWorkerUpdate();

    // 2. Visibility change (when user returns to installed PWA or browser tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkServiceWorkerUpdate();
      }
    };

    // 3. Window focus (when user switches back to the app window)
    const handleFocus = () => {
      checkServiceWorkerUpdate();
    };

    // 4. Online event (when device regains internet connection)
    const handleOnline = () => {
      checkServiceWorkerUpdate();
    };

    // 5. Periodic background check every 15 minutes
    const intervalId = setInterval(checkServiceWorkerUpdate, 15 * 60 * 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkServiceWorkerUpdate]);

  const handleUpdate = () => {
    try {
      sessionStorage.removeItem('cgpa-pro-update-postponed');
    } catch {
      // Ignore storage errors
    }
    // Activate the new service worker immediately & reload
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    // Explicitly preserve the waiting service worker without activating it.
    // Mark as postponed for this browser session so the student is uninterrupted.
    try {
      sessionStorage.setItem('cgpa-pro-update-postponed', 'true');
    } catch {
      // Ignore storage errors
    }
    setIsDismissedForSession(true);
    // Hide UI banner while keeping SW in waiting state for next load/session
    setNeedRefresh(false);
  };

  // Determine if notification should show:
  // - Must be enabled (not during splash, privacy modal, or onboarding tour)
  // - If isRequired: always shows when needRefresh is true, regardless of session postponement
  // - If standard: only shows when needRefresh is true AND not postponed in this session
  const isVisible = enabled && needRefresh && (isRequired || !isDismissedForSession);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div
            className={`text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 border ${
              isRequired
                ? 'bg-amber-950/95 dark:bg-amber-950/95 border-amber-500/40 shadow-amber-950/50'
                : 'bg-gray-900/95 dark:bg-gray-800/95 border-gray-700/60 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isRequired
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                }`}
              >
                {isRequired ? (
                  <AlertCircle size={20} className="text-amber-400" />
                ) : (
                  <Sparkles size={20} className="animate-pulse text-indigo-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  {isRequired ? 'Update Required' : 'New Version Available'}
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isRequired ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                </h4>
                <p className="text-[11px] text-gray-300 dark:text-gray-400 truncate">
                  {isRequired
                    ? 'Critical performance & academic accuracy update.'
                    : 'Update now for the latest features & improvements.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isRequired && (
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 rounded-lg transition-colors"
                >
                  Later
                </button>
              )}
              <button
                onClick={handleUpdate}
                className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md active:scale-95 ${
                  isRequired
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span>{isRequired ? 'Reload' : 'Update now'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

