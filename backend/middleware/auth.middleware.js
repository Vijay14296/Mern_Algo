import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Make sure you attach the user info
    req.user = { id: decoded.id, role: decoded.role }; // <-- must include role
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
