import jwt from "jsonwebtoken";

// Assumption: For now we support a hard-coded admin credential flow that issues a JWT.
// We validate tokens signed with JWT_SECRET (fallback to a dev default for demo only).

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev_admin_jwt_secret_change_me";

export function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

export default adminAuth;


