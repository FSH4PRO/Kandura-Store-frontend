import { useState } from 'react';
import StarRating from './StarRating';
import { createReview } from '../services/reviews';
import { useToast } from '../context/useToast';

export default function ReviewForm({ orderId, existingReview, onSubmitted }) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const review = await createReview(orderId, { rating, comment });
      toast.success('Thank you for your review.');
      onSubmitted?.(review);
    } catch (err) {
      toast.error(err.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="field-label">Your rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="field-label">Comment (optional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Tell us about the fit, fabric, and finish…"
          className="field-input"
        />
      </div>
      <button type="submit" className="btn-dark" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
