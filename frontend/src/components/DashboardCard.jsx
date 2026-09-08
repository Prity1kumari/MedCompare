import React from "react";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = "blue",
}) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/40",
      glow: "group-hover:shadow-blue-500/10",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/40",
      glow: "group-hover:shadow-emerald-500/10",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/40",
      glow: "group-hover:shadow-indigo-500/10",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/40",
      glow: "group-hover:shadow-amber-500/10",
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md ${scheme.glow} transition-all relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${scheme.bg} ${scheme.text} transition-transform group-hover:scale-110 duration-200`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {trend && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h4>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardCard;
