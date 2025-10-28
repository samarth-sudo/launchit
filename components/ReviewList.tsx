'use client';

import { useEffect, useState } from 'react';

interface Review {
  review_rating: number;
  review_text: string | null;
  reviewed_at: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  reputation_score: number;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?product_id=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(data.average_rating || 0);
        setReviewCount(data.review_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-500">
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const getReputationBadge = (score: number) => {
    if (score >= 100) return { label: 'Elite', color: 'bg-purple-100 text-purple-800' };
    if (score >= 50) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' };
    if (score >= 20) return { label: 'Pro', color: 'bg-green-100 text-green-800' };
    return { label: 'Member', color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      {reviewCount > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-black">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">out of 5</div>
            </div>
            <div className="flex-1">
              {renderStars(Math.round(averageRating))}
              <p className="text-sm text-gray-600 mt-2">
                Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const badge = getReputationBadge(review.reputation_score);
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                {/* Reviewer Info */}
                <div className="flex items-start gap-4 mb-4">
                  {review.reviewer_avatar ? (
                    <img
                      src={review.reviewer_avatar}
                      alt={review.reviewer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                      {review.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {review.reviewer_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(review.review_rating)}
                      <span className="text-sm text-gray-500">
                        {formatDate(review.reviewed_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                {review.review_text && (
                  <p className="text-gray-700 leading-relaxed">
                    {review.review_text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
