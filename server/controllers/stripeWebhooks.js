import Stripe from "stripe";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";

const stripeWebhooks = async (req, res) => {
    console.log("=== WEBHOOK CALLED ===");
    console.log("Headers:", req.headers);
    console.log("Body length:", req.body?.length);
    console.log("Timestamp:", new Date().toISOString());
    
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;
    
    try{
        event = stripeInstance.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }catch(error){
        console.log(`Webhook signature verification failed.`, error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("Stripe webhook received:", event.type);
    console.log("Event data:", JSON.stringify(event.data.object, null, 2));

    if(event.type === "checkout.session.completed"){
        const session = event.data.object;
        const {bookingId} = session.metadata;
        
        console.log("Processing payment for booking:", bookingId);
        console.log("Session metadata:", session.metadata);
        
        if (!bookingId) {
            console.log("No bookingId found in session metadata");
            return res.json({received: true, message: "No bookingId in metadata"});
        }
        
        try {
            // Validate bookingId format
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                console.log("Invalid bookingId format:", bookingId);
                return res.json({received: true, message: "Invalid bookingId format"});
            }
            
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId, 
                {
                    isPaid: true,
                    paymentMethod: "Stripe",
                    status: "booked"
                },
                { new: true }
            );
            
            if (updatedBooking) {
                console.log("Booking payment updated successfully:", bookingId);
                console.log("Updated booking:", updatedBooking);
            } else {
                console.log("Booking not found:", bookingId);
            }
        } catch (error) {
            console.log("Error updating booking payment:", error);
        }
    } else if(event.type === "payment_intent.succeeded"){
        console.log("Payment intent succeeded:", event.data.object.id);
    } else {
        console.log("Unhandled event type:", event.type);
    }
    
    res.json({received: true, message: "Stripe webhook received"}); 
}

// Test endpoint to manually trigger webhook logic
export const testWebhook = async (req, res) => {
    try {
        const { bookingId } = req.body;
        console.log("=== MANUAL WEBHOOK TEST ===");
        console.log("Testing booking ID:", bookingId);
        
        if (!bookingId) {
            return res.status(400).json({success: false, message: "bookingId required"});
        }
        
        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            console.log("Invalid bookingId format:", bookingId);
            return res.status(400).json({success: false, message: "Invalid bookingId format"});
        }
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            {
                isPaid: true,
                paymentMethod: "Stripe",
                status: "booked"
            },
            { new: true }
        );
        
        if (updatedBooking) {
            console.log("Booking payment updated successfully:", bookingId);
            res.json({success: true, message: "Payment updated", booking: updatedBooking});
        } else {
            console.log("Booking not found:", bookingId);
            res.status(404).json({success: false, message: "Booking not found"});
        }
    } catch (error) {
        console.log("Error in test webhook:", error);
        res.status(500).json({success: false, message: error.message});
    }
};

export default stripeWebhooks;