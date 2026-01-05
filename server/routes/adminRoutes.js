import express from "express";
import { adminLogin, listUsers, getUser, updateUser, deleteUser, listHotels, getHotel, updateHotel, deleteHotel, listHotelOwners, listBookings, getStats, updateBookingStatus, listTransactions, getPendingHotels, approveHotel } from "../controllers/adminController.js";
import { getAllReviewsForAdmin, updateReviewApproval, deleteReview } from "../controllers/reviewController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public admin login
router.post("/login", adminLogin);

// Protected admin operations
router.get("/users", adminAuth, listUsers);
router.get("/users/:id", adminAuth, getUser);
router.put("/users/:id", adminAuth, updateUser);
router.delete("/users/:id", adminAuth, deleteUser);

router.get("/hotels", adminAuth, listHotels);
router.get("/hotels/:id", adminAuth, getHotel);
router.put("/hotels/:id", adminAuth, updateHotel);
router.delete("/hotels/:id", adminAuth, deleteHotel);

router.get("/hotelOwners", adminAuth, listHotelOwners);
router.get("/bookings", adminAuth, listBookings);
router.put("/bookings/:id/status", adminAuth, updateBookingStatus);

// Review management routes
router.get("/reviews/all", adminAuth, getAllReviewsForAdmin);
router.put("/reviews/:reviewId/approval", adminAuth, updateReviewApproval);
router.delete("/reviews/:reviewId", adminAuth, deleteReview);

router.get("/stats", adminAuth, getStats);
router.get("/transactions", adminAuth, listTransactions);

// Hotel approval routes
router.get("/pending-hotels", adminAuth, getPendingHotels);
router.post("/hotels/:hotelId/approve", adminAuth, approveHotel);

export default router;


