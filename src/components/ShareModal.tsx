import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Download, X, GraduationCap } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cgpa: number;
  totalCredits: number;
  degreeClass: string;
}

export function ShareModal({ isOpen, onClose, cgpa, totalCredits, degreeClass }: ShareModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById('share-card-content');
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // Use scale 3 for high-res output suitable for Instagram/WhatsApp
      const canvas = await html2canvas(element, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: null // Transparent background
      });
      const imgData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = 'CGPA_Pro_Result.png';
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 size={18} className="text-indigo-600 dark:text-indigo-400" /> Share Result
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Area */}
            <div className="p-6 bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
              {/* The actual card to be downloaded */}
              <div 
                id="share-card-content" 
                className="relative w-[320px] h-[400px] rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-950 via-gray-900 to-violet-950 text-white flex flex-col p-8"
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                
                {/* Header */}
                <div className="flex items-center gap-2 mb-auto relative z-10">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/10 shadow-inner">
                    <GraduationCap size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight leading-tight">CGPA Pro</span>
                    <span className="text-[10px] text-white/60 font-medium tracking-wide">by Kizito</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center justify-center text-center relative z-10 my-8">
                  <p className="text-xs font-semibold text-indigo-200/80 uppercase tracking-[0.2em] mb-3">Current CGPA</p>
                  <h2 className="text-7xl font-bold tracking-tighter mb-5 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm">
                    {cgpa.toFixed(2)}
                  </h2>
                  <div className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium text-white/90 shadow-lg">
                    {degreeClass}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between relative z-10 pt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-0.5">Total Credits</span>
                    <span className="text-lg font-semibold text-white/90">{totalCredits}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-0.5">Scale</span>
                    <span className="text-lg font-semibold text-white/90">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isDownloading ? 'Generating Image...' : 'Share / Download as Image'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
