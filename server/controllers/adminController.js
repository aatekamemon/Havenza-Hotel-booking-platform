import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin123@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev_admin_jwt_secret_change_me";

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: "admin", email, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token });
    }
    return res.status(401).json({ message: "Invalid admin credentials" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// Helpers for pagination/search
function buildPaginationQuery(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "20", 10), 1);
  const search = (req.query.search || "").trim();
  const skip = (page - 1) * limit;
  return { page, limit, skip, search };
}

export async function listUsers(req, res) {
  try {
    const { limit, skip, search } = buildPaginationQuery(req);
    const query = search
      ? { $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return res.json({ items, total, page: Math.floor(skip / limit) + 1, limit });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateUser(req, res) {
  try {
    const allowed = ["username", "email", "role"];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listHotels(req, res) {
  try {
    const { limit, skip, search } = buildPaginationQuery(req);
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const [hotels, total] = await Promise.all([
      Hotel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Hotel.countDocuments(query),
    ]);
    // Attach owner info
    const ownerIds = [...new Set(hotels.map(h => h.owner).filter(Boolean))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select("_id username email").lean();
    const ownerMap = new Map(owners.map(o => [o._id, o]));
    const items = hotels.map(h => ({ ...h, ownerInfo: ownerMap.get(h.owner) || null }));
    return res.json({ items, total, page: Math.floor(skip / limit) + 1, limit });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getHotel(req, res) {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    return res.json(hotel);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateHotel(req, res) {
  try {
    const allowed = ["name", "address", "contact", "city", "status"];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    return res.json(hotel);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteHotel(req, res) {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    
    // Update user role back to "user" if they were a hotel owner
    if (hotel.owner) {
      await User.findByIdAndUpdate(hotel.owner, { role: "user" });
    }
    
    // Delete the hotel
    await Hotel.findByIdAndDelete(req.params.id);
    return res.json({ message: "Hotel deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listHotelOwners(req, res) {
  try {
    const { limit, skip, search } = buildPaginationQuery(req);
    const roleFilter = { role: "hotelOwner" };
    const query = search
      ? { ...roleFilter, $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : roleFilter;
    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return res.json({ items, total, page: Math.floor(skip / limit) + 1, limit });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listBookings(req, res) {
  try {
    const { limit, skip, search } = buildPaginationQuery(req);
    const query = search ? { status: { $regex: search, $options: "i" } } : {};
    const [items, total] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(query),
    ]);
    return res.json({ items, total, page: Math.floor(skip / limit) + 1, limit });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body || {};
    const allowed = ["pending", "booked", "cancelled", "completed"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStats(req, res) {
  try {
    const [totalUsers, totalHotels, totalBookings] = await Promise.all([
      User.countDocuments({}),
      Hotel.countDocuments({}),
      Booking.countDocuments({}),
    ]);

    const byMonth = async (Model) => {
      const rows = await Model.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      return rows.map((r) => ({ month: r._id, count: r.count }));
    };

    const [usersByMonth, bookingsByMonth, hotelsByMonth] = await Promise.all([
      byMonth(User),
      byMonth(Booking),
      byMonth(Hotel),
    ]);

    // hotelsByStatus based on optional status field; compute from existing docs
    const statusRows = await Hotel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const hotelsByStatus = statusRows.map((r) => ({ status: r._id || "unknown", count: r.count }));

    return res.json({ totalUsers, totalHotels, totalBookings, usersByMonth, bookingsByMonth, hotelsByMonth, hotelsByStatus });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPendingHotels(req, res) {
  try {
    const pendingHotels = await Hotel.find({ status: "pending" })
      .populate("owner", "username email")
      .sort({ createdAt: -1 });
    
    return res.json({ success: true, hotels: pendingHotels });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function approveHotel(req, res) {
  try {
    const { hotelId } = req.params;
    const { action } = req.body; // "approve" or "reject"
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }
    
    if (action === "approve") {
      hotel.status = "approved";
      await hotel.save();
      
      // Update user role to hotelOwner
      await User.findByIdAndUpdate(hotel.owner, { role: "hotelOwner" });
      
      return res.json({ success: true, message: "Hotel approved successfully" });
    } else if (action === "reject") {
      hotel.status = "rejected";
      await hotel.save();
      
      return res.json({ success: true, message: "Hotel rejected successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function listTransactions(req, res) {
  try {
    const { limit, skip, search } = buildPaginationQuery(req);
    
    // Build search query for transactions
    let query = { isPaid: true }; // Only show paid transactions
    if (search) {
      query.$or = [
        { status: { $regex: search, $options: "i" } },
        { paymentMethod: { $regex: search, $options: "i" } }
      ];
    }

    const [items, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'username email')
        .populate('room', 'roomType')
        .populate('hotel', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    // Format the transactions data
    const transactions = items.map(booking => ({
      _id: booking._id,
      user: booking.user ? {
        name: booking.user.username,
        email: booking.user.email
      } : { name: 'Unknown', email: 'N/A' },
      hotel: booking.hotel ? {
        name: booking.hotel.name,
        address: booking.hotel.address
      } : { name: 'Unknown', address: 'N/A' },
      room: booking.room ? booking.room.roomType : 'Unknown',
      amount: booking.totalPrice,
      paymentDate: booking.updatedAt,
      paymentMethod: booking.paymentMethod || 'Card',
      status: booking.isPaid ? 'Completed' : 'Pending',
      bookingId: booking._id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate
    }));

    return res.json({ 
      items: transactions, 
      total, 
      page: Math.floor(skip / limit) + 1, 
      limit 
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return res.status(500).json({ message: "Server error" });
  }
}


