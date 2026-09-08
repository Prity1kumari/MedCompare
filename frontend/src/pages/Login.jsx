import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth, useToast } from "../hooks/useAuth";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both your email address and password.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), password, rememberMe);
      toast.success("Welcome back! Login successful.");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail[0]?.msg
        : detail || "Invalid email or password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Form Section */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                MedCompare
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Sign in to manage your medical tests, lab appointments, and savings.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember my credentials
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Create free account
              </Link>
            </p>
          </div>
        </div>

        {/* Right Feature Showcase Banner */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100">
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              Trusted Healthcare Aggregator
            </span>
            <h3 className="text-3xl font-extrabold mt-6 leading-snug">
              Compare 500+ diagnostic labs and save up to ₹1,500 per checkup.
            </h3>
            <p className="text-sm text-blue-100 mt-4 leading-relaxed">
              Join thousands of smart patients saving on pathology tests with 100% verified NABL reports and transparent price comparisons.
            </p>
          </div>

          <div className="relative z-10 space-y-3.5 pt-8">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span className="text-xs font-semibold">Free home blood collection across all partner labs</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span className="text-xs font-semibold">Fast digital reports delivered in 6-24 hours</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span className="text-xs font-semibold">Real-time price comparison with zero hidden fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;