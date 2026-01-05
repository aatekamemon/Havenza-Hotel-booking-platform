import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import adminApi from "../../utils/adminApi";

const ReviewsManagement = () => {
  const [reviewsByHotel, setReviewsByHotel] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.get("/reviews/all");
      
      if (data.success) {
        setReviewsByHotel(data.reviewsByHotel);
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

  const updateReviewApproval = async (reviewId, isApproved) => {
    try {
      const { data } = await adminApi.put(`/reviews/${reviewId}/approval`, { isApproved });
      
      if (data.success) {
        toast.success(data.message);
        fetchAllReviews(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Update review error:", error);
      toast.error(error.response?.data?.message || "Failed to update review");
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const { data } = await adminApi.delete(`/reviews/${reviewId}`);
      
      if (data.success) {
        toast.success(data.message);
        fetchAllReviews(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Delete review error:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
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

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const hotelEntries = Object.entries(reviewsByHotel);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-playfair font-bold text-gray-800 mb-2">
          Reviews Management
        </h1>
        <p className="text-gray-600">
          Manage all customer reviews across all hotels
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-500">Loading reviews...</div>
        </div>
      ) : hotelEntries.length === 0 ? (
        <div className="text-center py-12">
          <img src={assets.starIconOutlined} alt="No Reviews" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Reviews Found</h3>
          <p className="text-gray-600">
            No reviews have been submitted yet across all hotels.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <img src={assets.homeIcon} alt="Hotels" className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Hotels with Reviews</p>
                  <p className="text-2xl font-bold text-gray-800">{hotelEntries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <img src={assets.starIconFilled} alt="Reviews" className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {hotelEntries.reduce((sum, [, hotelData]) => sum + hotelData.totalReviews, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <img src={assets.badgeIcon} alt="Average" className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Overall Average</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {hotelEntries.length > 0 
                      ? (hotelEntries.reduce((sum, [, hotelData]) => sum + parseFloat(hotelData.averageRating), 0) / hotelEntries.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hotels List */}
          <div className="space-y-6">
            {hotelEntries.map(([hotelId, hotelData]) => (
              <div key={hotelId} className="bg-white rounded-lg border shadow-sm">
                {/* Hotel Header */}
                <div 
                  className="p-6 border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedHotel(selectedHotel === hotelId ? null : hotelId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {hotelData.hotel.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {hotelData.hotel.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {renderStars(Math.round(hotelData.averageRating))}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {hotelData.averageRating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {hotelData.totalReviews} review{hotelData.totalReviews !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews List (Collapsible) */}
                {selectedHotel === hotelId && (
                  <div className="divide-y">
                    {hotelData.reviews.map((review) => (
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
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    review.isApproved 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {review.isApproved ? 'Approved' : 'Pending'}
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
                            <p className="text-gray-700 leading-relaxed mb-3">
                              {review.comment}
                            </p>

                            {/* Booking Info */}
                            {review.booking && (
                              <div className="text-xs text-gray-500 mb-3">
                                Stay: {new Date(review.booking.checkInDate).toLocaleDateString()} - {new Date(review.booking.checkOutDate).toLocaleDateString()}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateReviewApproval(review._id, !review.isApproved)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                  review.isApproved
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {review.isApproved ? 'Disapprove' : 'Approve'}
                              </button>
                              <button
                                onClick={() => deleteReview(review._id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;
