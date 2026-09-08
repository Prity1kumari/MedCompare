import React, { useState, useEffect, useMemo } from "react";
import {
  History as HistoryIcon,
  Calendar,
  CreditCard,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { SkeletonTable, EmptyState } from "../components/LoadingSpinner";
import { motion } from "framer-motion";

const History = () => {
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [dateFilter, setDateFilter] = useState("all"); // "7days", "30days", "all"
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "appointments", "payments"
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyRes, paymentsRes] = await Promise.allSettled([
        api.get("/dashboard/history"),
        api.get("/payment"),
      ]);

      const historyData =
        historyRes.status === "fulfilled" && Array.isArray(historyRes.value.data)
          ? historyRes.value.data
          : [];
      const paymentsData =
        paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value.data)
          ? paymentsRes.value.data
          : [];

      setAppointments(historyData);
      setPayments(paymentsData);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Failed to fetch historical medical records.");
    } finally {
      setLoading(false);
    }
  };

  // Combine appointments and payments into unified chronological timeline events
  const timelineEvents = useMemo(() => {
    const events = [];

    appointments.forEach((appt) => {
      const date = appt.created_at ? new Date(appt.created_at) : new Date();
      events.push({
        id: `appt-${appt.id}`,
        type: "appointment",
        title: `Appointment #${appt.id} Scheduled`,
        subtitle: `Slot #${appt.slot_id} • Status: ${appt.status || "Booked"}`,
        date: date,
        amount: null,
        status: appt.status || "booked",
        raw: appt,
      });
    });

    payments.forEach((pay) => {
      const date = pay.created_at ? new Date(pay.created_at) : new Date(Date.now() - 3600000);
      events.push({
        id: `pay-${pay.id}`,
        type: "payment",
        title: `Diagnostic Payment Received`,
        subtitle: `Txn #${pay.id} • Appt #${pay.appointment_id || "Direct"}`,
        date: date,
        amount: pay.amount || 500,
        status: pay.payment_status || "paid",
        raw: pay,
      });
    });

    // Sort descending by date
    events.sort((a, b) => b.date - a.date);

    // Apply date filter
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    const thirtyDaysAgo = now - 30 * 86400000;

    return events.filter((ev) => {
      // Type filter
      if (typeFilter === "appointments" && ev.type !== "appointment") return false;
      if (typeFilter === "payments" && ev.type !== "payment") return false;

      // Date filter
      if (dateFilter === "7days" && ev.date.getTime() < sevenDaysAgo) return false;
      if (dateFilter === "30days" && ev.date.getTime() < thirtyDaysAgo) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          ev.title.toLowerCase().includes(query) ||
          ev.subtitle.toLowerCase().includes(query) ||
          ev.status.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [appointments, payments, dateFilter, typeFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <HistoryIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Patient History & Receipts
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive medical timeline of all appointments, lab slots, and payment transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history records..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Record Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "all" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-500"
                }`}
              >
                All Events
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("appointments")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "appointments" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-500"
                }`}
              >
                Appointments
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("payments")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "payments" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs" : "text-slate-500"
                }`}
              >
                Payments
              </button>
            </div>

            {/* Date Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { id: "7days", label: "Last 7 Days" },
                { id: "30days", label: "Last 30 Days" },
                { id: "all", label: "All Time" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setDateFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                    dateFilter === pill.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline UI */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : timelineEvents.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No history records found"
          description="There are no appointments or payments recorded within this selected timeframe."
          actionLabel="View All Time"
          onAction={() => {
            setDateFilter("all");
            setTypeFilter("all");
            setSearchTerm("");
          }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 space-y-8">
            {timelineEvents.map((event, idx) => {
              const isAppt = event.type === "appointment";
              const Icon = isAppt ? Calendar : CreditCard;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-6 sm:pl-8 group"
                >
                  {/* Node icon marker */}
                  <div
                    className={`absolute -left-3.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm ${
                      isAppt
                        ? "bg-blue-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Content card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              isAppt
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {event.type}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {event.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                          {event.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {event.subtitle}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 mt-2 sm:mt-0">
                        {event.amount !== null && (
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{event.amount.toLocaleString()}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            event.status === "paid" || event.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                              : event.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
