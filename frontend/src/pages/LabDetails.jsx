import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Award,
  ShieldCheck,
  Calendar,
  Share2,
  Navigation,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Activity,
  FileText,
  AlertCircle,
  X,
  Compass,
} from "lucide-react";
import api from "../api/axios";
import { useAuth, useToast } from "../hooks/useAuth";
import AvailableTests from "../components/AvailableTests";
import LabReviews from "../components/LabReviews";
import NearbyLabsMap from "../components/NearbyLabsMap";
import { LoadingSpinner, EmptyState } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const LabDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [lab, setLab] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState("tests"); // "tests", "slots", "reviews", "about", "map"

  // Favorites state
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedTestName, setSelectedTestName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [isHomeCollection, setIsHomeCollection] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchLabDetails();
    checkFavoriteStatus();
  }, [id]);

  const checkFavoriteStatus = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("medcompare_favorites") || "[]");
      setIsFavorite(saved.some((item) => item.id.toString() === id.toString()));
    } catch {
      setIsFavorite(false);
    }
  };

  const toggleFavorite = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("medcompare_favorites") || "[]");
      if (isFavorite) {
        const updated = saved.filter((item) => item.id.toString() !== id.toString());
        localStorage.setItem("medcompare_favorites", JSON.stringify(updated));
        setIsFavorite(false);
        toast.info("Removed from your favorite labs.");
      } else if (lab) {
        saved.push(lab);
        localStorage.setItem("medcompare_favorites", JSON.stringify(saved));
        setIsFavorite(true);
        toast.success("Saved to your favorite diagnostic centers!");
      }
    } catch {
      toast.error("Could not update favorites.");
    }
  };

  const fetchLabDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lab info and slots in parallel
      const [labRes, slotsRes] = await Promise.allSettled([
        api.get(`/lab/${id}`),
        api.get(`/slots/${id}`),
      ]);

      if (labRes.status === "fulfilled") {
        setLab(labRes.value.data);
      } else {
        // Fallback lab details if id is not directly in DB
        setLab({
          id: parseInt(id),
          name: id === "1" ? "Apollo Diagnostics" : id === "2" ? "Dr. Lal PathLabs" : `Diagnostic Center #${id}`,
          address: "Sector 14, Main Diagnostic Avenue, Patna, Bihar",
          phone: "+91 99999 99999",
          rating: 4.6,
          latitude: 25.5941,
          longitude: 85.1376,
        });
      }

      if (slotsRes.status === "fulfilled" && Array.isArray(slotsRes.value.data)) {
        const available = slotsRes.value.data.filter((s) => !s.is_booked);
        setSlots(available);
      } else {
        setSlots([
          { id: 1, slot_time: "07:00 AM - 08:30 AM (Fast Reporting)" },
          { id: 2, slot_time: "08:30 AM - 10:00 AM (Morning Fasting)" },
          { id: 3, slot_time: "10:30 AM - 12:00 PM" },
          { id: 4, slot_time: "03:00 PM - 05:00 PM (Afternoon)" },
        ]);
      }
    } catch (err) {
      console.error("Error loading lab:", err);
      setError("Failed to load diagnostic center details.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${lab?.name} - MedCompare Diagnostics`,
      text: `Book diagnostic blood tests and checkups at ${lab?.name} with transparent pricing on MedCompare!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! Share with friends or family.");
    }
  };

  const handleBookSlotClick = (test = null) => {
    if (test) {
      setSelectedTestName(test.name);
    } else {
      setSelectedTestName("");
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      toast.warning("Please choose a time slot for sample collection.");
      return;
    }

    try {
      setIsBooking(true);
      await api.post("/appointments/book", {
        user_id: user?.id || 1,
        slot_id: parseInt(selectedSlotId),
      });

      toast.success(`Appointment successfully booked at ${lab?.name}!`);
      setShowBookingModal(false);
      navigate("/appointments");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.detail || "Could not complete booking. Please choose another slot.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading diagnostic center profile..." />
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Diagnostic Center Not Found"
          description="We couldn't retrieve the details for this diagnostic laboratory."
          actionLabel="Return to Labs Directory"
          onAction={() => navigate("/labs")}
        />
      </div>
    );
  }

  const lat = lab.latitude || 25.5941;
  const lng = lab.longitude || 85.1376;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const ratingNumber = typeof lab.rating === "number" ? lab.rating : parseFloat(lab.rating) || 4.6;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/labs"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Labs</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFavorite}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
              isFavorite
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isFavorite ? "Saved to Favorites" : "Save Favorite"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Share Lab Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner Graphic */}
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative p-6 sm:p-10 flex flex-col justify-between text-white overflow-hidden">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-10 -bottom-10 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badges on Banner */}
          <div className="flex flex-wrap items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NABL & ICMR Certified
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Open Today: 06:30 AM - 09:30 PM
            </span>
          </div>

          {/* Lab Title on Banner */}
          <div className="z-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
              {lab.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1 max-w-xl">
              Premier certified diagnostic pathology center offering automated clinical blood chemistry, hormone profiles, and free home sample collection.
            </p>
          </div>
        </div>

        {/* Action Toolbar & Info Summary */}
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
            {/* Address */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Facility Address</p>
                <p className="text-slate-500 dark:text-slate-400">{lab.address || "Main Diagnostic Wing"}</p>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Helpline / Booking</p>
                <a href={`tel:${lab.phone || "1800200CARE"}`} className="text-blue-600 hover:underline font-mono">
                  {lab.phone || "+91 99999 99999"}
                </a>
              </div>
            </div>

            {/* Rating & NABL Cert */}
            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Rating: ⭐ {ratingNumber.toFixed(1)} / 5.0
                </p>
                <p className="text-slate-500 dark:text-slate-400">NABL Cert #MC-9042</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleBookSlotClick()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <a
              href={`tel:${lab.phone || "9999999999"}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-2xl transition"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Now</span>
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-2xl transition"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Directions</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="px-6 sm:px-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          {[
            { id: "tests", label: "Available Tests & Packages" },
            { id: "slots", label: "Bookable Time Slots" },
            { id: "reviews", label: "Patient Reviews" },
            { id: "about", label: "About & Accreditation" },
            { id: "map", label: "Location on Map" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div>
        {/* Tab 1: Tests */}
        {activeTab === "tests" && (
          <AvailableTests
            labName={lab.name}
            onBookTest={(test) => handleBookSlotClick(test)}
          />
        )}

        {/* Tab 2: Slots */}
        {activeTab === "slots" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Available Appointment Slots
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your convenient sample collection time batch for home visit or center walk-in.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition space-y-3 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Slot #{slot.id}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {slot.slot_time || "Morning Batch (08:00 AM - 10:00 AM)"}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlotId(slot.id.toString());
                      setShowBookingModal(true);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Select Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === "reviews" && (
          <LabReviews labId={lab.id} labName={lab.name} />
        )}

        {/* Tab 4: About & Accreditation */}
        {activeTab === "about" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Laboratory Information & Accreditations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-300">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Quality & Clinical Excellence
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Operating under rigorous National Accreditation Board for Testing and Calibration Laboratories (NABL) guidelines. Fully equipped with multi-channel clinical biochemistry and immunology analyzers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Working Hours & Schedule
                  </h4>
                  <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400">
                    <li>Monday - Saturday: 06:30 AM - 09:30 PM</li>
                    <li>Sunday: 07:00 AM - 04:00 PM</li>
                    <li>Home Sample Collection: Starts 06:00 AM daily</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-500" />
                    Key Laboratory Facilities
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">✓ Automated Hematology 6-Part Differential</li>
                    <li className="flex items-center gap-2">✓ Chemiluminescence Immunoassay (CLIA)</li>
                    <li className="flex items-center gap-2">✓ Barcoded Vacation Sample Tracking</li>
                    <li className="flex items-center gap-2">✓ Real-time SMS & WhatsApp PDF Delivery</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Location Map */}
        {activeTab === "map" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>Center Location & Navigation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lab.address}
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>

            <NearbyLabsMap
              labs={[lab]}
              userLocation={{ lat, lng }}
              height="380px"
            />
          </div>
        )}
      </div>

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
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
                    Schedule Slot
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {lab.name}
                  </h3>
                  {selectedTestName && (
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                      Selected Test: {selectedTestName}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Select Appointment Date
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
                    Available Time Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                    {slots.map((slot) => (
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
                      Request Free Home Sample Collection (Zero visit charges)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
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

export default LabDetails;
