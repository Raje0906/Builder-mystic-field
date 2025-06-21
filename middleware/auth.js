import jwt from "jsonwebtoken";

// Simple authentication middleware (can be enhanced with user management)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // For development, allow requests without authentication
  if (process.env.NODE_ENV === "development" && !token) {
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      req.user = user;
      next();
    },
  );
};

// Generate token for testing
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "24h",
  });
};

// Simple login endpoint for development
export const createAuthRoutes = (router) => {
  router.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Simple authentication for development
    if (username === "admin" && password === "admin123") {
      const token = generateToken({
        username,
        role: "admin",
        storeId: null,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            username,
            role: "admin",
          },
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  });
};

export default {
  authenticateToken,
  generateToken,
  createAuthRoutes,
};
