import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import L from "leaflet";
import api from "../api/axios";
import { useAuth, useToast } from "../hooks/useAuth";
import SearchBar from "../components/SearchBar";
import LabCard from "../components/LabCard";
import { SkeletonCard, EmptyState } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

// Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return undefined;
  const R = 6371; // Earth radius in km
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

  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating"); // "rating" or "name"
  const [showFilters, setShowFilters] = useState(false);

  // Geolocation & Map
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Quick Book Slot Modal
  const [bookingModalLab, setBookingModalLab] = useState(null);
  const [labSlots, setLabSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/lab");
      setLabs(Array.isArray(response.data) ? response.data : []);
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
    toast.error("Geolocation is not supported by your browser");
    return;
  }

  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      try {
        const response = await api.get(
          `/lab/nearby?lat=${coords.lat}&lng=${coords.lng}`
        );

        setLabs(response.data);
        setUserLocation(coords);

        toast.success(
          `${response.data.length} nearby labs found`
        );
      } catch (error) {
        console.error(error);
        toast.error("Unable to load nearby labs");
      } finally {
        setIsLocating(false);
      }
    },

    (err) => {
      console.error(err);
      toast.error("Location access denied");
      setIsLocating(false);
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
};
 

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const centerLat = userLocation?.lat || labs[0]?.latitude || 28.6139;
    const centerLng = userLocation?.lng || labs[0]?.longitude || 77.209;

    // Clean up previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Add User marker if located
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="background-color: #2563eb; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.8);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Current Location</b>")
        .openPopup();
    }

    // Add Lab markers
    labs.forEach((lab) => {
      const lat = lab.latitude || 28.6139 + (Math.random() - 0.5) * 0.08;
      const lng = lab.longitude || 77.209 + (Math.random() - 0.5) * 0.08;

      const labIcon = L.divIcon({
        className: "custom-lab-marker",
        html: `<div style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid white; white-space: nowrap;">🏥 ${lab.name.substring(0, 14)}</div>`,
        iconSize: [90, 24],
        iconAnchor: [45, 12],
      });

      L.marker([lat, lng], { icon: labIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; min-width: 180px;">
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1e293b;">${lab.name}</p>
            <p style="margin: 4px 0 6px; font-size: 12px; color: #64748b;">${lab.address || "Verified Lab"}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: bold;">⭐ ${lab.rating || 4.8} / 5</span>
              <a href="/compare?lab_id=${lab.id}" style="color: #2563eb; font-size: 12px; font-weight: 600; text-decoration: none;">Compare Tests →</a>
            </div>
          </div>`
        );
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap, userLocation, labs]);

  // Open booking modal and load slots
  const handleOpenBookingModal = async (lab) => {
    setBookingModalLab(lab);
    setSelectedSlotId("");
    try {
      const res = await api.get(`/slots/${lab.id}`).catch(() => ({ data: [] }));
      const available = Array.isArray(res.data) ? res.data.filter((s) => !s.is_booked) : [];
      setLabSlots(available);
    } catch {
      setLabSlots([]);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      toast.warning("Please select a time slot.");
      return;
    }

    try {
      setIsBooking(true);
      await api.post("/appointments/book", {
        user_id: user?.id || 1,
        slot_id: parseInt(selectedSlotId),
      });

      toast.success(`Appointment booked successfully at ${bookingModalLab?.name}!`);
      setBookingModalLab(null);
      navigate("/appointments");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.detail || "Could not book slot. Please try another slot.");
    } finally {
      setIsBooking(false);
    }
  };

  // Extract unique cities
  const cities = Array.from(
    new Set(
      labs
        .map((l) => {
          const match = l.address?.split(",") || [];
          return match[match.length - 1]?.trim() || "Local";
        })
        .filter(Boolean)
    )
  );

  // Filter and sort labs
  const filteredLabs = labs
    .map((lab) => {
      const dist = userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            lab.latitude || 28.6139,
            lab.longitude || 77.209
          )
        : undefined;
      return { ...lab, distance: dist };
    })
    .filter((lab) => {
      const matchSearch =
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lab.address && lab.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const ratingVal = typeof lab.rating === "number" ? lab.rating : parseFloat(lab.rating) || 0;
      const matchRating = ratingVal >= minRating;

      const matchCity =
        selectedCity === "all" ||
        (lab.address && lab.address.toLowerCase().includes(selectedCity.toLowerCase()));

      return matchSearch && matchRating && matchCity;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Geolocation CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Diagnostic Labs Network
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Compare accredited pathology labs, verify certifications, and book instant slots.
          </p>
        </div>

        {/* Premium Nearby Labs Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFindNearby}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating GPS..." : "Find Labs Near Me"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`p-2.5 rounded-2xl border transition ${
              showMap
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Toggle Map View"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Card (Nearby Labs Feature) */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Interactive Nearby Labs Map
                </h3>
                {userLocation && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    GPS Active
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

            <div
              ref={mapContainerRef}
              className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Search by lab name, center, address, or city..."
              showFilterBtn={true}
              onToggleFilter={() => setShowFilters(!showFilters)}
              filterActive={showFilters || minRating > 0 || selectedCity !== "all"}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="name">Sort: Name (A-Z)</option>
              {userLocation && <option value="distance">Sort: Nearest Distance</option>}
            </select>
          </div>
        </div>

        {/* Extended Filter Drawer */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs"
          >
            {/* Minimum Rating */}
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                {[0, 3.5, 4.0, 4.5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMinRating(val)}
                    className={`flex-1 py-2 rounded-xl font-semibold border transition ${
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
            {cities.length > 0 && (
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Filter by City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="all">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setMinRating(0);
                  setSelectedCity("all");
                  setSortBy("rating");
                }}
                className="px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-semibold transition"
              >
                Reset All Filters
              </button>
            </div>
          </motion.div>
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
          title="No diagnostic labs match your criteria"
          description="Try relaxing your rating filters, expanding your search area, or resetting queries."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setMinRating(0);
            setSelectedCity("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              distance={lab.distance}
              onBookAppointment={handleOpenBookingModal}
            />
          ))}
        </div>
      )}

      {/* Quick Booking Modal */}
      {bookingModalLab && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Book Slot
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {bookingModalLab.name}
                </h3>
                <p className="text-xs text-slate-500">{bookingModalLab.address}</p>
              </div>
              <button
                onClick={() => setBookingModalLab(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  Select Available Time Slot
                </label>
                {labSlots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                    No custom slots available online for this lab right now. Please select default appointment slot #1.
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSlotId("1")}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                          selectedSlotId === "1"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        Default Morning Slot (08:00 AM - 10:00 AM)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
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
                        <p className="text-[11px] text-slate-400">
                          {slot.slot_time || "Morning Batch"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                <span>Zero pre-payment required. Pay on sample collection at lab or home.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModalLab(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSlotId || isBooking}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isBooking ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Labs;