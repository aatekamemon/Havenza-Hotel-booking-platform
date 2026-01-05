import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const auth = req.auth();
        const { userId } = auth || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        let user = await User.findById(userId);

        // Fallback: if authenticated by Clerk but user record missing in Mongo, fetch from Clerk and upsert
        if (!user) {
            try {
                const secret = process.env.CLERK_SECRET_KEY;
                if (!secret) {
                    return res.status(401).json({ success: false, message: "Not authorized, missing server auth" });
                }
                const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${secret}`,
                    },
                });
                if (!response.ok) {
                    return res.status(401).json({ success: false, message: "Not authorized, unable to verify user" });
                }
                const data = await response.json();
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
                user = await User.findByIdAndUpdate(userId, userData, { new: true, upsert: true, setDefaultsOnInsert: true });
            } catch (err) {
                return res.status(401).json({ success: false, message: "Not authorized, user not found" });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};  