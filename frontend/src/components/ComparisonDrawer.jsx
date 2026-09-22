import React from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  X,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ComparisonDrawer = ({
  isOpen,
  onClose,
  selectedLabs = [],
  onRemoveLab,
  onClearAll,
  onBookAppointment,
}) => {
  // Sample test prices for comparison
  const sampleTestMatrix = [
    { name: "CBC (Complete Blood Count)", key: "cbc", prices: [299, 349, 249, 399] },
    { name: "Vitamin D (25-OH)", key: "vitd", prices: [899, 1099, 799, 1200] },
    { name: "Thyroid Profile (T3, T4, TSH)", key: "thyroid", prices: [599, 649, 499, 699] },
    { name: "HbA1c Diabetes", key: "hba1c", prices: [399, 450, 350, 480] },
  ];

  return (
    <>
      {/* Floating comparison badge bar when labs are selected */}
      {selectedLabs.length > 0 && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 max-w-xl w-[92%]"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {selectedLabs.length} {selectedLabs.length === 1 ? "Lab" : "Labs"} in Comparison
              </p>
              <p className="text-[11px] text-slate-300">
                Compare prices, turnaround times, and ratings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose} // Open drawer
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              Compare Now
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition"
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Slide-in Comparison Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-4xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Side-by-Side Lab Comparison
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Comparing {selectedLabs.length} diagnostic centers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClearAll}
                      className="text-xs text-rose-600 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body Table */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {selectedLabs.length === 0 ? (
                    <div className="text-center py-16 space-y-3 text-slate-400">
                      <Scale className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        No labs selected for comparison
                      </p>
                      <p className="text-xs max-w-xs mx-auto">
                        Click "Compare" on any lab cards in the marketplace to compare them side-by-side.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        {/* Header Row: Lab Names */}
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3 font-bold text-slate-400 w-44 uppercase tracking-wider text-[10px]">
                              Metrics & Details
                            </th>
                            {selectedLabs.map((lab) => (
                              <th key={lab.id} className="p-3 min-w-[200px] align-top">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2">
                                      {lab.name}
                                    </h4>
                                    <button
                                      onClick={() => onRemoveLab(lab.id)}
                                      className="text-slate-400 hover:text-rose-500 p-1"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">
                                    {lab.address}
                                  </p>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {/* Rating Row */}
                          <tr>
                            <td className="p-3 font-bold text-slate-500 dark:text-slate-400">
                              Patient Rating
                            </td>
                            {selectedLabs.map((lab) => (
                              <td key={lab.id} className="p-3">
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                  {typeof lab.rating === "number" ? lab.rating.toFixed(1) : lab.rating || 4.5} / 5
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Distance Row */}
                          <tr>
                            <td className="p-3 font-bold text-slate-500 dark:text-slate-400">
                              Distance from You
                            </td>
                            {selectedLabs.map((lab) => (
                              <td key={lab.id} className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                                📍 {lab.distance_km ? `${lab.distance_km.toFixed(1)} km away` : lab.distance !== undefined ? `${lab.distance.toFixed(1)} km away` : "Nearby"}
                              </td>
                            ))}
                          </tr>

                          {/* NABL Verified */}
                          <tr>
                            <td className="p-3 font-bold text-slate-500 dark:text-slate-400">
                              Accreditation
                            </td>
                            {selectedLabs.map((lab) => (
                              <td key={lab.id} className="p-3">
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  NABL & ICMR
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Home Sample Collection */}
                          <tr>
                            <td className="p-3 font-bold text-slate-500 dark:text-slate-400">
                              Home Sample Visit
                            </td>
                            {selectedLabs.map((lab) => (
                              <td key={lab.id} className="p-3 text-emerald-600 font-bold">
                                ✓ Free Home Visit
                              </td>
                            ))}
                          </tr>

                          {/* Report Turnaround Time */}
                          <tr>
                            <td className="p-3 font-bold text-slate-500 dark:text-slate-400">
                              Report Delivery
                            </td>
                            {selectedLabs.map((lab) => (
                              <td key={lab.id} className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  6-12 Hours (Digital)
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Section Header: Test Prices */}
                          <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                            <td
                              colSpan={selectedLabs.length + 1}
                              className="p-2.5 font-black uppercase text-[10px] tracking-wider text-blue-600 dark:text-blue-400"
                            >
                              Pathology Test Prices
                            </td>
                          </tr>

                          {sampleTestMatrix.map((testRow, idx) => (
                            <tr key={testRow.key}>
                              <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                {testRow.name}
                              </td>
                              {selectedLabs.map((lab, labIdx) => {
                                const price = testRow.prices[(lab.id + idx) % testRow.prices.length];
                                return (
                                  <td key={lab.id} className="p-3">
                                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                      ₹{price}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}

                          {/* Action Row */}
                          <tr>
                            <td className="p-3 font-bold text-slate-500">Action</td>
                            {selectedLabs.map((lab) => (
                              <td key={lab.id} className="p-3 space-y-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onBookAppointment?.(lab);
                                  }}
                                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Book Slot</span>
                                </button>
                                <Link
                                  to={`/labs/${lab.id}`}
                                  onClick={onClose}
                                  className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-[11px] transition flex items-center justify-center gap-1"
                                >
                                  <span>Full Details</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ComparisonDrawer;
