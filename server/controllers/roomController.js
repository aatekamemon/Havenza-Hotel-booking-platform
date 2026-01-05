import {v2 as cloudinary} from "cloudinary";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;

        if (!roomType) {
            return res.status(400).json({ success: false, message: "roomType is required" });
        }

        const numericPrice = Number(pricePerNight);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ success: false, message: "pricePerNight must be a positive number" });
        }

        let amenitiesList = [];
        if (Array.isArray(amenities)) {
            amenitiesList = amenities;
        } else if (typeof amenities === "string" && amenities.trim() !== "") {
            try {
                // Try JSON first (e.g., ["wifi","ac"]) else fallback to comma list
                amenitiesList = JSON.parse(amenities);
                if (!Array.isArray(amenitiesList)) throw new Error("not array");
            } catch {
                amenitiesList = amenities.split(",").map(a => a.trim()).filter(Boolean);
            }
        }

        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        let images = [];
        if (Array.isArray(req.files) && req.files.length > 0) {
            const uploadedImages = req.files.map(async (file) => {
                const response = await cloudinary.uploader.upload(file.path);
                return response.secure_url;
            });
            images = await Promise.all(uploadedImages);
        }

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: numericPrice,
            amenities: amenitiesList,
            images,
        });
        return res.json({ success: true, message: "Room Created Successfully" });
    } catch (error) {
        console.log(error.response?.data || error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const getRooms = async (req, res) => {
    try{
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: "hotel",
            populate: { path: "owner", select: "image" },
        }).sort({ createdAt: -1 });
        // Filter out rooms from hotels that are not approved
        const safeRooms = rooms.filter(r => Boolean(r?.hotel) && r.hotel.status === "approved");
        res.json({ success: true, rooms: safeRooms });
    }
    catch(error){
        res.json({ success: false, message: error.message });
    }

}

export const getOwnerRooms = async (req, res) => {
    try{
        const hotelData = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotelData) {
            return res.json({ success: true, rooms: [] });
        }
        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
        res.json({ success: true, rooms });
    }
    catch(error){
        res.json({ success: false, message: error.message });
    }
}

export const toggleRoomAvailability = async (req, res) => {
    try{
        const { roomId } = req.body;
        const roomData=await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability updated"});
    }
    catch(error){   
        res.json({ success: false, message: error.message });
    }
}

export const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { roomType, price, description, amenities, isAvailable } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Check if the room belongs to the authenticated user's hotel
        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel || room.hotel.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Update room fields
        if (roomType) room.roomType = roomType;
        if (price) room.pricePerNight = Number(price);
        if (description) room.description = description;
        if (amenities) room.amenities = Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim());
        if (typeof isAvailable === 'boolean') room.isAvailable = isAvailable;

        await room.save();
        res.json({ success: true, message: "Room updated successfully", room });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Check if the room belongs to the authenticated user's hotel
        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel || room.hotel.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Room.findByIdAndDelete(roomId);
        res.json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { isAvailable } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Check if the room belongs to the authenticated user's hotel
        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel || room.hotel.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        room.isAvailable = isAvailable;
        await room.save();
        res.json({ success: true, message: "Room availability updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}