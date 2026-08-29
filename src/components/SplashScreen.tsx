import { motion } from 'motion/react';

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col items-center px-6 text-center"
      >
        <div className="w-24 h-24 mb-8 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.35)]">
          <img
            src="/icon-512.png"
            alt="CGPA Pro"
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-slate-300 italic font-serif text-lg md:text-xl max-w-md leading-relaxed">
          "A scholar who cherishes the love of comfort<br className="hidden sm:block" /> is not worthy to be deemed a scholar."
        </p>
      </motion.div>
    </motion.div>
  );
}
