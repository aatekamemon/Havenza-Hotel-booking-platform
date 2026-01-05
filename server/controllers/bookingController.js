import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";
import Stripe from "stripe";



const checkAvailability = async ({checkInDate, checkOutDate, room, excludeBookingId = null}) => {
    try{
        const query = {
            room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte:checkInDate},
            status: { $in: ["pending", "booked"] }
        };
        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId };
        }
        const bookings = await Booking.find(query);
        const isAvailable = bookings.length === 0;
        return isAvailable;
    }catch(error){
        console.error(error.message);
        return false;
    }
}

const sendBookingEmail = async (type, booking, user, roomData) => {
    if (!process.env.SENDER_EMAIL || !user.email) {
        return;
    }

    const subject = type === 'confirmation' ? "Booking Confirmation" : "Booking Cancellation Confirmation";
    const template = type === 'confirmation' ? `
        <h2>Booking Confirmation</h2>
        <p>Dear ${user.username},</p>
        <p>Thank you for booking with us. Your booking has been created successfully.</p>
        <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
            <li><strong>Location:</strong> ${roomData.hotel.address}</li>
            <li><strong>Date:</strong> ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()}</li>
            <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || "INR"} ${booking.totalPrice}</li>
        </ul>
        <p>We will look forward to welcoming you!</p>
        <p>If you need to make any changes to your booking, please contact us.</p>` : `
        <h2>Booking Cancellation Confirmation</h2>
        <p>Dear ${user.username},</p>
        <p>Your booking has been successfully cancelled.</p>
        <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Hotel Name:</strong> ${booking.hotel.name}</li>
            <li><strong>Location:</strong> ${booking.hotel.address}</li>
            <li><strong>Original Dates:</strong> ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()}</li>
            <li><strong>Original Amount:</strong> ${process.env.CURRENCY || "INR"} ${booking.totalPrice}</li>
            <li><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</li>
            <li><strong>Cancelled On:</strong> ${booking.cancelledAt.toDateString()}</li>
        </ul>
        <p>If you have any questions about this cancellation, please contact us.</p>`;

    try {
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject,
            html: `${template}<p>Thank you for choosing us.</p><p>Best regards,</p><p>The ${type === 'confirmation' ? roomData.hotel.name : booking.hotel.name} Team</p>`
        });
    } catch (emailError) {
        console.log(`Email (${type}) sending failed for booking ${booking._id}:`, emailError.message);
    }
};

//Api to check room availability
export const checkAvailabilityAPI = async(req, res)=>{
    try{
        const{room, checkInDate, checkOutDate} = req.body;
        const isAvailable = await checkAvailability({checkInDate, checkOutDate,room});
        res.json({success:true, isAvailable});
    }
    catch(error){
        res.status(500).json({success:false, message:error.message});
    }
}

//API to create a booking
//POST /api/bookings/book
export const createBooking = async(req, res)=>{
    try{
        const{room,checkInDate,checkOutDate,guests,PaymentMethod} = req.body;
        const user = req.user;
        
        // Validate required fields
        if(!room || !checkInDate || !checkOutDate || !guests){
            return res.status(400).json({success:false, message:"Missing required fields"});
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: "Invalid dates provided." });
        }
        
        const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
        if(!isAvailable){
            return res.status(409).json({success:false, message:"Room not available for the selected dates"});
        }
        
        const roomData=await Room.findById(room).populate("hotel");
        if(!roomData){
            return res.status(404).json({success:false, message:"Room not found"});
        }
        
        // Validate guest count based on room type
        const guestLimits = {
            "Single Bed": 1,
            "Double Bed": 2,
            "Luxury Room": 2,
            "Family Suite": 4
        };
        
        const maxGuests = guestLimits[roomData.roomType];
        if (maxGuests && guests > maxGuests) {
            return res.status(400).json({
                success: false, 
                message: `This room type allows only ${maxGuests} guest${maxGuests > 1 ? 's' : ''}.`
            });
        }
        
        let totalPrice=roomData.pricePerNight;
        const timeDiff=checkOut.getTime()-checkIn.getTime();
        const nights=Math.ceil(timeDiff/(1000*3600*24));
        if (nights <= 0) {
            return res.status(400).json({ success: false, message: "Booking must be for at least one night." });
        }
        totalPrice=totalPrice*nights;
        
        const booking =await Booking.create({
            user,
            room,
            hotel:roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
            paymentMethod: PaymentMethod || "Paid at Hotel"
        });
        
        // Send email notification (don't let email failure break booking)
        await sendBookingEmail('confirmation', booking, user, roomData);
        
        res.status(201).json({success:true, message:"Booking created successfully", booking});
    }catch(error){
        console.log("Booking creation error:", error);
        res.status(500).json({success:false, message:"Error in booking creation: " + error.message});
    }
}

const getUserBookings = async(req, res)=>{  
    try{
        const userId = req.user._id;
        const bookings = await Booking.find({user:userId}).populate("room hotel").sort({createdAt:-1});
        
        // Auto-mark stay as completed (for UX), but NEVER auto-mark unpaid bookings as paid
        const currentDate = new Date();
        const updatedBookings = await Promise.all(bookings.map(async (booking) => {
            if (booking.status === 'booked' && booking.checkOutDate < currentDate) {
                booking.status = 'completed';
                await booking.save();
            }
            return booking;
        }));
        
        res.json({success:true, bookings: updatedBookings});
    }catch(error){
        console.log(error);
        res.status(500).json({success:false, message:"Error in fetching user bookings"});
    }
}

export const getHotelBookings = async(req, res)=>{
    try{    
        const hotel=await Hotel.findOne({owner:req.auth().userId});
        if(!hotel){
            return res.json({success:false, message:"No hotel found"});
        }
        
        const bookings = await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1});
        
        // Auto-mark stay as completed when checkout has passed, but do NOT auto-mark payment
        const currentDate = new Date();
        const updatedBookings = await Promise.all(bookings.map(async (booking) => {
            if (booking.status === 'booked' && booking.checkOutDate < currentDate) {
                booking.status = 'completed';
                await booking.save();
            }
            return booking;
        }));
        
        const totalBookings = updatedBookings.length;
        // Revenue should include only paid bookings (Stripe or manually marked paid-at-hotel)
        const totalRevenue = updatedBookings.reduce(
            (total, booking) => booking.isPaid ? total + (booking.totalPrice || 0) : total,
            0
        );
        res.json({success:true, dashboardData:{totalBookings, totalRevenue}, bookings: updatedBookings});
    }catch(error){
        console.log(error);
        res.status(500).json({success:false, message:"Error in fetching hotel bookings"});
    }
}
//API to cancel a booking
//PUT /api/bookings/cancel/:bookingId
export const cancelBooking = async(req, res)=>{
    try{
        const {bookingId} = req.params;
        const {reason} = req.body;
        const user = req.user;
        
        // Find the booking
        const booking = await Booking.findById(bookingId).populate("room hotel user");
        if(!booking){
            return res.status(404).json({success:false, message:"Booking not found"});
        }
        
        // Check if user owns this booking
        if(booking.user._id.toString() !== user._id.toString()){
            return res.status(403).json({success:false, message:"Not authorized to cancel this booking"});
        }
        
        // Check if booking can be cancelled (not already cancelled or completed)
        if(booking.status === "cancelled"){
            return res.status(400).json({success:false, message:"Booking is already cancelled"});
        }
        
        if(booking.status === "completed"){
            return res.status(400).json({success:false, message:"Cannot cancel completed booking"});
        }
        
        // Update booking status
        booking.status = "cancelled";
        booking.cancellationReason = reason || "No reason provided";
        booking.cancelledAt = new Date();
        await booking.save();
        
        // Send cancellation email
        try{
            await sendBookingEmail('cancellation', booking, booking.user, null);
        }catch(emailError){
            console.log("Cancellation email sending failed:", emailError.message);
            // Don't fail the cancellation if email fails
        }
        
        res.json({success:true, message:"Booking cancelled successfully"});
    }catch(error){
        console.log("Booking cancellation error:", error);
        res.status(500).json({success:false, message:"Error in cancelling booking: " + error.message});
    }
}

export const stripePayment = async(req, res)=>{
    try{
        const {bookingId} = req.body;
        console.log("Creating Stripe payment for booking:", bookingId);
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({success: false, message: "Booking not found"});
        }
        
        const roomData = await Room.findById(booking.room).populate("hotel");
        const totalPrice = booking.totalPrice;  
        const {origin} = req.headers;
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const line_items=[{
            price_data:{
                currency:"inr",
                product_data:{
                    name:roomData.hotel.name,
                },
                unit_amount:totalPrice*100,
            },
            quantity : 1,
        }];

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode:"payment",
            success_url:`${origin}/loader/my-bookings`,
            cancel_url:`${origin}/my-bookings`,
            metadata:{
                bookingId: bookingId.toString(),
            },
        });
        
        console.log("Stripe session created:", session.id);
        console.log("Session metadata:", session.metadata);
        
        res.json({success:true, url:session.url });
    }catch(error){
        console.log("Stripe payment error:", error);
        res.status(500).json({success:false, message:"Error in stripe payment"});
    }
}


// Manual payment update endpoint (for testing)
export const updatePaymentStatus = async(req, res) => {
    try{
        const {bookingId} = req.params;
        const booking = await Booking.findByIdAndUpdate(
            bookingId, 
            {isPaid: true, paymentMethod: "Stripe"},
            {new: true}
        );
        
        if(booking){
            res.json({success: true, message: "Payment status updated", booking});
        } else {
            res.status(404).json({success: false, message: "Booking not found"});
        }
    }catch(error){
        console.log("Payment update error:", error);
        res.status(500).json({success: false, message: "Error updating payment status"});
    }
}

// Pending payments (hotel owner) - bookings where guest chose to pay at hotel but not yet marked paid
export const getPendingHotelPayments = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found" });
        }

        const now = new Date();
        const pendingBookings = await Booking.find({
            hotel: hotel._id,
            checkOutDate: { $lt: now },          // checkout date passed
            isPaid: false,                       // payment still pending
            status: { $ne: "cancelled" }         // ignore cancelled
        }).populate("room hotel user").sort({ checkOutDate: -1 });

        res.json({ success: true, bookings: pendingBookings });
    } catch (error) {
        console.log("Error fetching pending payments:", error);
        res.status(500).json({ success: false, message: "Error fetching pending payments" });
    }
};

// Mark a booking as paid at hotel (owner action)
export const markBookingPaidAtHotel = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "No hotel found" });
        }

        const booking = await Booking.findOne({ _id: bookingId, hotel: hotel._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Cannot mark a cancelled booking as paid" });
        }

        booking.isPaid = true;
        booking.paymentMethod = "Paid at Hotel";
        // If this was still pending, consider it confirmed
        if (booking.status === "pending") {
            booking.status = "booked";
        }
        await booking.save();

        res.json({ success: true, message: "Booking marked as paid at hotel", booking });
    } catch (error) {
        console.log("Error marking booking as paid at hotel:", error);
        res.status(500).json({ success: false, message: "Error updating booking payment" });
    }
};

// Ongoing stays for Check-Out Manager (optional feature)
export const getOngoingHotelStays = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found" });
        }

        const now = new Date();
        const ongoingBookings = await Booking.find({
            hotel: hotel._id,
            status: { $in: ["pending", "booked"] },
            checkInDate: { $lte: now },
            checkOutDate: { $gt: now }
        }).populate("room hotel user").sort({ checkInDate: 1 });

        res.json({ success: true, bookings: ongoingBookings });
    } catch (error) {
        console.log("Error fetching ongoing stays:", error);
        res.status(500).json({ success: false, message: "Error fetching ongoing stays" });
    }
};

// Mark user checked out (moves booking to completed and frees room in availability checks)
export const markUserCheckedOut = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const hotel = await Hotel.findOne({ owner: req.auth().userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "No hotel found" });
        }

        const booking = await Booking.findOne({ _id: bookingId, hotel: hotel._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Cannot check out a cancelled booking" });
        }

        booking.status = "completed";
        await booking.save();

        res.json({ success: true, message: "Guest checked out successfully", booking });
    } catch (error) {
        console.log("Error marking user checked out:", error);
        res.status(500).json({ success: false, message: "Error updating booking status" });
    }
};

export {getUserBookings};