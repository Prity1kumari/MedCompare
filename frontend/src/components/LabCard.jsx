import React from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  ArrowRight,
  Calendar,
  Scale,
  Navigation,
  Heart,
  Check,
  Eye,
  Zap,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";

const LabCard = ({
  lab,
  distance,
  isFavorite = false,
  onToggleFavorite,
  isComparing = false,
  onToggleCompare,
  onBookAppointment,
}) => {
  const ratingNumber = typeof lab.rating === "number" ? lab.rating : parseFloat(lab.rating) || 4.5;
  const lat = lab.latitude || 25.5941;
  const lng = lab.longitude || 85.1376;
  const effectiveDistance = lab.distance_km ?? distance;

  // Directions link via Google Maps
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Image placeholder / branding logos
  const brandLogos = {
    apollo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400",
    lal: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=400",
    metropolis: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400",
    thyrocare: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
    default: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400",
  };

  const getLabImage = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("apollo")) return brandLogos.apollo;
    if (n.includes("lal")) return brandLogos.lal;
    if (n.includes("metropolis")) return brandLogos.metropolis;
    if (n.includes("thyrocare")) return brandLogos.thyrocare;
    return brandLogos.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between relative group"
    >
      {/* Top Banner / Image Header */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={getLabImage(lab.name)}
          alt={lab.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 dark:opacity-80"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Favorite & Compare Action Badges in corners */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <motion.button
            whileTap={{ scale: 0.8 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(lab);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-md ${
              isFavorite
                ? "bg-rose-500 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            <motion.div animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}>
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`} />
            </motion.div>
          </motion.button>
        </div>

        {/* Compare Checkbox pill */}
        <div className="absolute top-3 left-3 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.(lab);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold backdrop-blur-md shadow-md transition ${
              isComparing
                ? "bg-blue-600 text-white ring-2 ring-white"
                : "bg-black/50 text-white hover:bg-black/70"
            }`}
          >
            {isComparing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Comparing</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" />
                <span>+ Compare</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Lab Name & Distance on Banner bottom */}
        <div className="absolute bottom-3 left-4 right-4 text-white z-10">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold tracking-tight truncate drop-shadow-sm text-white">
              {lab.name}
            </h3>
            {effectiveDistance !== undefined && (
              <span className="shrink-0 bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-xs">
                📍 {effectiveDistance.toFixed(1)} km away
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Healthcare Badges Grid */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {/* NABL Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              NABL Verified
            </span>

            {/* Open / Closed Status */}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Open Now
            </span>

            {/* Home Sample Collection Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              <Home className="w-3 h-3" />
              Home Visit
            </span>

            {/* Fast Reports Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <Zap className="w-3 h-3" />
              Report in 6h
            </span>
          </div>

          {/* Rating & Review info */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-200 dark:border-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{ratingNumber.toFixed(1)}</span>
              <span className="text-slate-400 text-[10px] font-normal">/ 5.0</span>
            </div>
            <span className="text-[11px] text-slate-400">
              250+ patient ratings
            </span>
          </div>

          {/* Address & Phone */}
          <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-start gap-1.5 leading-snug">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{lab.address || "Certified diagnostic laboratory"}</span>
            </p>

            {lab.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{lab.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Row 1: Book Slot (Primary) & View Details */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBookAppointment?.(lab)}
              className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>

            <Link
              to={`/labs/${lab.id}`}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Details</span>
            </Link>
          </div>

          {/* Row 2: Compare Tests & Get Directions */}
          <div className="flex items-center gap-2">
            <Link
              to={`/compare?lab_id=${lab.id}`}
              className="flex-1 py-2 px-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-semibold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare Tests</span>
            </Link>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-semibold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LabCard;
