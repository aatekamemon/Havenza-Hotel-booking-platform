import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const user = req.user;

        // Validate required fields
        if (!bookingId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if booking exists and belongs to user
        const booking = await Booking.findById(bookingId).populate("room hotel");
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user !== user._id) {
            return res.status(403).json({ success: false, message: "Not authorized to review this booking" });
        }

        // Check if booking is completed (checkout date has passed)
        const currentDate = new Date();
        if (booking.checkOutDate > currentDate) {
            return res.status(400).json({ success: false, message: "Cannot review before checkout date" });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "Review already exists for this booking" });
        }

        // Create review
        const review = await Review.create({
            user: user._id,
            booking: bookingId,
            hotel: booking.hotel._id,
            room: booking.room._id,
            rating: Number(rating),
            comment: comment.trim()
        });

        const populatedReview = await Review.findById(review._id)
            .populate("user", "username image")
            .populate("hotel", "name")
            .populate("room", "roomType");

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            review: populatedReview
        });
    } catch (error) {
        console.log("Create review error:", error);
        res.status(500).json({ success: false, message: "Error creating review: " + error.message });
    }
};

// Get reviews for a specific hotel
export const getHotelReviews = async (req, res) => {
    try {
        const { hotelId } = req.params;
        
        const reviews = await Review.find({ hotel: hotelId, isApproved: true })
            .populate("user", "username image")
            .populate("room", "roomType")
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        console.log("Get hotel reviews error:", error);
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
};

// Get reviews for hotel owner
export const getOwnerReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find hotel owned by this user
        const hotel = await Hotel.findOne({ owner: userId });
        if (!hotel) {
            return res.json({ success: true, reviews: [] });
        }

        const reviews = await Review.find({ hotel: hotel._id })
            .populate("user", "username image")
            .populate("room", "roomType")
            .populate("booking", "checkInDate checkOutDate")
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        console.log("Get owner reviews error:", error);
        res.status(500).json({ success: false, message: "Error fetching owner reviews" });
    }
};

// Get all reviews for admin (grouped by hotel)
export const getAllReviewsForAdmin = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("user", "username image")
            .populate("hotel", "name address")
            .populate("room", "roomType")
            .populate("booking", "checkInDate checkOutDate")
            .sort({ createdAt: -1 });

        // Group reviews by hotel
        const reviewsByHotel = reviews.reduce((acc, review) => {
            const hotelId = review.hotel._id.toString();
            if (!acc[hotelId]) {
                acc[hotelId] = {
                    hotel: review.hotel,
                    reviews: [],
                    averageRating: 0,
                    totalReviews: 0
                };
            }
            acc[hotelId].reviews.push(review);
            return acc;
        }, {});

        // Calculate average ratings
        Object.keys(reviewsByHotel).forEach(hotelId => {
            const hotelReviews = reviewsByHotel[hotelId].reviews;
            const totalRating = hotelReviews.reduce((sum, review) => sum + review.rating, 0);
            reviewsByHotel[hotelId].averageRating = (totalRating / hotelReviews.length).toFixed(1);
            reviewsByHotel[hotelId].totalReviews = hotelReviews.length;
        });

        res.json({ success: true, reviewsByHotel });
    } catch (error) {
        console.log("Get admin reviews error:", error);
        res.status(500).json({ success: false, message: "Error fetching admin reviews" });
    }
};

// Update review approval status (admin only)
export const updateReviewApproval = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { isApproved } = req.body;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { isApproved },
            { new: true }
        ).populate("user", "username").populate("hotel", "name");

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({
            success: true,
            message: `Review ${isApproved ? 'approved' : 'disapproved'} successfully`,
            review
        });
    } catch (error) {
        console.log("Update review approval error:", error);
        res.status(500).json({ success: false, message: "Error updating review approval" });
    }
};

// Delete review (admin only)
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.log("Delete review error:", error);
        res.status(500).json({ success: false, message: "Error deleting review" });
    }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
        const user = req.user;

        const reviews = await Review.find({ user: user._id })
            .populate("hotel", "name address")
            .populate("room", "roomType")
            .populate("booking", "checkInDate checkOutDate")
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        console.log("Get user reviews error:", error);
        res.status(500).json({ success: false, message: "Error fetching user reviews" });
    }
};

// Check if review exists for a booking
export const checkReviewExists = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const user = req.user;

        // Check if booking exists and belongs to user
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user !== user._id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Check if review exists
        const review = await Review.findOne({ booking: bookingId });
        
        res.json({ 
            success: true, 
            hasReview: !!review,
            review: review || null
        });
    } catch (error) {
        console.log("Check review exists error:", error);
        res.status(500).json({ success: false, message: "Error checking review" });
    }
};