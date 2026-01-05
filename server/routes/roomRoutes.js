import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { createRoom, getRooms, getOwnerRooms, toggleRoomAvailability, updateRoom, deleteRoom, updateRoomAvailability } from "../controllers/roomController.js";

export const roomRoutes = express.Router();
roomRoutes.post('/', upload.array('images',4),protect, createRoom);
roomRoutes.get('/', getRooms);
roomRoutes.get('/owner', protect, getOwnerRooms);
roomRoutes.get('/hotel', protect, getOwnerRooms);
roomRoutes.post('/toggle-availability', protect, toggleRoomAvailability);
roomRoutes.put('/:roomId', protect, updateRoom);
roomRoutes.delete('/:roomId', protect, deleteRoom);
roomRoutes.patch('/:roomId/availability', protect, updateRoomAvailability);

export default roomRoutes;