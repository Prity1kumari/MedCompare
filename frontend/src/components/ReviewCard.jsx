import React, { useState } from "react";
import { Star, ThumbsUp, CheckCircle2, User } from "lucide-react";

const ReviewCard = ({ review, labName }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || Math.floor(Math.random() * 5));
  const [hasVoted, setHasVoted] = useState(false);

  const ratingNumber = typeof review.rating === "number" ? review.rating : parseFloat(review.rating) || 5;

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpfulCount((prev) => prev + 1);
      setHasVoted(true);
    } else {
      setHelpfulCount((prev) => prev - 1);
      setHasVoted(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Reviewer Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {review.user_name ? review.user_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {review.user_name || `Patient #${review.user_id || "Verified"}`}
                </h4>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {labName ? `Visited ${labName}` : `Lab #${review.lab_id}`}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(ratingNumber)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
          "{review.comment || "Service was smooth, on-time report delivery and clean lab facilities."}"
        </p>
      </div>

      {/* Footer / Reactions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Reviewed recently</span>
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
            hasVoted
              ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
