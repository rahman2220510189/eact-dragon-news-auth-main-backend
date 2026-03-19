const jwt = require("jsonwebtoken");

// Middleware — verifies JWT token from request header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized — no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token with secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized — invalid token" });
  }
};

module.exports = verifyToken;