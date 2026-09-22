import React, { useState } from "react";
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Tag,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

export const DEFAULT_MEDICAL_TESTS = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    price: 299,
    originalPrice: 550,
    discount: "45% OFF",
    reportTime: "6 Hours",
    parameters: 24,
    fasting: "No fasting required",
    description: "Evaluates overall health and detects anemia, infections, leukemia, and platelet disorders.",
    popular: true,
  },
  {
    id: 2,
    name: "Vitamin D (25-OH)",
    category: "Vitamins",
    price: 899,
    originalPrice: 1600,
    discount: "44% OFF",
    reportTime: "12 Hours",
    parameters: 1,
    fasting: "No fasting required",
    description: "Essential for healthy bones, immune function, and calcium absorption.",
    popular: true,
  },
  {
    id: 3,
    name: "Thyroid Profile Total (T3, T4, TSH)",
    category: "Endocrinology",
    price: 599,
    originalPrice: 1100,
    discount: "46% OFF",
    reportTime: "8 Hours",
    parameters: 3,
    fasting: "10-12 hrs fasting recommended",
    description: "Assesses thyroid gland function, metabolism rate, and hormonal balance.",
    popular: true,
  },
  {
    id: 4,
    name: "HbA1c (Glycated Hemoglobin)",
    category: "Diabetes",
    price: 399,
    originalPrice: 750,
    discount: "47% OFF",
    reportTime: "6 Hours",
    parameters: 2,
    fasting: "No fasting required",
    description: "Gold-standard test measuring 3-month average blood glucose control for diabetes management.",
    popular: true,
  },
  {
    id: 5,
    name: "Lipid Profile / Cholesterol",
    category: "Cardiology",
    price: 499,
    originalPrice: 950,
    discount: "48% OFF",
    reportTime: "8 Hours",
    parameters: 8,
    fasting: "12 hrs overnight fasting required",
    description: "Measures good (HDL) and bad (LDL) cholesterol, triglycerides, and heart health risk.",
    popular: false,
  },
  {
    id: 6,
    name: "Liver Function Test (LFT)",
    category: "Biochemistry",
    price: 699,
    originalPrice: 1250,
    discount: "44% OFF",
    reportTime: "8 Hours",
    parameters: 11,
    fasting: "8-10 hrs fasting required",
    description: "Checks bilirubin, SGOT, SGPT, alkaline phosphatase, and liver protein health.",
    popular: false,
  },
  {
    id: 7,
    name: "Kidney Function Test (KFT / RFT)",
    category: "Biochemistry",
    price: 649,
    originalPrice: 1150,
    discount: "43% OFF",
    reportTime: "8 Hours",
    parameters: 7,
    fasting: "No fasting required",
    description: "Measures creatinine, blood urea nitrogen, electrolytes, and renal efficiency.",
    popular: false,
  },
  {
    id: 8,
    name: "Full Body Comprehensive Health Package",
    category: "Preventive",
    price: 1499,
    originalPrice: 3800,
    discount: "60% OFF",
    reportTime: "12 Hours",
    parameters: 72,
    fasting: "10-12 hrs overnight fasting required",
    description: "Comprehensive health checkup covering CBC, KFT, LFT, Lipid Profile, Thyroid, and Blood Sugar.",
    popular: true,
  },
];

const AvailableTests = ({
  tests = DEFAULT_MEDICAL_TESTS,
  labName,
  onBookTest,
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...new Set(tests.map((t) => t.category))];

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || test.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Available Diagnostic Tests & Packages</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              {tests.length} Tests
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book individual pathology tests or discounted full-body health checkup packages.
          </p>
        </div>

        {showSearch && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test name (e.g. CBC, Vitamin)..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTests.map((test) => (
          <motion.div
            key={test.id}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between relative group overflow-hidden"
          >
            {test.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-bl-xl shadow-xs">
                Popular
              </div>
            )}

            <div>
              {/* Category & Parameters */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md">
                  {test.category}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {test.parameters} Parameters
                </span>
              </div>

              {/* Test Name */}
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {test.name}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {test.description}
              </p>

              {/* Features List */}
              <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Report in: <strong className="text-slate-800 dark:text-slate-200">{test.reportTime}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{test.fasting}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Free Home Blood Collection</span>
                </p>
              </div>
            </div>

            {/* Price & Book Button */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ₹{test.price}
                  </span>
                  {test.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{test.originalPrice}
                    </span>
                  )}
                </div>
                {test.discount && (
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    {test.discount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onBookTest?.(test)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Now</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AvailableTests;
