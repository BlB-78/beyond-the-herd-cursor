import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Star } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { getCourse, getReviews, getMyCourses, enroll, addReview } from '../lib/data';
import { PaymentMethodModal } from '../components/PaymentMethodModal';

export function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    getCourse(id)
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch(console.error);

    fetchReviews();

    if (user) {
      getMyCourses()
        .then((res) => setEnrolledCourses(res || []))
        .catch(console.error);
    }
  }, [id, user?.id]);

  const fetchReviews = () => {
    if (!id) return;
    getReviews(id)
      .then((res) => setReviews(res || []))
      .catch(console.error);
  };

  const isEnrolled = enrolledCourses.some((c) => c.id === id);
  const price = Number(course?.price ?? 0);

  const handleEnrollClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || !course) return;

    setCheckoutError('');

    if (price <= 0) {
      await executeEnrollment();
      return;
    }

    setShowPaymentModal(true);
  };

  const executeEnrollment = async () => {
    if (!id) return;
    setEnrolling(true);
    try {
      await enroll(id);
      navigate(`/learn/${id}/lesson`);
    } catch (err) {
      console.error(err);
      setCheckoutError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !id || !user) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      await addReview(id, reviewRating, reviewComment, user.name);
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
      getCourse(id).then((c) => {
        if (c) setCourse(c);
      });
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Course not found.
      </div>
    );
  }

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          className={i <= Math.round(rating) ? '' : 'text-gray-600'}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="bg-zinc-950 border-b border-gray-800 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-yellow-500 font-medium mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-yellow-500" />
              {course.instructor}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              {renderStars(course.avg_rating || 0)}
              <span className="text-gray-400 text-sm ml-2">
                {Number(course.avg_rating || 0).toFixed(1)} ({course.review_count || 0} reviews)
              </span>
            </div>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">{course.description}</p>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{checkoutError}</div>
            )}

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">
                  {price <= 0 ? 'Free' : `$${price}`}
                </span>
                {price > 0 && <span className="text-sm text-gray-500">One-time payment</span>}
              </div>
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/learn/${course.id}/lesson`)}
                  className="bg-white text-black px-8 py-4 rounded-md font-bold hover:bg-gray-200 transition-colors"
                >
                  Continue Course
                </button>
              ) : (
                <button
                  onClick={handleEnrollClick}
                  disabled={enrolling}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-md font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling…' : price > 0 ? 'Buy & Enroll' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-blue-500/5 blur-3xl transform -rotate-6 rounded-3xl" />
            <img
              src={course.image_url}
              alt={course.title}
              className="relative rounded-2xl border border-white/10 shadow-2xl w-full object-cover aspect-video"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-display font-bold mb-10">Course Curriculum</h2>
          <div className="space-y-6">
            {course.sections?.map((section: { id: string; title: string; lessons?: { id: string; title: string; duration: string }[] }) => (
              <div key={section.id} className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 bg-zinc-950 border-b border-white/5">
                  <h3 className="font-bold text-lg">{section.title}</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {section.lessons?.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 pl-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <PlayCircle size={18} className="text-gray-500" />
                        <span className="text-gray-300">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        {lesson.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-display font-bold mb-10">Student Reviews</h2>

          {isEnrolled && (
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 mb-8">
              <h3 className="font-bold mb-4">Leave a Review</h3>
              {reviewError && (
                <div className="text-red-500 text-sm mb-4 bg-red-500/10 p-2 rounded">{reviewError}</div>
              )}
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button type="button" key={i} onClick={() => setReviewRating(i)} className="focus:outline-none">
                        <Star
                          size={24}
                          fill={i <= reviewRating ? 'currentColor' : 'none'}
                          className={i <= reviewRating ? 'text-yellow-500' : 'text-gray-600'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Review</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full bg-black border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="What did you think of this course?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-white text-black px-6 py-2 rounded-md font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review: { id: string; user_name: string; created_at: string; rating: number; comment: string }) => (
                <div key={review.id} className="border-b border-white/10 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{review.user_name}</div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-3">{renderStars(review.rating)}</div>
                  <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        courseId={id!}
        courseTitle={course.title}
        priceUsd={price}
        dzdEstimate={Math.round(
          price * Number(import.meta.env.VITE_CHARGILY_DZD_PER_USD || 135)
        )}
      />
    </div>
  );
}
