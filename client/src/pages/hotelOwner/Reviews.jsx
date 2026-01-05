import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const Reviews = () => {
  const { getToken, axios } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const fetchOwnerReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/reviews/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        setReviews(data.reviews);
        calculateStats(data.reviews);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Fetch reviews error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const totalReviews = reviewsData.length;
    if (totalReviews === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    setStats({
      totalReviews,
      averageRating,
      ratingDistribution
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <img
        key={index}
        src={index < rating ? assets.starIconFilled : assets.starIconOutlined}
        alt="Star"
        className="w-4 h-4"
      />
    ));
  };

  const getRatingPercentage = (rating) => {
    return stats.totalReviews > 0 ? ((stats.ratingDistribution[rating] / stats.totalReviews) * 100).toFixed(1) : 0;
  };

  useEffect(() => {
    fetchOwnerReviews();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-playfair font-bold text-gray-800 mb-2">
          Customer Reviews
        </h1>
        <p className="text-gray-600">
          Manage and view all reviews for your hotel
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-500">Loading reviews...</div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Reviews */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <img src={assets.starIconFilled} alt="Reviews" className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalReviews}</p>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <img src={assets.badgeIcon} alt="Rating" className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-800">{stats.averageRating}</p>
                    <div className="flex">
                      {renderStars(Math.round(stats.averageRating))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{rating}</span>
                    <img src={assets.starIconFilled} alt="Star" className="w-3 h-3" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-xs text-gray-500">
                      {getRatingPercentage(rating)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <img src={assets.starIconOutlined} alt="No Reviews" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Your hotel hasn't received any reviews yet. Encourage guests to leave reviews after their stay.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-800">All Reviews</h2>
              </div>
              <div className="divide-y">
                {reviews.map((review) => (
                  <div key={review._id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.user?.image ? (
                          <img
                            src={review.user.image}
                            alt={review.user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <img src={assets.userIcon} alt="User" className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {review.user?.username || "Anonymous"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-600">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {review.room?.roomType}
                            </p>
                          </div>
                        </div>

                        {/* Review Content */}
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>

                        {/* Booking Info */}
                        {review.booking && (
                          <div className="mt-3 text-xs text-gray-500">
                            Stay: {new Date(review.booking.checkInDate).toLocaleDateString()} - {new Date(review.booking.checkOutDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;
