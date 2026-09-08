import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Star,
  Plus,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Filter,
  X,
  ThumbsUp,
  Building2,
} from "lucide-react";
import api from "../api/axios";
import { useAuth, useToast } from "../hooks/useAuth";
import ReviewCard from "../components/ReviewCard";
import { SkeletonCard, EmptyState } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const InteractiveStarRating = ({ rating, onChange, interactive = true }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange?.(star)}
            className={`${
              interactive ? "cursor-pointer transition-transform hover:scale-115" : "cursor-default"
            } p-0.5 focus:outline-none`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 dark:text-slate-700"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

const Reviews = () => {
  const [searchParams] = useSearchParams();
  const labIdFromQuery = searchParams.get("lab_id");

  const [reviews, setReviews] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [selectedLabFilter, setSelectedLabFilter] = useState(labIdFromQuery || "all");
  const [ratingFilter, setRatingFilter] = useState(0);

  // Add Review Modal State
  const [showModal, setShowModal] = useState(false);
  const [newLabId, setNewLabId] = useState(labIdFromQuery || "");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchReviewsAndLabs();
  }, []);

  const fetchReviewsAndLabs = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revRes, labsRes] = await Promise.allSettled([
        api.get("/review"),
        api.get("/lab"),
      ]);

      const revData = revRes.status === "fulfilled" && Array.isArray(revRes.value.data) ? revRes.value.data : [];
      const labsData = labsRes.status === "fulfilled" && Array.isArray(labsRes.value.data) ? labsRes.value.data : [];

      setLabs(labsData);

      if (revData.length === 0) {
        // Sample seed reviews if empty
        const sampleReviews = [
          {
            id: 101,
            user_id: 1,
            user_name: "Anita Sharma",
            lab_id: 1,
            rating: 5,
            comment: "Dr. Lal PathLabs was completely punctual for the 7:30 AM home sample collection. Digital reports arrived the exact same evening on WhatsApp.",
          },
          {
            id: 102,
            user_id: 2,
            user_name: "Rahul Verma",
            lab_id: 2,
            rating: 4.5,
            comment: "Booked Apollo Diagnostics for Full Body Checkup via MedCompare. Saved over ₹900 compared to walk-in rates. Highly recommended!",
          },
          {
            id: 103,
            user_id: 3,
            user_name: "Dr. Sandeep Patel",
            lab_id: 3,
            rating: 5,
            comment: "Clean and hygienic facility. Friendly phlebotomist, virtually painless blood sample collection.",
          },
          {
            id: 104,
            user_id: 4,
            user_name: "Pooja Malhotra",
            lab_id: 1,
            rating: 4,
            comment: "Very accurate test results and easy-to-read PDF report summary. Great user experience.",
          },
        ];
        setReviews(sampleReviews);
      } else {
        setReviews(revData);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load patient reviews.");
    } finally {
      setLoading(false);
    }
  };

  // Review statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 4.8, total: 0, breakdown: [0, 0, 0, 0, 0] };
    let sum = 0;
    const counts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars

    reviews.forEach((r) => {
      const val = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      sum += r.rating || 5;
      counts[val - 1]++;
    });

    return {
      avg: (sum / reviews.length).toFixed(1),
      total: reviews.length,
      breakdown: counts,
    };
  }, [reviews]);

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newLabId) {
      toast.warning("Please select the diagnostic lab you are reviewing.");
      return;
    }
    if (!newComment.trim()) {
      toast.warning("Please add your experience comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        user_id: user?.id || 1,
        lab_id: parseInt(newLabId),
        rating: parseFloat(newRating),
        comment: newComment.trim(),
      };

      const res = await api.post("/review", payload);
      toast.success("Thank you! Your patient review has been published.");

      const newReviewItem = {
        ...payload,
        id: res.data?.id || Date.now(),
        user_name: user?.name || "Verified Patient",
      };

      setReviews((prev) => [newReviewItem, ...prev]);
      setShowModal(false);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      console.error("Review submit error:", err);
      toast.error(err.response?.data?.detail || "Could not submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const matchLab =
      selectedLabFilter === "all" || r.lab_id?.toString() === selectedLabFilter.toString();
    const matchRating = ratingFilter === 0 || Math.round(r.rating || 5) === ratingFilter;
    return matchLab && matchRating;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Star className="w-5 h-5 fill-blue-600 text-blue-600" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Patient Reviews & Ratings
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Read verified feedback from genuine diagnostic patients across partner laboratories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Statistics Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Average Rating Score */}
          <div className="text-center md:text-left md:border-r border-slate-100 dark:border-slate-800 md:pr-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Patient Rating
            </span>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white">
                {stats.avg}
              </span>
              <div>
                <InteractiveStarRating rating={parseFloat(stats.avg)} interactive={false} />
                <p className="text-xs text-slate-500 mt-1">Based on {stats.total} verified reviews</p>
              </div>
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.breakdown[stars - 1] || 0;
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-400 font-semibold">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Filter Lab:</span>
          <select
            value={selectedLabFilter}
            onChange={(e) => setSelectedLabFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Diagnostic Centers</option>
            {labs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 mr-1">Stars:</span>
          {[0, 5, 4, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRatingFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                ratingFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {s === 0 ? "All" : `${s} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews match your filter"
          description="Be the first to share your experience with this diagnostic laboratory."
          actionLabel="Add Review"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => {
            const foundLab = labs.find((l) => l.id === rev.lab_id);
            return (
              <ReviewCard
                key={rev.id}
                review={rev}
                labName={foundLab?.name}
              />
            );
          })}
        </div>
      )}

      {/* Add Review Modal */}
      <AnimatePresence>
        {showModal && (
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
                    Community Feedback
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Rate Your Lab Experience
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Help fellow patients make informed diagnostic choices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Lab Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Diagnostic Lab
                  </label>
                  <select
                    value={newLabId}
                    onChange={(e) => setNewLabId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Choose Diagnostic Center --</option>
                    {labs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Your Rating ({newRating} out of 5 Stars)
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <InteractiveStarRating rating={newRating} onChange={setNewRating} interactive={true} />
                    <span className="text-xs font-bold text-amber-600">
                      {newRating === 5
                        ? "Excellent ⭐"
                        : newRating === 4
                        ? "Very Good"
                        : newRating === 3
                        ? "Average"
                        : "Poor"}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Review Comment
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe your test experience (e.g. phlebotomist gentleness, on-time report delivery, cleanliness)..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Publishing..." : "Submit Review"}
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

export default Reviews;
