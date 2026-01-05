import express from 'express';

import{
	checkAvailabilityAPI,
	createBooking,
	getHotelBookings,
	getUserBookings,
	cancelBooking,
	stripePayment,
	updatePaymentStatus,
	getPendingHotelPayments,
	markBookingPaidAtHotel,
	getOngoingHotelStays,
	markUserCheckedOut
}from '../controllers/bookingController.js';

import {protect} from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability',checkAvailabilityAPI);
bookingRouter.post('/book',protect,createBooking);
bookingRouter.get('/user',protect,getUserBookings);
bookingRouter.get('/hotel',protect,getHotelBookings);
bookingRouter.get('/hotel/pending-payments',protect,getPendingHotelPayments);
bookingRouter.get('/hotel/ongoing-stays',protect,getOngoingHotelStays);
bookingRouter.put('/cancel/:bookingId',protect,cancelBooking);
bookingRouter.post('/stripe-payment',protect,stripePayment);
bookingRouter.put('/update-payment/:bookingId',protect,updatePaymentStatus);
bookingRouter.put('/hotel/mark-paid/:bookingId',protect,markBookingPaidAtHotel);
bookingRouter.put('/hotel/checkout/:bookingId',protect,markUserCheckedOut);

export default bookingRouter;
