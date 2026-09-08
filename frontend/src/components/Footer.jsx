import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Heart, Mail, Phone, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company branding */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">MedCompare</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              India's transparent pathology test aggregator. Compare lab costs, check certified reviews, and schedule home blood sample collections across 500+ NABL accredited diagnostic centers.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Certified Labs Only</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/labs" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Certified Diagnostic Labs
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Compare Test Prices
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Book Home Collection
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Patient Reviews & Ratings
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Patient Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Tests */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Top Diagnostic Tests
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/compare?search=CBC" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Complete Blood Count (CBC)
                </Link>
              </li>
              <li>
                <Link to="/compare?search=Thyroid" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Thyroid Profile (T3, T4, TSH)
                </Link>
              </li>
              <li>
                <Link to="/compare?search=Lipid" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Lipid / Cholesterol Profile
                </Link>
              </li>
              <li>
                <Link to="/compare?search=Vitamin" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Vitamin D & B12 Combo
                </Link>
              </li>
              <li>
                <Link to="/compare?search=Diabetes" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  HbA1c & Fasting Blood Sugar
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Patient Support
            </h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Helpline: 1800-200-CARE (24x7)</span>
              </p>
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>support@medcompare.health</span>
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Disclaimer: MedCompare is an independent diagnostic aggregator and does not provide medical diagnosis. Please consult a registered physician for test recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} MedCompare Health Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">NABL Accreditation Info</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
