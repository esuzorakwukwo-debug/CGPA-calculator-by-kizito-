import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export function UpdateNotification() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        // Check for service worker updates every 30 minutes
        setInterval(async () => {
          if (!(!registration.installing && navigator)) return;
          if ('onLine' in navigator && !navigator.onLine) return;
          try {
            const resp = await fetch(swUrl, {
              cache: 'no-store',
              headers: {
                'cache': 'no-store',
                'cache-control': 'no-cache',
              },
            });
            if (resp?.status === 200) await registration.update();
          } catch (e) {
            // Silently ignore network check errors
          }
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-gray-900/95 dark:bg-gray-800/95 text-white p-4 rounded-2xl shadow-2xl border border-gray-700/60 dark:border-gray-700 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="animate-pulse text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  New Version Available
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                </h4>
                <p className="text-[11px] text-gray-300 dark:text-gray-400 truncate">
                  Update now for the latest features & improvements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleUpdate}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95"
              >
                <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                Update now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
