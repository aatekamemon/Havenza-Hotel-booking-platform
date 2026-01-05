import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, booking, onReviewSuccess }) => {
  const { getToken, axios } = useAppContext();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/reviews/create",
        {
          bookingId: booking._id,
          rating,
          comment: comment.trim()
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` }
        }
      );

      if (data.success) {
        toast.success("Review submitted successfully!");
        onReviewSuccess();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Review submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur bg-gray-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-playfair font-bold text-gray-800">
            Write a Review
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <img src={assets.closeIcon} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-4">
            <img
              src={(booking.room?.images && booking.room.images[0]) || assets.roomImg1}
              alt="Room"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-800">
                {booking.hotel?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {booking.room?.roomType}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(booking.checkInDate).toDateString()} - {new Date(booking.checkOutDate).toDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors"
                >
                  <img
                    src={star <= rating ? assets.starIconFilled : assets.starIconOutlined}
                    alt="Star"
                    className="w-6 h-6"
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                ({rating} star{rating !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience about this hotel..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="1000"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
