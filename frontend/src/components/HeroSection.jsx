import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Zap, Sparkles, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const POPULAR_TESTS = [
  { name: "CBC (Complete Blood Count)", id: 1 },
  { name: "Lipid Profile", id: 2 },
  { name: "Thyroid Profile (T3, T4, TSH)", id: 3 },
  { name: "Vitamin D3", id: 4 },
  { name: "HbA1c Diabetes", id: 5 },
  { name: "Liver Function Test (LFT)", id: 6 },
];

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/compare?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/compare");
    }
  };

  const handleTestClick = (test) => {
    navigate(`/compare?test_id=${test.id}&name=${encodeURIComponent(test.name)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-16 sm:py-24 border-b border-slate-200/60 dark:border-slate-850">
      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute -top-20 left-10 w-80 h-80 bg-blue-400 rounded-full filter blur-3xl" />
        <div className="absolute -top-10 right-10 w-96 h-96 bg-sky-400 rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust Banner Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-6 border border-blue-200 dark:border-blue-800/60 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Transparent Healthcare Pricing • 100% NABL Accredited Labs</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]"
          >
            Compare Diagnostic Tests. <br />
            <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Save Up to 70%
            </span>{" "}
            on Lab Bills.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Find trusted diagnostic centers near you, compare real-time pathology prices, read verified patient reviews, and book hassle-free home blood sample collections.
          </motion.p>

          {/* Search Bar Form */}
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl sm:rounded-full border border-slate-300/80 dark:border-slate-800 shadow-lg shadow-blue-500/5 focus-within:ring-2 focus-within:ring-blue-500/30 transition">
              <div className="flex items-center flex-1 w-full px-3 py-2">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter test name (e.g. CBC, Vitamin D, Full Body...)"
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-xl sm:rounded-full shadow-md shadow-blue-600/20 transition-all duration-150"
              >
                <span>Compare Prices</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>

          {/* Popular Test Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1">
              Popular Tests:
            </span>
            {POPULAR_TESTS.map((test) => (
              <button
                key={test.id}
                type="button"
                onClick={() => handleTestClick(test)}
                className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                {test.name}
              </button>
            ))}
          </motion.div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left pt-8 border-t border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-xs border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">100% NABL</p>
                <p className="text-xs text-slate-500">Certified Labs Only</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-xs border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Instant Slots</p>
                <p className="text-xs text-slate-500">Free Home Collection</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-xs border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">500+ Centers</p>
                <p className="text-xs text-slate-500">Across Major Cities</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-xs border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Verified Reviews</p>
                <p className="text-xs text-slate-500">Real Patient Feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
