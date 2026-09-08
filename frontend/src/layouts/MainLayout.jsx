import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToastState } from "../hooks/useAuth";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContainer = () => {
  const toastState = useToastState();
  if (!toastState) return null;
  const { toasts, removeToast } = toastState;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200",
    error: "border-rose-200 dark:border-rose-800/80 bg-rose-50/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200",
    warning: "border-amber-200 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200",
    info: "border-blue-200 dark:border-blue-800/80 bg-blue-50/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg backdrop-blur-md text-sm font-medium ${
              borders[item.type] || borders.info
            }`}
          >
            {icons[item.type] || icons.info}
            <div className="flex-1 text-xs sm:text-sm">{item.message}</div>
            <button
              onClick={() => removeToast(item.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
