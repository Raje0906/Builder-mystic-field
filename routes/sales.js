import express from "express";
import { body, param, query, validationResult } from "express-validator";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Inventory from '../models/Inventory.js';

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

// GET /api/sales - Get all sales with filtering
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("storeId").optional().isMongoId(),
    query("customerId").optional().isMongoId(),
    query("status")
      .optional()
      .isIn([
        "pending",
        "completed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ]),
    query("paymentMethod")
      .optional()
      .isIn(["cash", "card", "upi", "emi", "bank_transfer", "cheque"]),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const { storeId, customerId, status, paymentMethod, startDate, endDate } =
        req.query;

      let query = { isActive: true };

      if (storeId) query.store = storeId;
      if (customerId) query.customer = customerId;
      if (status) query.status = status;
      if (paymentMethod) query.paymentMethod = paymentMethod;

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const sales = await Sale.find(query)
        .populate("customer", "name email phone")
        .populate("store", "name code address")
        .populate("items.product", "name brand model sku")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Sale.countDocuments(query);

      res.json({
        success: true,
        data: {
          sales,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sales",
        error: error.message,
      });
    }
  },
);

// GET /api/sales/stats - Get sales statistics
router.get(
  "/stats",
  [
    query("storeId").optional().isMongoId(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { storeId, startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();

      // If no date range provided, use current month
      if (!startDate && !endDate) {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
      }

      const stats = await Sale.getSalesStats(start, end, storeId);

      res.json({
        success: true,
        data: stats[0] || {
          totalSales: 0,
          totalRevenue: 0,
          totalRefunded: 0,
          averageOrderValue: 0,
          totalItemsSold: 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sales statistics",
        error: error.message,
      });
    }
  },
);

// GET /api/sales/:id - Get sale by ID
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid sale ID")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id)
        .populate("customer", "name email phone address")
        .populate("store", "name code address contact")
        .populate("items.product", "name brand model sku specifications");

      if (!sale || !sale.isActive) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      res.json({
        success: true,
        data: sale,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sale",
        error: error.message,
      });
    }
  },
);

// GET /api/sales/number/:saleNumber - Get sale by sale number
router.get(
  "/number/:saleNumber",
  [param("saleNumber").notEmpty().withMessage("Sale number is required")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const sale = await Sale.findBySaleNumber(req.params.saleNumber)
        .populate("customer", "name email phone address")
        .populate("store", "name code address contact")
        .populate("items.product", "name brand model sku specifications");

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      res.json({
        success: true,
        data: sale,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sale",
        error: error.message,
      });
    }
  },
);

// POST /api/sales - Create new sale
router.post(
  "/",
  [
    body("customer").isMongoId().withMessage("Valid customer ID is required"),
    body("store").isMongoId().withMessage("Valid store ID is required"),
    body("items").isArray({ min: 1 }).withMessage("At least one item required"),
    body("items.*.inventory")
      .isMongoId()
      .withMessage("Valid inventory ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be positive"),
    body("items.*.unitPrice")
      .isFloat({ min: 0 })
      .withMessage("Unit price must be positive"),
    body("items.*.discount").optional().isFloat({ min: 0, max: 100 }),
    body("paymentMethod").isIn([
      "cash",
      "card",
      "upi",
      "emi",
      "bank_transfer",
      "cheque",
    ]),
    body("paymentDetails").optional().isObject(),
    body("salesPerson").optional().isObject(),
    body("deliveryInfo").optional().isObject(),
    body("notes").optional().trim(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { customer, store, items, paymentMethod, paymentDetails, notes } =
        req.body;

      let totalAmount = 0;
      const populatedItems = [];

      // Verify inventory items and calculate total
      for (const item of items) {
        const inventoryItem = await Inventory.findById(item.inventory);
        if (!inventoryItem) {
          return res.status(404).json({
            success: false,
            message: `Inventory item with ID ${item.inventory} not found`,
          });
        }
        if (inventoryItem.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${inventoryItem.name}`,
          });
        }
        const totalPrice = item.quantity * item.unitPrice;
        totalAmount += totalPrice;
        // Use the product field from the inventory item
        populatedItems.push({
          product: inventoryItem.product, // Store the correct product reference
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          discount: item.discount || 0,
        });
      }

      // Create new sale
      const newSale = new Sale({
        customer,
        store,
        items: populatedItems,
        totalAmount,
        paymentMethod,
        paymentDetails,
        notes,
      });

      await newSale.save();

      // Update inventory stock
      for (const item of items) {
        await Inventory.findByIdAndUpdate(item.inventory, {
          $inc: { stock: -item.quantity },
        });
      }

      const populatedSale = await Sale.findById(newSale._id)
        .populate("customer", "name email");

      res.status(201).json({
        success: true,
        message: "Sale created successfully",
        data: populatedSale,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating sale",
        error: error.message,
      });
    }
  },
);

// PUT /api/sales/:id/status - Update sale status
router.put(
  "/:id/status",
  [
    param("id").isMongoId().withMessage("Invalid sale ID"),
    body("status").isIn([
      "pending",
      "completed",
      "cancelled",
      "refunded",
      "partially_refunded",
    ]),
    body("reason").optional().trim(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale || !sale.isActive) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      const { status, reason } = req.body;

      // Handle cancellation - restore inventory
      if (status === "cancelled" && sale.status !== "cancelled") {
        for (const item of sale.items) {
          const product = await Product.findById(item.product);
          if (product) {
            await product.updateInventory(sale.store, item.quantity, "add");
          }
        }
      }

      sale.status = status;
      if (reason) {
        sale.notes =
          (sale.notes || "") + `\nStatus changed to ${status}: ${reason}`;
      }

      await sale.save();

      res.json({
        success: true,
        message: "Sale status updated successfully",
        data: sale,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating sale status",
        error: error.message,
      });
    }
  },
);

// POST /api/sales/:id/refund - Add refund to sale
router.post(
  "/:id/refund",
  [
    param("id").isMongoId().withMessage("Invalid sale ID"),
    body("amount").isFloat({ min: 0.01 }).withMessage("Refund amount required"),
    body("reason").notEmpty().trim().withMessage("Refund reason required"),
    body("processedBy").notEmpty().trim().withMessage("Processed by required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale || !sale.isActive) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      if (!sale.canBeRefunded()) {
        return res.status(400).json({
          success: false,
          message: "Sale cannot be refunded",
        });
      }

      const { amount, reason, processedBy } = req.body;

      await sale.addRefund(amount, reason, processedBy);

      res.json({
        success: true,
        message: "Refund processed successfully",
        data: sale,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// GET /api/sales/:id/warranty/:productId - Get warranty status
router.get(
  "/:id/warranty/:productId",
  [
    param("id").isMongoId().withMessage("Invalid sale ID"),
    param("productId").isMongoId().withMessage("Invalid product ID"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale || !sale.isActive) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      const warrantyStatus = sale.getWarrantyStatus(req.params.productId);

      if (!warrantyStatus) {
        return res.status(404).json({
          success: false,
          message: "Product not found in this sale",
        });
      }

      res.json({
        success: true,
        data: warrantyStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking warranty status",
        error: error.message,
      });
    }
  },
);

export default router;
