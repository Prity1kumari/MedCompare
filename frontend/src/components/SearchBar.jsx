import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = "Search medical tests, labs, packages or cities...",
  showFilterBtn = false,
  onToggleFilter,
  filterActive = false,
  className = "",
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-4 pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-24 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm text-sm font-medium"
      />

      <div className="absolute right-3 flex items-center space-x-1.5">
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {showFilterBtn && (
          <button
            type="button"
            onClick={onToggleFilter}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              filterActive
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
