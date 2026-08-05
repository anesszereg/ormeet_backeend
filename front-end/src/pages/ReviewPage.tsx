import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import EventDetailsNavbar from "../components/EventDetailsNavbar";
import reviewService from "../services/reviewService";
import eventService, { Event as ApiEvent } from "../services/eventService";

const ReviewPage = () => {
  const { t } = useTranslation("attendee");
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (eventId) {
      eventService
        .getEventById(eventId)
        .then((e: ApiEvent) => setEventTitle(e.title))
        .catch(() => {});
    }
  }, [eventId, user, navigate]);

  const handleSubmit = async () => {
    if (!user || !eventId) return;
    if (rating === 0) {
      setError(t("review.validation.ratingRequired", "Please select a rating"));
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await reviewService.create({ eventId, userId: user.id, rating, comment });
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t("review.error", "Failed to submit review. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-white">
        <EventDetailsNavbar isLoggedIn={!!user} />
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            {t("review.successTitle", "Review Submitted!")}
          </h2>
          <p className="text-[#757575] text-sm mb-8 text-center max-w-sm">
            {t(
              "review.successMessage",
              "Thank you for your feedback. Your review is now visible on the event page.",
            )}
          </p>
          <button
            onClick={() => navigate(`/event/${eventId}`)}
            className="px-8 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
          >
            {t("review.backToEvent", "Back to Event")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <EventDetailsNavbar isLoggedIn={!!user} />

      <main className="flex-1 px-4 md:px-8 lg:px-12 xl:px-16 py-10">
        <div className="max-w-xl mx-auto">
          {/* Back link */}
          <button
            onClick={() => navigate(`/event/${eventId}`)}
            className="flex items-center gap-2 text-sm text-[#757575] hover:text-black transition-colors mb-8"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("review.backToEvent", "Back to Event")}
          </button>

          <h1 className="text-2xl font-bold text-black mb-1">
            {t("review.title", "Write a Review")}
          </h1>
          {eventTitle && (
            <p className="text-sm text-[#757575] mb-8">{eventTitle}</p>
          )}

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-3">
              {t("review.ratingLabel", "Your Rating")}{" "}
              <span className="text-[#FF4000]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 cursor-pointer"
                  aria-label={`${star} star`}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill={(hoverRating || rating) >= star ? "#FFA500" : "none"}
                    stroke={
                      (hoverRating || rating) >= star ? "#FFA500" : "#D1D5DB"
                    }
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-[#757575] ms-2">
                  {
                    [
                      t("review.rating.terrible", "Terrible"),
                      t("review.rating.bad", "Bad"),
                      t("review.rating.okay", "Okay"),
                      t("review.rating.good", "Good"),
                      t("review.rating.excellent", "Excellent"),
                    ][rating - 1]
                  }
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-3">
              {t("review.commentLabel", "Your Review")}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder={t(
                "review.commentPlaceholder",
                "Share your experience with this event...",
              )}
              className="w-full px-4 py-3 border border-[#EEEEEE] rounded-xl text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all resize-none"
            />
            <p className="text-xs text-[#BCBCBC] mt-1 text-end">
              {comment.length}/500
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/event/${eventId}`)}
              className="flex-1 px-6 py-3 border border-[#EEEEEE] text-black text-sm font-medium rounded-full hover:bg-[#F8F8F8] transition-colors"
            >
              {t("review.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-6 py-3 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t("review.submitting", "Submitting...")
                : t("review.submit", "Submit Review")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
