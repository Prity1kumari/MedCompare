import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Phone, ShieldCheck, Clock, ArrowRight, Calendar, Scale, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const LabCard = ({
  lab,
  distance,
  onBookAppointment,
  onViewReviews,
}) => {
  const ratingNumber = typeof lab.rating === "number" ? lab.rating : parseFloat(lab.rating) || 4.5;
  const isHighRated = ratingNumber >= 4.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
    >
      {/* Top badges */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              NABL Verified
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3 text-emerald-500" />
              Open Now
            </span>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{ratingNumber.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px] font-normal">/5</span>
          </div>
        </div>

        {/* Lab Name & Address */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {lab.name}
        </h3>

        <div className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{lab.address || "Address not provided"}</span>
          </p>

          {lab.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{lab.phone}</span>
            </p>
          )}

          {distance !== undefined && (
            <p className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-md mt-1">
              📍 {distance < 1 ? `${Math.round(distance * 1000)} meters away` : `${distance.toFixed(1)} km away`}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
        <Link
          to={`/compare?lab_id=${lab.id}`}
          className="flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Compare Tests
        </Link>

        <button
          type="button"
          onClick={() => onBookAppointment?.(lab)}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm transition"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Slot
        </button>

        <Link
          to={`/reviews?lab_id=${lab.id}`}
          className="px-2.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center"
          title="View Patient Reviews"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};

export default LabCard;
