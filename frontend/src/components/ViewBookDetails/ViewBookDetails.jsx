import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GrLanguage } from "react-icons/gr";
import { FaHeart, FaShoppingCart, FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { FiThumbsUp, FiAlertCircle, FiPackage, FiInfo } from "react-icons/fi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import StarRating from "../StarRating/StarRating";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const ViewBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSort, setReviewSort] = useState("newest");
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);

  // ── Fetch book ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/api/v1/get-book-by-id/${id}`);
        setData(response.data.data);
      } catch {
        toast.error("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // ── Fetch reviews ───────────────────────────────────────────────────────────
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/api/v1/get-reviews/${id}?sort=${reviewSort}`);
      setReviews(res.data.data || []);
    } catch {
      // Silent — reviews are non-critical
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [id, reviewSort]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleFavorite = async () => {
    try {
      const res = await api.put("/api/v1/add-book-to-favorite", {}, { headers: { bookid: id } });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update favorites");
    }
  };

  const handleCart = async () => {
    try {
      const res = await api.put("/api/v1/add-to-cart", {}, { headers: { bookid: id } });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const deleteBook = async () => {
    if (!window.confirm(`Delete "${data?.title}"? This cannot be undone.`)) return;
    try {
      await api.delete("/api/v1/delete-book", { headers: { bookid: id } });
      toast.success("Book deleted");
      navigate("/all-books");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete book");
    }
  };

  const submitReview = async () => {
    if (myRating === 0) { toast.error("Please select a rating"); return; }
    setSubmittingReview(true);
    try {
      if (editingReview) {
        await api.put(`/api/v1/update-review/${editingReview._id}`, { rating: myRating, comment: myComment });
        toast.success("Review updated!");
        setEditingReview(null);
      } else {
        await api.post(`/api/v1/add-review/${id}`, { rating: myRating, comment: myComment });
        toast.success("Review added!");
      }
      setMyRating(0);
      setMyComment("");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/v1/delete-review/${reviewId}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!isLoggedIn) { toast.error("Please sign in to like reviews"); return; }
    try {
      const res = await api.put(`/api/v1/like-review/${reviewId}`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, likesCount: res.data.likesCount, liked: res.data.liked } : r
        )
      );
    } catch {
      toast.error("Failed to like review");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white dark:bg-zinc-900 flex items-center justify-center transition-colors">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500 text-2xl font-bold">Book not found.</p>
      </div>
    );
  }

  const stockBadge = data.stock === 0
    ? <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/50 px-3 py-1 rounded-full font-bold">Sold Out</span>
    : data.stock <= 5
    ? <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 px-3 py-1 rounded-full font-bold italic animate-pulse">Only {data.stock} left!</span>
    : null;

  const myUserId = localStorage.getItem("id");
  const myExistingReview = reviews.find((r) => r.user?._id === myUserId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-zinc-900 min-h-screen transition-colors duration-300"
    >
      {/* ── Book Detail Panel ─────────────────────────────────────── */}
      <div className="px-4 md:px-12 py-12 flex flex-col lg:flex-row gap-12 items-start max-w-7xl mx-auto">
        {/* Left: Image + Actions */}
        <div className="w-full lg:w-2/5 sticky top-24">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            <img
              src={data.url}
              alt={data.title}
              className="w-full max-h-[70vh] rounded-3xl object-cover shadow-2xl relative z-10 border border-zinc-100 dark:border-zinc-800"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 bg-white dark:bg-zinc-800 p-3 rounded-full shadow-2xl border border-zinc-100 dark:border-zinc-700"
            >
              {isLoggedIn && role === "user" && (
                <>
                  <ActionBtn onClick={handleFavorite} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20 hover:scale-110" aria="Add to favorites">
                    <FaHeart size={20} />
                  </ActionBtn>
                  <ActionBtn onClick={handleCart} color="text-white" bg="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full" aria="Add to cart">
                    <div className="flex items-center gap-2">
                       <FaShoppingCart size={18} />
                       <span className="text-sm font-bold">Add to Cart</span>
                    </div>
                  </ActionBtn>
                </>
              )}
              {isLoggedIn && role === "admin" && (
                <>
                  <Link
                    to={`/updateBook/${id}`}
                    className="p-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-full hover:scale-110 transition-all shadow"
                    aria-label="Edit book"
                  >
                    <FaEdit size={22} />
                  </Link>
                  <ActionBtn onClick={deleteBook} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20 hover:scale-110" aria="Delete book">
                    <MdOutlineDelete size={24} />
                  </ActionBtn>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Right: Book Info */}
        <div className="w-full lg:w-3/5">
          <motion.div
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="space-y-6"
          >
            {/* Genre chips */}
            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g) => (
                  <span key={g} className="text-[10px] uppercase tracking-widest font-black bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-700/50 px-4 py-1.5 rounded-full transition-colors">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-4xl md:text-6xl text-zinc-900 dark:text-zinc-100 font-black leading-tight">{data.title}</h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 mt-2 font-medium">by <span className="text-blue-600 dark:text-blue-400 italic underline underline-offset-4 cursor-pointer">{data.author}</span></p>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-4 py-4 border-y border-zinc-100 dark:border-zinc-800">
              <StarRating value={data.averageRating || 0} readonly size="text-xl" />
              <div className="flex flex-col">
                <span className="text-zinc-900 dark:text-zinc-100 font-black text-lg">
                  {data.averageRating > 0 ? data.averageRating.toFixed(1) : "0.0"} <span className="text-zinc-400 font-normal">/ 5</span>
                </span>
                <span className="text-zinc-400 text-xs font-semibold uppercase tracking-tighter">
                  {data.ratingsCount || 0} Customer Reviews
                </span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700/50">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                Storyline
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">{data.desc}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <InfoCard icon={<GrLanguage className="text-blue-500" />} label="Language" value={data.language} />
               {data.isbn && <InfoCard icon={<FiAlertCircle className="text-amber-500" />} label="ISBN" value={data.isbn} />}
               <InfoCard icon={<FiPackage className="text-green-500" />} label="Status" value={data.stock > 0 ? "In Stock" : "Unavailable"} />
            </div>

            <div className="flex items-center gap-6 pt-4">
              <p className="text-zinc-900 dark:text-zinc-100 text-5xl font-black">₹{data.price}</p>
              {stockBadge}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Reviews Section ───────────────────────────────────────── */}
      <div className="px-4 md:px-12 py-16 max-w-7xl mx-auto border-t border-zinc-100 dark:border-zinc-800">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-10 flex items-center gap-4 italic">
          Reader Insights
          <span className="h-0.5 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full not-italic"></span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Review Submission */}
          <div className="lg:col-span-5">
            {isLoggedIn ? (
              role === "user" ? (
                (!myExistingReview || editingReview) ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-zinc-50 dark:bg-zinc-800/30 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-700/50 sticky top-24"
                  >
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-6">
                      {editingReview ? "Edit Your Review" : "Share Your Thoughts"}
                    </h3>
                    
                    <div className="mb-6">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Your Rating</p>
                      <StarRating value={myRating} onChange={setMyRating} size="text-3xl" />
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Your Perspective</p>
                      <textarea
                        className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 rounded-2xl outline-none border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 transition-all min-h-[120px] resize-none font-medium"
                        placeholder="What did you love (or not so much) about this masterpiece?"
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={submitReview}
                        disabled={submittingReview}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {submittingReview ? "Archiving..." : (editingReview ? "Apply Changes" : "Post Review")}
                      </button>
                      {editingReview && (
                        <button
                          onClick={() => { setEditingReview(null); setMyRating(0); setMyComment(""); }}
                          className="px-6 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold rounded-2xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[32px] border border-blue-100 dark:border-blue-800 text-center">
                    <p className="text-blue-700 dark:text-blue-400 font-bold">You've shared your insights on this book.</p>
                    <p className="text-blue-600/60 dark:text-blue-400/60 text-sm mt-1">Thank you for contributing to the community!</p>
                  </div>
                )
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-8 rounded-[32px] text-center border border-dashed border-zinc-300 dark:border-zinc-700">
                  <p className="text-zinc-500 font-bold italic line-through opacity-50 text-sm mb-2">Review unavailable</p>
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Admins moderate, readers review.</p>
                </div>
              )
            ) : (
              <div className="bg-zinc-100 dark:bg-zinc-800/50 p-8 rounded-[32px] text-center">
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg mb-4">Sign in to share your journey.</p>
                <Link to="/LogIn" className="inline-block px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-full hover:scale-105 transition-all">
                  Access Portal
                </Link>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-500 uppercase tracking-widest">{reviews.length} Reviews</h3>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-bold outline-none border-b-2 border-blue-600 pb-1 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="top">Top Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {reviewsLoading ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((r) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <ReviewCard
                        review={r}
                        myUserId={myUserId}
                        isAdmin={role === "admin"}
                        onLike={handleLikeReview}
                        onDelete={handleDeleteReview}
                        onEdit={(rev) => {
                          setEditingReview(rev);
                          setMyRating(rev.rating);
                          setMyComment(rev.comment);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[32px]">
                    <p className="text-zinc-400 font-black italic text-lg">Silence is poetic, but reviews are better.</p>
                    <p className="text-zinc-400/60 text-sm mt-1">Be the first to break the silence!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700 flex items-center gap-3 shadow-sm group hover:border-blue-500/30 transition-all">
    <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm truncate">{value}</p>
    </div>
  </div>
);

const ActionBtn = ({ onClick, color, bg, aria, children }) => (
  <button
    onClick={onClick}
    className={`${bg} ${color} p-4 rounded-full text-2xl shadow hover:scale-105 transition-all duration-200`}
    aria-label={aria}
  >
    {children}
  </button>
);

const ReviewCard = ({ review, myUserId, isAdmin, onLike, onDelete, onEdit }) => {
  const isOwner = review.user?._id === myUserId;
  const timeAgo = new Date(review.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={review.user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt={review.user?.username}
              loading="lazy"
              className="w-12 h-12 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-700 shadow-sm"
            />
            {isOwner && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-800"></div>}
          </div>
          <div>
            <p className="text-zinc-900 dark:text-zinc-100 font-black text-base">{review.user?.username}</p>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{timeAgo}</p>
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-inner">
          <StarRating value={review.rating} readonly size="text-xs" />
        </div>
      </div>

      {review.comment && (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium mb-6">
          {review.comment}
        </p>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-900">
        <button
          onClick={() => onLike(review._id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
            review.liked 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-blue-600"
          }`}
        >
          <FiThumbsUp size={14} className={review.liked ? "fill-white" : ""} />
          {review.likesCount || 0} Helpful
        </button>

        <div className="flex items-center gap-2">
          {(isOwner || isAdmin) && (
            <>
              {isOwner && (
                <button
                  onClick={() => onEdit(review)}
                  className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl hover:scale-110 transition-all shadow-sm"
                  title="Edit Review"
                >
                  <FaEdit size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(review._id)}
                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:scale-110 transition-all shadow-sm"
                title="Delete Review"
              >
                <MdOutlineDelete size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBookDetails;