import express from "express";
import  { protect } from "../middleware/authMiddleware.js";
import { registerHotel, getHotelStatus } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post('/', protect, registerHotel);
hotelRouter.get('/status', protect, getHotelStatus);

export default hotelRouter;