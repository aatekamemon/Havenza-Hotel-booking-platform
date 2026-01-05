import mongoose from "mongoose";
 const bookingSchema = new mongoose.Schema({
    user:{type:String, ref:"User", required:true},
    room:{type:String, ref:"Room", required:true},
    hotel:{type:String, ref:"Hotel", required:true},
    checkInDate:{type:Date, required:true},
    checkOutDate:{type:Date, required:true},
    totalPrice:{type:Number, required:true},
    guests:{type:Number, required:true},
    status:{type:String, enum:["pending","booked","cancelled","completed"], default:"pending"},
    paymentMethod:{type:String, required:true,default:"Paid at hotel"},
    isPaid:{type:Boolean, default:false},
    cancellationReason:{type:String},
    cancelledAt:{type:Date},

 },{timestamps:true});
 const Booking = mongoose.model("Booking",bookingSchema);
 export default Booking;