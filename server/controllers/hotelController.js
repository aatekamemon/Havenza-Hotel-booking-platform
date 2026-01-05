import Hotel from "../models/Hotel.js";
import User from "../models/User.js";


export const registerHotel = async (req, res) => {
	try{ 
		const {name, address, contact, city} = req.body;
		console.log("registerHotel input:", { userId: req.user?._id, body: { name, address, contact, city } });
		if(!name || !address || !contact || !city){
			return res.status(400).json({ success: false, message: "All fields are required" });
		}
		if(!req.user || !req.user._id){
			return res.status(401).json({ success: false, message: "Not authorized" });
		}
		const owner = req.user._id;

		const existing = await Hotel.findOne({ owner });
		if(existing){
			// If hotel exists and is approved, don't allow re-registration
			if(existing.status === "approved"){
				return res.json({ success: false, message: "Hotel Already Registered"});
			}
			// If hotel exists and is pending or rejected, update it
			existing.name = name;
			existing.address = address;
			existing.contact = contact;
			existing.city = city;
			existing.status = "pending";
			await existing.save();
			return res.json({ success: true, message: "Hotel registration request updated successfully" });
		}
		await Hotel.create({ name, address, contact, city, owner, status: "pending" });
		// Don't update user role until admin approves
		return res.json({ success: true, message: "Hotel registration request submitted successfully" });
	} catch(error) {
		console.error("registerHotel error:", error);
		return res.status(500).json({ success: false, message: error.message || "Server error" });
	}
}

export const getHotelStatus = async (req, res) => {
	try {
		const owner = req.user._id;
		const hotel = await Hotel.findOne({ owner });
		if (!hotel) {
			return res.json({ success: true, hotel: null });
		}
		return res.json({ success: true, hotel });
	} catch(error) {
		console.error("getHotelStatus error:", error);
		return res.status(500).json({ success: false, message: error.message || "Server error" });
	}
}
