import express from 'express';
import {
    createReview,
    getHotelReviews,
    getOwnerReviews,
    getAllReviewsForAdmin,
    updateReviewApproval,
    deleteReview,
    getUserReviews,
    checkReviewExists
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminAuth } from '../middleware/adminAuth.js';

const reviewRouter = express.Router();

// User routes
reviewRouter.post('/create', protect, createReview);
reviewRouter.get('/user', protect, getUserReviews);
reviewRouter.get('/check/:bookingId', protect, checkReviewExists);
reviewRouter.get('/hotel/:hotelId', getHotelReviews);

// Owner routes
reviewRouter.get('/owner', protect, getOwnerReviews);

// Admin routes
reviewRouter.get('/admin/all', adminAuth, getAllReviewsForAdmin);
reviewRouter.put('/admin/:reviewId/approval', adminAuth, updateReviewApproval);
reviewRouter.delete('/admin/:reviewId', adminAuth, deleteReview);

export default reviewRouter;
