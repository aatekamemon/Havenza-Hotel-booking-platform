import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
  "svix-id": req.headers["svix-id"],
  "svix-signature": req.headers["svix-signature"],
  "svix-timestamp": req.headers["svix-timestamp"],
};

if (!headers["svix-id"] || !headers["svix-signature"] || !headers["svix-timestamp"]) {
  return res.status(400).json({ success: false, message: "Missing required headers" });
}


    const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
    await whook.verify(payload, headers);

    const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
    const { data, type } = parsed || {};
    if (!data || !type) {
      return res.status(400).json({ success: false, message: "Invalid Clerk payload" });
    }

    const userData = {
      _id: data.id,
      email: (Array.isArray(data?.email_addresses) && data.email_addresses[0]?.email_address)
        || data?.primary_email_address?.email_address
        || (Array.isArray(data?.email_addresses) && data.email_addresses[0]?.id)
        || data?.primary_email_address_id
        || "no-email@example.com",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.username || data.id,
      image: data.image_url || "",
    };



    console.log("📩 Clerk Event:", type, JSON.stringify({
      id: data?.id,
      email_addresses: data?.email_addresses,
      primary_email_address: data?.primary_email_address,
      primary_email_address_id: data?.primary_email_address_id
    }));

    switch (type) {
      case "user.created": {
        const created = await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true, setDefaultsOnInsert: true });
        console.log("✅ user.created upserted:", created?._id);
        break;
      }
      case "user.updated": {
        const updated = await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true });
        console.log("✅ user.updated upserted:", updated?._id);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("🗑️ user.deleted:", data.id);
        break;
      }
      default:
        console.log("⚠️ Unknown webhook type:", type);
    }

    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
