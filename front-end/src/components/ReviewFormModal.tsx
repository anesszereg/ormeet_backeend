import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Valeurs de départ : renseignées en édition, vides à la création. */
  initialRating?: number;
  initialComment?: string;
  /** Édition d'un avis existant plutôt que création. */
  isEdit?: boolean;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

/**
 * Ajout et modification d'un avis, dans une seule pop-up : mêmes champs, même
 * design. En édition, « Enregistrer » ne s'active que si quelque chose a changé.
 */
const ReviewFormModal = ({
  isOpen,
  onClose,
  initialRating = 0,
  initialComment = '',
  isEdit = false,
  onSubmit,
}: ReviewFormModalProps) => {
  const { t } = useTranslation('attendee');
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialise à chaque ouverture, pour ne pas garder la saisie précédente.
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
      setHoverRating(0);
      setError(null);
    }
  }, [isOpen, initialRating, initialComment]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasChanged = rating !== initialRating || comment.trim() !== initialComment.trim();
  // Création : une note suffit. Édition : il faut une note ET une modification.
  const canSubmit = rating > 0 && (!isEdit || hasChanged);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(rating, comment.trim());
      onClose();
    } catch {
      setError(t('eventDetails.reviews.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-black mb-1">
          {isEdit ? t('eventDetails.reviews.editTitle') : t('eventDetails.reviews.addTitle')}
        </h2>
        <p className="text-sm text-[#4F4F4F] mb-5">
          {isEdit ? t('eventDetails.reviews.editSubtitle') : t('eventDetails.reviews.addSubtitle')}
        </p>

        {/* Note */}
        <label className="block text-sm font-medium text-black mb-2">
          {t('eventDetails.reviews.ratingLabel')} <span className="text-[#FF3425]">*</span>
        </label>
        <div className="flex items-center gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={t('eventDetails.reviews.rateStars', { count: star })}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={(hoverRating || rating) >= star ? '#FFA500' : 'none'} stroke="#FFA500" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* Commentaire */}
        <label className="block text-sm font-medium text-black mb-2">
          {t('eventDetails.reviews.commentLabel')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={t('eventDetails.reviews.commentPlaceholder')}
          className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] transition-all resize-none"
        />

        {error && <p className="mt-2 text-xs text-[#FF3425]">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-[#EEEEEE] text-[#4F4F4F] hover:text-black hover:border-gray-400 font-medium text-sm rounded-full transition-all cursor-pointer"
          >
            {t('eventDetails.reviews.cancelEdit')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSaving}
            className="flex-1 px-4 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
          >
            {isSaving
              ? t('eventDetails.reviews.saving')
              : isEdit
                ? t('eventDetails.reviews.save')
                : t('eventDetails.reviews.publish')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormModal;
