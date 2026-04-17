const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Server cannot start securely.");
  process.exit(1);
}

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error(`JWT Verification Error: ${err.message}`);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // After refactor, 'user' is the payload: { id, name, role }
    req.user = user;
    next();
  });
};

/**
 * Middleware: Ensure the authenticated user has the admin role.
 * Must be used AFTER authenticateToken.
 */
const requireAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
