import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

export const LoadingSpinner = ({ size = "md", text = "Loading details..." }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-blue-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer" />
        <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer" />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-shimmer" />
        <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
};

export const SkeletonStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-shimmer" />
            <div className="w-14 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-shimmer" />
          </div>
          <div className="w-20 h-7 rounded bg-slate-200 dark:bg-slate-800 animate-shimmer mb-2" />
          <div className="w-28 h-3 rounded bg-slate-200 dark:bg-slate-800 animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-shimmer" />
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-shimmer" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-1/3">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-shimmer" />
              <div className="space-y-1.5 flex-1">
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer" />
                <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer" />
              </div>
            </div>
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer" />
            <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full animate-shimmer" />
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = "No data found",
  description = "There are currently no records available to display.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl my-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default LoadingSpinner;
