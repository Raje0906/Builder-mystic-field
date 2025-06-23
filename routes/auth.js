import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Store from "../models/StoreMongoose.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      store_id: user.store_id,
    },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: "24h" }
  );
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("identifier")
      .notEmpty()
      .withMessage("Email or phone number is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("store_id").optional().notEmpty().withMessage("Store selection is required for non-admin users"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { identifier, password, store_id } = req.body;

      console.log('Login attempt:', { identifier, store_id });

      // Find user by email or phone
      const user = await User.findByEmailOrPhone(identifier);
      
      console.log('User found:', user ? { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        store_id: user.store_id,
        isActive: user.isActive 
      } : 'No user found');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please register first.",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        console.log('User account is deactivated:', user.email);
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact administrator.",
        });
      }

      // Verify password
      console.log('Attempting password verification...');
      const isPasswordValid = await user.comparePassword(password);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check store access
      console.log('Login debug:', {
        userRole: user.role,
        userStoreId: user.store_id,
        userStoreIdType: typeof user.store_id,
        requestedStoreId: store_id,
        requestedStoreIdType: typeof store_id,
        isAdmin: user.role === "admin",
        storeMatch: user.store_id && (user.store_id._id ? user.store_id._id.toString() === store_id : user.store_id.toString() === store_id),
        userDetails: {
          name: user.name,
          email: user.email,
          role: user.role,
          store_id: user.store_id
        }
      });
      
      // Admin can access any store, non-admin users can only access their assigned store
      if (user.role !== "admin") {
        // For non-admin users, store_id is required and must match their assigned store
        if (!store_id) {
          return res.status(400).json({
            success: false,
            message: "Store selection is required for non-admin users.",
          });
        }
        
        // Handle both populated store objects and string store IDs
        const userStoreId = user.store_id && (user.store_id._id ? user.store_id._id.toString() : user.store_id.toString());
        
        if (!userStoreId || userStoreId !== store_id) {
          return res.status(403).json({
            success: false,
            message: "You don't have access to this store. You can only access your assigned store.",
          });
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            store_id: user.store_id,
            store: user.store_id,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }
);

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("phone")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Please provide a valid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("store_id")
      .optional()
      .notEmpty()
      .withMessage("Store selection is required for non-admin users"),
    body("role")
      .isIn(["admin", "store manager", "sales", "engineer"])
      .withMessage("Invalid role selected"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, phone, password, store_id, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmailOrPhone(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const existingPhone = await User.findByEmailOrPhone(phone);
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "User with this phone number already exists",
        });
      }

      // Verify store exists (only for non-admin users)
      if (role !== "admin") {
        const store = await Store.findById(store_id);
        if (!store) {
          return res.status(400).json({
            success: false,
            message: "Selected store does not exist",
          });
        }
      }

      // Create new user
      const userData = {
        name,
        email,
        phone,
        password,
        role,
      };

      // Only add store_id for non-admin users
      if (role !== "admin") {
        userData.store_id = store_id;
      }

      const user = new User(userData);

      await user.save();

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            store_id: user.store_id,
            store: user.store_id,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error during registration",
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    const user = await User.findById(decoded.id).populate("store_id", "name address");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          store_id: user.store_id,
          store: user.store_id,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// @route   GET /api/auth/stores
// @desc    Get all stores for dropdown
// @access  Public
router.get("/stores", async (req, res) => {
  try {
    console.log('Fetching stores...');
    const stores = await Store.find({ status: "active" }).select("name address");
    console.log('Found stores:', stores);
    
    res.json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stores",
    });
  }
});

// @route   GET /api/auth/debug/users
// @desc    Get all users (for debugging)
// @access  Public (only for development)
router.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('store_id', 'name address');
    
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// @route   GET /api/auth/admin/users
// @desc    Get all users (admin only)
// @access  Private (admin only)
router.get("/admin/users", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const users = await User.find().select('-password').populate('store_id', 'name address');
    
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// @route   PUT /api/auth/admin/users/:userId/store
// @desc    Update user's store assignment (admin only)
// @access  Private (admin only)
router.put("/admin/users/:userId/store", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { userId } = req.params;
    const { store_id } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify store exists (if store_id is provided)
    if (store_id) {
      const store = await Store.findById(store_id);
      if (!store) {
        return res.status(400).json({
          success: false,
          message: "Selected store does not exist",
        });
      }
    }

    // Update user's store assignment
    user.store_id = store_id || null;
    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(userId).select('-password').populate('store_id', 'name address');

    res.json({
      success: true,
      message: "User store assignment updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user store error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user store assignment",
    });
  }
});

// @route   PUT /api/auth/admin/users/:userId/role
// @desc    Update user's role (admin only)
// @access  Private (admin only)
router.put("/admin/users/:userId/role", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!["admin", "store manager", "sales", "engineer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user's role
    user.role = role;
    
    // If changing to admin, remove store assignment
    if (role === "admin") {
      user.store_id = null;
    }
    
    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(userId).select('-password').populate('store_id', 'name address');

    res.json({
      success: true,
      message: "User role updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
    });
  }
});

export default router; 