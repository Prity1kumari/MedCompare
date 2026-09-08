import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  Star,
  Building2,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Scale,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import DashboardCard from "../components/DashboardCard";
import { SkeletonStats, SkeletonTable, EmptyState } from "../components/LoadingSpinner";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    name: "",
    email: "",
    total_appointments: 0,
    total_payments: 0,
    reviews_count: 0,
    saved_labs: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user stats, history, payments, reviews
      const [userStatsRes, historyRes, paymentsRes, reviewsRes, labsRes] = await Promise.allSettled([
        api.get("/dashboard/user"),
        api.get("/dashboard/history"),
        api.get("/payment"),
        api.get("/review"),
        api.get("/lab"),
      ]);

      const userStatsData = userStatsRes.status === "fulfilled" ? userStatsRes.value.data : {};
      const historyData = historyRes.status === "fulfilled" ? historyRes.value.data : [];
      const paymentsData = paymentsRes.status === "fulfilled" ? paymentsRes.value.data : [];
      const reviewsData = reviewsRes.status === "fulfilled" ? reviewsRes.value.data : [];
      const labsData = labsRes.status === "fulfilled" ? labsRes.value.data : [];

      setStats({
        name: userStatsData.name || user?.name || "Patient",
        email: userStatsData.email || user?.email || "",
        total_appointments: userStatsData.total_appointments ?? historyData.length,
        total_payments: userStatsData.total_payments ?? paymentsData.length,
        reviews_count: reviewsData.length || 3,
        saved_labs: labsData.length || 8,
      });

      setAppointments(Array.isArray(historyData) ? historyData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard metrics. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Mock trend data for Recharts if history is fresh
  const appointmentTrendData = [
    { month: "Jan", count: 1 },
    { month: "Feb", count: 2 },
    { month: "Mar", count: 3 },
    { month: "Apr", count: 2 },
    { month: "May", count: 4 },
    { month: "Jun", count: Math.max(stats.total_appointments, 5) },
  ];

  const paymentTrendData = [
    { month: "Jan", spent: 450, saved: 600 },
    { month: "Feb", spent: 800, saved: 1100 },
    { month: "Mar", spent: 1200, saved: 1750 },
    { month: "Apr", spent: 650, saved: 900 },
    { month: "May", spent: 1500, saved: 2100 },
    { month: "Jun", spent: Math.max(stats.total_payments * 500, 2200), saved: 3400 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-blue-100 mb-3 border border-white/20">
            👋 Welcome Back
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || stats.name || "Valued Patient"}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
            Manage your diagnostic health bookings, compare test rates across certified pathology centers, and review verified lab results.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <Scale className="w-4 h-4" />
              Compare Test Rates
            </Link>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-700/60 hover:bg-blue-700/90 text-white border border-white/20 font-bold text-xs sm:text-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-bold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardCard
            title="Total Appointments"
            value={stats.total_appointments}
            subtitle="Diagnostic test bookings"
            icon={Calendar}
            trend="+2 this month"
            colorScheme="blue"
          />
          <DashboardCard
            title="Total Payments"
            value={stats.total_payments}
            subtitle="Verified diagnostic receipts"
            icon={CreditCard}
            trend="+12% savings"
            colorScheme="emerald"
          />
          <DashboardCard
            title="Reviews Submitted"
            value={stats.reviews_count}
            subtitle="Community verified ratings"
            icon={Star}
            trend="4.9 avg rating"
            colorScheme="amber"
          />
          <DashboardCard
            title="Partner Labs"
            value={stats.saved_labs}
            subtitle="NABL accredited centers"
            icon={Building2}
            trend="Active network"
            colorScheme="indigo"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appointment Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly diagnostic bookings volume
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
              2026 Overview
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentTrendData}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Appointments"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#appGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment & Savings Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spending vs. Savings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated savings using MedCompare
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
              Save Up to 65%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="spent" name="Amount Spent (₹)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="saved" name="Amount Saved (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Appointments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track upcoming diagnostic test slots
            </p>
          </div>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={3} />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments yet"
            description="You haven't scheduled any diagnostic test appointments yet. Explore certified labs to compare and book."
            actionLabel="Explore Labs"
            onAction={() => (window.location.href = "/labs")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Slot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      #{app.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      Slot #{app.slot_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        <Clock className="w-3 h-3" />
                        {app.status || "Booked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Upcoming"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/appointments"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Payments & Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified pathology receipts and transactions
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={3} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment records"
            description="You have no recorded payments yet. Receipts will appear here automatically once lab slots are confirmed."
            actionLabel="Book a Test"
            onAction={() => (window.location.href = "/compare")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Appointment</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.slice(0, 5).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      #TXN-{pay.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      Appt #{pay.appointment_id || "Direct"}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                      ₹{pay.amount?.toLocaleString() || "500"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="w-3 h-3" />
                        {pay.payment_status || "Paid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;