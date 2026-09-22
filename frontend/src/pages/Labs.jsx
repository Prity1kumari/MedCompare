import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Navigation,
  MapPin,
  Star,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  X,
  Calendar,
  CheckCircle2,
  Map,
  Heart,
  Scale,
  ShieldCheck,
  Search,
  Sparkles,
  Zap,
  Filter,
} from "lucide-react";
import api from "../api/axios";
import { useAuth, useToast } from "../hooks/useAuth";
import SearchBar from "../components/SearchBar";
import LabCard from "../components/LabCard";
import NearbyLabsMap from "../components/NearbyLabsMap";
import ComparisonDrawer from "../components/ComparisonDrawer";
import { SkeletonCard, EmptyState } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

// Haversine fallback distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return undefined;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState("all"); // "5", "10", "25", "all"
  const [filterNablOnly, setFilterNablOnly] = useState(false);
  const [filterHomeCollectionOnly, setFilterHomeCollectionOnly] = useState(false);
  const [filterOpenNowOnly, setFilterOpenNowOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all"); // "budget", "mid", "premium", "all"
  const [sortBy, setSortBy] = useState("rating"); // "rating", "distance", "name"
  const [showFilters, setShowFilters] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("medcompare_favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [viewFavoritesOnly, setViewFavoritesOnly] = useState(false);

  // Comparison state
  const [comparisonLabs, setComparisonLabs] = useState([]);
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);

  // Geolocation & Leaflet Map
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Quick Book Slot Modal
  const [bookingModalLab, setBookingModalLab] = useState(null);
  const [labSlots, setLabSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [isHomeCollection, setIsHomeCollection] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async (coords = null) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (coords?.lat && coords?.lng) {
        response = await api.get(`/lab/nearby?lat=${coords.lat}&lng=${coords.lng}`).catch(() => api.get("/lab"));
      } else {
        response = await api.get("/lab");
      }

      const data = Array.isArray(response.data) ? response.data : [];
      setLabs(data);
    } catch (err) {
      console.error("Failed to load labs:", err);
      setError("Unable to load diagnostic centers. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Browser Geolocation API
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setShowMap(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);
        toast.success("Location acquired! Displaying nearby diagnostic centers.");
        fetchLabs(coords);
      },
      (err) => {
        console.warn("Geolocation fallback:", err);
        const fallbackCoords = { lat: 25.5941, lng: 85.1376 };
        setUserLocation(fallbackCoords);
        setIsLocating(false);
        toast.info("Using city center location to calculate lab distances.");
        fetchLabs(fallbackCoords);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle Favorite
  const handleToggleFavorite = (lab) => {
    let updated;
    const exists = favorites.some((f) => f.id === lab.id);
    if (exists) {
      updated = favorites.filter((f) => f.id !== lab.id);
      toast.info(`Removed ${lab.name} from favorites.`);
    } else {
      updated = [...favorites, lab];
      toast.success(`Saved ${lab.name} to favorites!`);
    }
    setFavorites(updated);
    localStorage.setItem("medcompare_favorites", JSON.stringify(updated));
  };

  // Toggle Compare
  const handleToggleCompare = (lab) => {
    const exists = comparisonLabs.some((l) => l.id === lab.id);
    if (exists) {
      setComparisonLabs((prev) => prev.filter((l) => l.id !== lab.id));
      toast.info(`Removed ${lab.name} from comparison.`);
    } else {
      if (comparisonLabs.length >= 4) {
        toast.warning("You can compare up to 4 labs simultaneously.");
        return;
      }
      setComparisonLabs((prev) => [...prev, lab]);
      toast.success(`Added ${lab.name} to comparison!`);
    }
  };

  // Quick Book Slot
  const handleOpenBookingModal = async (lab) => {
    setBookingModalLab(lab);
    setSelectedSlotId("");
    try {
      const res = await api.get(`/slots/${lab.id}`).catch(() => ({ data: [] }));
      const available = Array.isArray(res.data) ? res.data.filter((s) => !s.is_booked) : [];
      setLabSlots(
        available.length > 0
          ? available
          : [
              { id: 1, slot_time: "07:30 AM - 09:00 AM (Fasting Sample)" },
              { id: 2, slot_time: "09:30 AM - 11:00 AM" },
              { id: 3, slot_time: "02:00 PM - 04:00 PM" },
            ]
      );
    } catch {
      setLabSlots([
        { id: 1, slot_time: "07:30 AM - 09:00 AM" },
        { id: 2, slot_time: "09:30 AM - 11:00 AM" },
      ]);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      toast.warning("Please select a sample collection slot.");
      return;
    }

    try {
      setIsBooking(true);
      await api.post("/appointments/book", {
        user_id: user?.id || 1,
        slot_id: parseInt(selectedSlotId),
      });

      toast.success(`Appointment confirmed at ${bookingModalLab?.name}!`);
      setBookingModalLab(null);
      navigate("/appointments");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.detail || "Could not book slot. Please try another slot.");
    } finally {
      setIsBooking(false);
    }
  };

  // Extract cities
  const cities = useMemo(() => {
    return Array.from(
      new Set(
        labs
          .map((l) => {
            const parts = (l.address || "").split(",");
            return parts[parts.length - 1]?.trim() || "";
          })
          .filter(Boolean)
      )
    );
  }, [labs]);

  // Filter and sort labs
  const filteredLabs = useMemo(() => {
    return labs
      .map((lab) => {
        const dist =
          lab.distance_km ??
          (userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, lab.latitude, lab.longitude)
            : undefined);
        return { ...lab, distance: dist };
      })
      .filter((lab) => {
        // Favorites view filter
        if (viewFavoritesOnly && !favorites.some((f) => f.id === lab.id)) {
          return false;
        }

        // Search Query (Lab Name, City, Address, or Common Tests like CBC, Thyroid)
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchName = lab.name.toLowerCase().includes(q);
          const matchAddr = (lab.address || "").toLowerCase().includes(q);
          // Common test keywords
          const testKeywords = ["cbc", "blood", "thyroid", "vitamin", "diabetes", "hba1c", "lipid", "kft", "lft", "urine"];
          const isTestSearch = testKeywords.some((k) => q.includes(k));
          if (!matchName && !matchAddr && !isTestSearch) {
            return false;
          }
        }

        // Rating
        const ratingVal = typeof lab.rating === "number" ? lab.rating : parseFloat(lab.rating) || 0;
        if (ratingVal < minRating) return false;

        // City
        if (selectedCity !== "all" && !(lab.address || "").toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }

        // Distance filter
        if (maxDistance !== "all" && lab.distance !== undefined) {
          const limit = parseFloat(maxDistance);
          if (lab.distance > limit) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "distance" && a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [
    labs,
    userLocation,
    searchQuery,
    selectedCity,
    minRating,
    maxDistance,
    sortBy,
    viewFavoritesOnly,
    favorites,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-xs">
              <Building2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Diagnostic Labs Marketplace
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Compare top-rated NABL certified diagnostic centers, check test prices, and schedule free home sample collections.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Favorites View Filter Toggle */}
          <button
            type="button"
            onClick={() => setViewFavoritesOnly(!viewFavoritesOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition shadow-xs ${
              viewFavoritesOnly
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Heart className={`w-4 h-4 ${viewFavoritesOnly ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Premium Find Labs Near Me Button */}
          <button
            type="button"
            onClick={handleFindNearby}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Acquiring GPS..." : "Find Labs Near Me"}</span>
          </button>

          {/* Map View Toggle */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`p-2.5 rounded-2xl border transition ${
              showMap
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title="Toggle Nearby Labs Map"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Interactive Nearby Labs Leaflet Map Card */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Interactive Nearby Labs Map
                </h3>
                {userLocation && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    GPS Active (Showing within radius)
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowMap(false)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <NearbyLabsMap
              labs={filteredLabs}
              userLocation={userLocation}
              onRecenter={handleFindNearby}
              height="350px"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Search lab name, city, address, or test (e.g. Apollo, CBC, Vitamin D)..."
              showFilterBtn={true}
              onToggleFilter={() => setShowFilters(!showFilters)}
              filterActive={
                showFilters ||
                minRating > 0 ||
                selectedCity !== "all" ||
                maxDistance !== "all" ||
                filterNablOnly ||
                filterHomeCollectionOnly
              }
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="rating">Sort: Highest Rated ⭐</option>
              <option value="distance">Sort: Nearest Distance 📍</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs"
            >
              {/* Distance Filter */}
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Max Distance
                </label>
                <div className="flex items-center gap-1.5">
                  {["all", "5", "10", "25"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setMaxDistance(d)}
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                        maxDistance === d
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {d === "all" ? "All" : `${d} km`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 4.0, 4.5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMinRating(val)}
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                        minRating === val
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {val === 0 ? "All" : `${val}+ ⭐`}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Filter by City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filter Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setMinRating(0);
                    setMaxDistance("all");
                    setSelectedCity("all");
                    setViewFavoritesOnly(false);
                  }}
                  className="w-full py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Showing {filteredLabs.length} {filteredLabs.length === 1 ? "diagnostic center" : "diagnostic centers"}
          {viewFavoritesOnly ? " in your Favorites" : ""}
        </span>
        {comparisonLabs.length > 0 && (
          <button
            onClick={() => setIsComparisonDrawerOpen(true)}
            className="text-blue-600 hover:underline font-bold"
          >
            {comparisonLabs.length} selected for comparison
          </button>
        )}
      </div>

      {/* Lab Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredLabs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={viewFavoritesOnly ? "No saved favorite labs yet" : "No diagnostic centers match your criteria"}
          description={
            viewFavoritesOnly
              ? "Click the heart icon on any diagnostic center card to save it to your favorites."
              : "Try widening your distance filter or searching for a different test or city."
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setMinRating(0);
            setMaxDistance("all");
            setSelectedCity("all");
            setViewFavoritesOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              distance={lab.distance}
              isFavorite={favorites.some((f) => f.id === lab.id)}
              onToggleFavorite={handleToggleFavorite}
              isComparing={comparisonLabs.some((l) => l.id === lab.id)}
              onToggleCompare={handleToggleCompare}
              onBookAppointment={handleOpenBookingModal}
            />
          ))}
        </div>
      )}

      {/* Side-by-Side Comparison Drawer */}
      <ComparisonDrawer
        isOpen={isComparisonDrawerOpen}
        onClose={() => setIsComparisonDrawerOpen(false)}
        selectedLabs={comparisonLabs}
        onRemoveLab={(labId) => setComparisonLabs((prev) => prev.filter((l) => l.id !== labId))}
        onClearAll={() => setComparisonLabs([])}
        onBookAppointment={handleOpenBookingModal}
      />

      {/* Quick Booking Modal */}
      <AnimatePresence>
        {bookingModalLab && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Quick Booking
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {bookingModalLab.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{bookingModalLab.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalLab(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Select Available Time Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                    {labSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id.toString())}
                        className={`p-3 rounded-xl text-left border text-xs font-semibold transition ${
                          selectedSlotId === slot.id.toString()
                            ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <p className="font-bold">Slot #{slot.id}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{slot.slot_time}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isHomeCollection}
                      onChange={(e) => setIsHomeCollection(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Request Free Home Sample Collection (Phlebotomist Visit)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setBookingModalLab(null)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlotId || isBooking}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    {isBooking ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Labs;