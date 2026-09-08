import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, ArrowLeft, Home, Search, Scale, Building2 } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
          <Stethoscope className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
            Error 404
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diagnostic Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The healthcare route or test report you are looking for does not exist, may have moved, or is under scheduled maintenance.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/compare"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Tests</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link to="/labs" className="hover:text-blue-600 transition flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Labs Network
          </Link>
          <span>•</span>
          <Link to="/appointments" className="hover:text-blue-600 transition">
            My Appointments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
