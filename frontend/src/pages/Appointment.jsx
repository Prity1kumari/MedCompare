import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  FileCheck,
} from "lucide-react";
import api from "../api/axios";
import { useAuth, useToast } from "../hooks/useAuth";
import AppointmentCard from "../components/AppointmentCard";
import { SkeletonCard, EmptyState } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const Appointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedLabId = searchParams.get("lab_id");

  const [appointments, setAppointments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Form State
  const [showBookingModal, setShowBookingModal] = useState(!!preselectedLabId);
  const [selectedLabId, setSelectedLabId] = useState(preselectedLabId || "");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [isHomeCollection, setIsHomeCollection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancellation State
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Tab filter
  const [filterTab, setFilterTab] = useState("all"); // "all", "booked", "completed", "cancelled"

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [apptRes, historyRes, labsRes] = await Promise.allSettled([
        user?.id ? api.get(`/appointments?user_id=${user.id}`) : Promise.reject(),
        api.get("/dashboard/history"),
        api.get("/lab"),
      ]);

      let userAppts = [];
      if (apptRes.status === "fulfilled" && Array.isArray(apptRes.value.data)) {
        userAppts = apptRes.value.data;
      } else if (historyRes.status === "fulfilled" && Array.isArray(historyRes.value.data)) {
        userAppts = historyRes.value.data;
      }

      const labsData = labsRes.status === "fulfilled" && Array.isArray(labsRes.value.data) ? labsRes.value.data : [];
      setLabs(labsData);

      // Map lab names into appointments
      const enrichedAppts = userAppts.map((appt) => {
        const foundLab = labsData.find((l) => l.id === appt.slot_id || l.id === appt.id % 5 + 1);
        return {
          ...appt,
          lab_name: foundLab?.name || `Partner Diagnostic Lab`,
          lab_address: foundLab?.address || "Free Home Sample Collection",
        };
      });

      setAppointments(enrichedAppts);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Unable to load appointments. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // When selectedLabId changes, load slots for that lab
  useEffect(() => {
    if (!selectedLabId) return;
    const fetchSlots = async () => {
      try {
        const res = await api.get(`/slots/${selectedLabId}`).catch(() => ({ data: [] }));
        const available = Array.isArray(res.data) ? res.data.filter((s) => !s.is_booked) : [];
        setSlots(available);
      } catch {
        setSlots([]);
      }
    };
    fetchSlots();
  }, [selectedLabId]);

  // Book appointment submission
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      toast.warning("Please choose an appointment slot.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post("/appointments/book", {
        user_id: user?.id || 1,
        slot_id: parseInt(selectedSlotId),
      });

      toast.success("Appointment booked successfully! Slot confirmed.");
      setShowBookingModal(false);
      setSelectedSlotId("");
      fetchData();
    } catch (err) {
      console.error("Booking error:", err);
      const msg = err.response?.data?.detail || "Could not book appointment. Please choose another slot.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setCancellingId(appointmentId);
      await api.delete(`/appointments/${appointmentId}`);
      toast.success(`Appointment #${appointmentId} cancelled successfully.`);
      setConfirmCancelId(null);
      // Update state locally
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error(err.response?.data?.detail || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filterTab === "all") return true;
    const status = a.status?.toLowerCase();
    if (filterTab === "booked") return status === "booked" || !status;
    if (filterTab === "completed") return status === "completed";
    if (filterTab === "cancelled") return status === "cancelled";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Diagnostic Appointments
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Schedule new blood tests, manage existing bookings, and view sample collection statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBookingModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Slot</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: "all", label: "All Appointments", count: appointments.length },
          {
            id: "booked",
            label: "Upcoming",
            count: appointments.filter((a) => a.status?.toLowerCase() !== "cancelled").length,
          },
          {
            id: "cancelled",
            label: "Cancelled",
            count: appointments.filter((a) => a.status?.toLowerCase() === "cancelled").length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filterTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No appointments in this view"
          description="You don't have any scheduled appointments under this filter tab."
          actionLabel="Book a Slot Now"
          onAction={() => setShowBookingModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              cancellingId={cancellingId}
              onCancel={(id) => setConfirmCancelId(id)}
            />
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    New Booking
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Schedule Test Appointment
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your preferred pathology lab and sample slot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                {/* Auto User info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Patient: {user?.name || "Self"} • ID #{user?.id || 1}
                  </p>
                  <p className="text-slate-400">{user?.email || "patient@med.com"}</p>
                </div>

                {/* Lab Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Select Diagnostic Center
                  </label>
                  <select
                    value={selectedLabId}
                    onChange={(e) => setSelectedLabId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Choose Diagnostic Lab --</option>
                    {labs.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.name} (⭐ {lab.rating || 4.5})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Slot Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Available Time Slot
                  </label>
                  {slots.length === 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">
                        Select a standard sample collection slot:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 1, label: "Morning 07:00 - 09:00 AM" },
                          { id: 2, label: "Morning 09:00 - 11:00 AM" },
                          { id: 3, label: "Afternoon 12:00 - 02:00 PM" },
                          { id: 4, label: "Evening 04:00 - 06:00 PM" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSlotId(s.id.toString())}
                            className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                              selectedSlotId === s.id.toString()
                                ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <p className="font-bold">Slot #{s.id}</p>
                            <p className="text-[11px] text-slate-400">{s.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {slots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSlotId(s.id.toString())}
                          className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                            selectedSlotId === s.id.toString()
                              ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <p className="font-bold">Slot #{s.id}</p>
                          <p className="text-[11px] text-slate-400">{s.slot_time}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Home Sample Collection Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
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

                {/* Modal Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlotId || isSubmitting}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Confirming..." : "Confirm Appointment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Cancellation */}
      <AnimatePresence>
        {confirmCancelId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Cancel Appointment #{confirmCancelId}?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This slot will be released and made available to other patients. You can re-book anytime.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  Keep Slot
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelAppointment(confirmCancelId)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointment;