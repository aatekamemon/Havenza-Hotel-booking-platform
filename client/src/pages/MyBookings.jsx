import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext.jsx";
import toast from "react-hot-toast";
import CancelBookingModal from "../components/CancelBookingModal";
import ReviewModal from "../components/ReviewModal";


// Load Stripe once

const MyBookings = () => {
  const { user, getToken, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewStatuses, setReviewStatuses] = useState({});

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        console.log("Bookings fetched:", data.bookings);
        const bookingsArray = Array.isArray(data.bookings) ? data.bookings : [];
        setBookings(bookingsArray);
        
        // Check review status for each completed booking
        const reviewChecks = bookingsArray
          .filter(booking => booking.status === "completed" || isCheckoutCompleted(booking.checkOutDate))
          .map(async (booking) => {
            try {
              const reviewData = await axios.get(`/api/reviews/check/${booking._id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` },
              });
              return { bookingId: booking._id, hasReview: reviewData.data.hasReview };
            } catch (error) {
              console.log(`Error checking review for booking ${booking._id}:`, error);
              return { bookingId: booking._id, hasReview: false };
            }
          });
        
        const reviewResults = await Promise.all(reviewChecks);
        const reviewStatusMap = {};
        reviewResults.forEach(result => {
          reviewStatusMap[result.bookingId] = result.hasReview;
        });
        setReviewStatuses(reviewStatusMap);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchUserBookings();
  };

  const handleCloseModal = () => {
    setCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const handleReviewClick = (booking) => {
    setReviewBooking(booking);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setReviewBooking(null);
  };

  const handleReviewSuccess = () => {
    // Update the review status for this booking
    if (reviewBooking) {
      setReviewStatuses(prev => ({
        ...prev,
        [reviewBooking._id]: true
      }));
    }
    handleCloseReviewModal();
  };

  // Helper function to check if checkout date has passed
  const isCheckoutCompleted = (checkOutDate) => {
    return new Date(checkOutDate) < new Date();
  };

  // Helper function to get booking status display
  const getBookingStatusDisplay = (booking) => {
    if (booking.status === "cancelled") return "Cancelled";

    // Explicit payment methods when paid
    if (booking.isPaid) {
      if (booking.paymentMethod === "Stripe") return "Completed";
      if (booking.paymentMethod === "Paid at Hotel") return "Paid at Hotel";
      return "Completed";
    }

    // Safety net: if backend somehow set paymentMethod but isPaid stayed false,
    // still respect the owner's "Paid at Hotel" marking.
    if (!booking.isPaid && booking.paymentMethod === "Paid at Hotel") {
      return "Paid at Hotel";
    }

    // If checkout date has passed and still not marked paid, keep it as pending (hotel)
    if (isCheckoutCompleted(booking.checkOutDate)) {
      return "Payment Pending (Hotel)";
    }
    
    return "Unpaid";
  };

  // Helper function to get status color
  const getStatusColor = (booking) => {
    const label = getBookingStatusDisplay(booking);
    if (label === "Cancelled") return "text-gray-600";
    if (label === "Completed") return "text-green-600";
    if (label === "Paid at Hotel") return "text-green-600";
    if (label === "Payment Pending (Hotel)") return "text-yellow-600";
    return "text-red-500";
  };

  // Helper function to get status dot color
  const getStatusDotColor = (booking) => {
    const label = getBookingStatusDisplay(booking);
    if (label === "Cancelled") return "bg-gray-500";
    if (label === "Completed") return "bg-green-500";
    if (label === "Paid at Hotel") return "bg-green-500";
    if (label === "Payment Pending (Hotel)") return "bg-yellow-500";
    return "bg-red-500";
  };

  // ✅ Stripe payment handler
  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        window.location.href = data.url;

      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Stripe payment error:", error);
      toast.error(error.response?.data?.message || "Failed to pay for booking");
    }
  };

  useEffect(() => {
    if (user) fetchUserBookings();
  }, [user]);

  useEffect(() => {
    const handleFocus = () => {
      if (user) fetchUserBookings();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks."
        align="left"
      />

      <div className="max-w-6xl mt-8 w-full text-gray-800 mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-500">Loading your bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-lg text-gray-500 mb-4">No bookings found</div>
            <p className="text-gray-400">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 w-full border-b border-gray-300 font-medium text-base py-3">
              <div className="col-span-5">Hotels</div>
              <div className="col-span-4">Date & Timings</div>
              <div className="col-span-3 text-center">Payment</div>
            </div>

            {bookings.map((booking) => (
              <div
                key={booking?._id}
                className="grid grid-cols-1 md:grid-cols-12 w-full border-b border-gray-200 py-6 first:border-t gap-6 md:gap-0"
              >
                {/* Hotel Details */}
                <div className="flex gap-4 col-span-5">
                  <img
                    src={(booking?.room?.images && booking.room.images[0]) || assets.roomImg1}
                    alt="hotel-img"
                    className="w-28 h-28 md:w-32 md:h-32 rounded-lg shadow object-cover"
                  />
                  <div className="flex flex-col gap-1.5">
                    <p className="font-playfair text-xl md:text-2xl">
                      {booking?.hotel?.name || "Hotel"}
                      <span className="font-inter text-sm text-gray-500 ml-1">
                        ({booking?.room?.roomType || "Room"})
                      </span>
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <img src={assets.locationIcon} alt="location-icon" className="w-4 h-4" />
                      <span>{booking?.hotel?.address || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <img src={assets.guestsIcon} alt="guests-icon" className="w-4 h-4" />
                      <span>Guests: {booking?.guests ?? "-"}</span>
                    </div>
                    <p className="text-base font-medium mt-2">
                      Total:{" "}
                      <span className="text-gray-700">
                        ${typeof booking?.totalPrice === "number" ? booking.totalPrice : "-"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Date & Timings */}
                <div className="flex flex-col gap-2 mt-4 md:mt-0 col-span-4">
                  <div>
                    <p className="font-medium">Check-In:</p>
                    <p className="text-gray-500 text-sm">
                      {booking?.checkInDate ? new Date(booking.checkInDate).toDateString() : "-"}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">Check-Out:</p>
                    <p className="text-gray-500 text-sm">
                      {booking?.checkOutDate ? new Date(booking.checkOutDate).toDateString() : "-"}
                    </p>
                  </div>
                </div>

                {/* Payment Status & Actions */}
                <div className="flex flex-col items-start md:items-center md:justify-center pt-3 md:pt-0 col-span-3 md:text-center">
                  <div className="flex items-center gap-2 md:justify-center mb-2">
                    <div className={`h-3 w-3 rounded-full ${getStatusDotColor(booking)}`}></div>
                    <p className={`text-sm font-medium ${getStatusColor(booking)}`}>
                      {getBookingStatusDisplay(booking)}
                    </p>
                  </div>

                  {booking?.status === "cancelled" && booking?.cancellationReason && (
                    <p className="text-xs text-gray-500 mb-2 text-center">
                      Reason: {booking.cancellationReason}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 w-full">
                    {booking?.status === "cancelled" ? (
                      <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                        Booking Cancelled
                      </span>
                    ) : booking?.status === "completed" || isCheckoutCompleted(booking?.checkOutDate) ? (
                      reviewStatuses[booking._id] ? (
                        <span className="px-4 py-1.5 text-xs bg-green-100 text-green-700 rounded-full">
                          👉 Thank you for your review!
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReviewClick(booking)}
                          className="px-4 py-1.5 text-xs border border-blue-400 text-blue-600 rounded-full hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          Add Review
                        </button>
                      )
                    ) : (
                      <>
                        {!booking?.isPaid && (
                          <button
                            onClick={() => handlePayment(booking?._id)}
                            className="px-4 py-1.5 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            Pay Now
                          </button>
                        )}
                        {!isCheckoutCompleted(booking?.checkOutDate) && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="px-4 py-1.5 text-xs border border-red-400 text-red-600 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onCancelSuccess={handleCancelSuccess}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={handleCloseReviewModal}
        booking={reviewBooking}
        onReviewSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default MyBookings;
