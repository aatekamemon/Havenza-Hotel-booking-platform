import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    booking: { type: String, ref: "Booking", required: true },
    hotel: { type: String, ref: "Hotel", required: true },
    room: { type: String, ref: "Room", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: true }, // Admin can moderate reviews
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
