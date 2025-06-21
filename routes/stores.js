import express from "express";
import { body, param, query, validationResult } from "express-validator";
import Store from "../models/Store.js";

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

// GET /api/stores - Get all stores
router.get(
  "/",
  [
    query("city").optional().isString().trim(),
    query("active").optional().isBoolean(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { city, active } = req.query;

      let query = {};

      if (active !== undefined) {
        query.isActive = active === "true";
      }

      let stores;

      if (city) {
        stores = await Store.getStoresByCity(city);
      } else {
        stores = await Store.find(query).sort({ name: 1 });
      }

      res.json({
        success: true,
        data: stores,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching stores",
        error: error.message,
      });
    }
  },
);

// GET /api/stores/active - Get only active stores
router.get("/active", async (req, res) => {
  try {
    const stores = await Store.getActiveStores();

    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active stores",
      error: error.message,
    });
  }
});

// GET /api/stores/:id - Get store by ID
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid store ID")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.json({
        success: true,
        data: store,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching store",
        error: error.message,
      });
    }
  },
);

// GET /api/stores/code/:code - Get store by code
router.get(
  "/code/:code",
  [param("code").notEmpty().withMessage("Store code is required")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findByCode(req.params.code);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      res.json({
        success: true,
        data: store,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching store",
        error: error.message,
      });
    }
  },
);

// POST /api/stores - Create new store
router.post(
  "/",
  [
    body("name").notEmpty().trim().withMessage("Store name is required"),
    body("code")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage("Store code is required (2-10 characters)"),
    body("address.street")
      .notEmpty()
      .trim()
      .withMessage("Street address is required"),
    body("address.city").notEmpty().trim().withMessage("City is required"),
    body("address.state").notEmpty().trim().withMessage("State is required"),
    body("address.zipCode")
      .notEmpty()
      .trim()
      .withMessage("Zip code is required"),
    body("contact.phone")
      .matches(/^\+?[\d\s-()]{10,15}$/)
      .withMessage("Valid phone number is required"),
    body("contact.email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("manager.name")
      .notEmpty()
      .trim()
      .withMessage("Manager name is required"),
    body("manager.phone")
      .matches(/^\+?[\d\s-()]{10,15}$/)
      .withMessage("Valid manager phone is required"),
    body("manager.email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid manager email is required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if store with same code exists
      const existingStore = await Store.findOne({
        code: req.body.code.toUpperCase(),
      });

      if (existingStore) {
        return res.status(409).json({
          success: false,
          message: "Store with this code already exists",
        });
      }

      const store = new Store(req.body);
      await store.save();

      res.status(201).json({
        success: true,
        message: "Store created successfully",
        data: store,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Store with this code already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating store",
        error: error.message,
      });
    }
  },
);

// PUT /api/stores/:id - Update store
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid store ID"),
    body("name").optional().notEmpty().trim(),
    body("address.street").optional().notEmpty().trim(),
    body("address.city").optional().notEmpty().trim(),
    body("address.state").optional().notEmpty().trim(),
    body("address.zipCode").optional().notEmpty().trim(),
    body("contact.phone")
      .optional()
      .matches(/^\+?[\d\s-()]{10,15}$/),
    body("contact.email").optional().isEmail().normalizeEmail(),
    body("manager.name").optional().notEmpty().trim(),
    body("manager.phone")
      .optional()
      .matches(/^\+?[\d\s-()]{10,15}$/),
    body("manager.email").optional().isEmail().normalizeEmail(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      Object.assign(store, req.body);
      await store.save();

      res.json({
        success: true,
        message: "Store updated successfully",
        data: store,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating store",
        error: error.message,
      });
    }
  },
);

// PUT /api/stores/:id/operating-hours - Update store operating hours
router.put(
  "/:id/operating-hours",
  [
    param("id").isMongoId().withMessage("Invalid store ID"),
    body("day")
      .isIn([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .withMessage("Valid day is required"),
    body("open")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Valid opening time required (HH:MM)"),
    body("close")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Valid closing time required (HH:MM)"),
    body("isClosed").optional().isBoolean(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const { day, open, close, isClosed = false } = req.body;

      await store.updateOperatingHours(day, open, close, isClosed);

      res.json({
        success: true,
        message: "Operating hours updated successfully",
        data: store,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating operating hours",
        error: error.message,
      });
    }
  },
);

// PUT /api/stores/:id/settings - Update store settings
router.put(
  "/:id/settings",
  [
    param("id").isMongoId().withMessage("Invalid store ID"),
    body("timezone").optional().isString(),
    body("currency").optional().isString(),
    body("taxRate").optional().isFloat({ min: 0, max: 100 }),
    body("lowStockThreshold").optional().isInt({ min: 0 }),
    body("autoNotifications").optional().isBoolean(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      await store.updateSettings(req.body);

      res.json({
        success: true,
        message: "Store settings updated successfully",
        data: store,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating store settings",
        error: error.message,
      });
    }
  },
);

// PUT /api/stores/:id/branding - Update store branding
router.put(
  "/:id/branding",
  [
    param("id").isMongoId().withMessage("Invalid store ID"),
    body("primaryColor")
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage("Valid hex color required"),
    body("logo").optional().isURL().withMessage("Valid logo URL required"),
    body("theme").optional().isIn(["blue", "green", "orange", "purple", "red"]),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      Object.assign(store.branding, req.body);
      await store.save();

      res.json({
        success: true,
        message: "Store branding updated successfully",
        data: store,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating store branding",
        error: error.message,
      });
    }
  },
);

// GET /api/stores/:id/status - Get store current status
router.get(
  "/:id/status",
  [param("id").isMongoId().withMessage("Invalid store ID")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const now = new Date();
      const todayHours = store.getOperatingHours();

      res.json({
        success: true,
        data: {
          isOpen: store.isCurrentlyOpen,
          todayHours,
          currentTime: now.toTimeString().slice(0, 5),
          timezone: store.settings.timezone,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching store status",
        error: error.message,
      });
    }
  },
);

// DELETE /api/stores/:id - Soft delete store
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid store ID")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      store.isActive = false;
      await store.save();

      res.json({
        success: true,
        message: "Store deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting store",
        error: error.message,
      });
    }
  },
);

export default router;
