import React from "react";
import { Calendar, Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, FileText, Ban } from "lucide-react";

const AppointmentCard = ({ appointment, onCancel, cancellingId }) => {
  const isCancelled = appointment.status?.toLowerCase() === "cancelled";
  const isCompleted = appointment.status?.toLowerCase() === "completed";
  const isBooked = !isCancelled && !isCompleted;

  const isCurrentCancelling = cancellingId === appointment.id;

  const statusBadges = {
    booked: {
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      icon: Clock,
      label: "Confirmed / Upcoming",
    },
    completed: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
      label: "Completed",
    },
    cancelled: {
      bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
      icon: XCircle,
      label: "Cancelled",
    },
  };

  const currentBadge = statusBadges[appointment.status?.toLowerCase()] || statusBadges.booked;
  const BadgeIcon = currentBadge.icon;

  // Format date nicely
  const formattedDate = appointment.created_at
    ? new Date(appointment.created_at).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Scheduled";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Top bar with ID and status */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            Booking ID: #{appointment.id}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentBadge.bg}`}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            {currentBadge.label}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Date & Slot</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {formattedDate} • Slot #{appointment.slot_id}
              </h4>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Testing Center</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {appointment.lab_name || `Partner Diagnostic Lab (ID: ${appointment.lab_id || "Direct"})`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {appointment.lab_address || "Free home sample collection or walk-in test"}
              </p>
            </div>
          </div>

          {/* Test Preparation Note */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Preparation: 10-12 hrs fasting recommended for fasting blood tests.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <FileText className="w-3.5 h-3.5" />
          Receipt Slip
        </button>

        {isBooked && (
          <button
            type="button"
            disabled={isCurrentCancelling}
            onClick={() => onCancel(appointment.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition disabled:opacity-50"
          >
            <Ban className="w-3.5 h-3.5" />
            {isCurrentCancelling ? "Cancelling..." : "Cancel Slot"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
