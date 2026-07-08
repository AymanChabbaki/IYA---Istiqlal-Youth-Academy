import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "iya_splash_shown";
const MIN_DURATION_MS = 1100;

export const SplashScreen = () => {
  const [visible, setVisible] = useState(() => sessionStorage.getItem(SESSION_KEY) !== "true");

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "true");
    const timer = setTimeout(() => setVisible(false), MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <img
                src="/logo.png"
                alt="Istiqlal Youth Academy"
                className="relative h-20 w-20 object-contain dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="Istiqlal Youth Academy"
                className="relative hidden h-20 w-20 object-contain dark:block"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
