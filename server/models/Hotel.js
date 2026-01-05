import mongoose from "mongoose";
const hotelSchema = new mongoose.Schema({
	name: { type: String, required: true },
	address: { type: String, required: true },
	contact: { type: String, required: true },
	owner: { type: String, required: true , ref: "User" },
	city: { type: String, required: true  },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
},{timestamps: true});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;