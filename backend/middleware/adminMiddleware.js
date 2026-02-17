// const adminMiddleware = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin access required",
//     });
//   }

//   next();
// };

// export default adminMiddleware;

import jwt from "jsonwebtoken";

const JWT_SECRET = "mySuperSecretKey";

// 1️⃣ Verify JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach decoded user info
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 2️⃣ Admin role check
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};
