import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeRecentSearchedCities } from "../controllers/userControllers.js";


const userRoutes = express.Router();

userRoutes.get('/',protect, getUserData);
userRoutes.post('/recent-searched-cities',protect, storeRecentSearchedCities);

export default userRoutes;