import express from "express";
import Repair from "../models/Repair.js";
import Customer from "../models/Customer.js";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Debug all incoming requests to repairs router
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  console.log('Request headers:', req.headers);
  next();
});

// Track repair by ticket number, phone number, or email
router.get('/track/status', async (req, res) => {
  console.log('\n--- Track Status Request ---');
  console.log('Query params:', req.query);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  
  try {
    // Manually validate query parameters
    const { ticket, phone, email } = req.query;
    
    // Check if at least one parameter is provided
    if (!ticket && !phone && !email) {
      console.log('Validation error: No search parameters provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide a ticket number, phone number, or email address'
      });
    }
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Validation error: Invalid email format');
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }
    
    console.log('Processing repair tracking request with:', { 
      ticket, 
      phone: phone ? '***' : undefined, 
      email 
    });
    
    // Build the query based on provided parameters
    const query = {};
    
    if (ticket) {
      // Check if ticket is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(ticket)) {
        query._id = new mongoose.Types.ObjectId(ticket);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid ticket number format'
        });
      }
    }

    // If searching by phone or email, first find matching customers
    let customerIds = [];
    if (phone || email) {
      const customerQuery = {};
      
      if (phone) {
        // Remove any non-digit characters from phone number
        const cleanPhone = phone.replace(/\D/g, '');
        customerQuery.phone = { $regex: cleanPhone, $options: 'i' };
      }
      
      if (email) {
        customerQuery.email = email.toLowerCase();
      }
      
      const customers = await Customer.find(customerQuery).select('_id');
      customerIds = customers.map(c => c._id);
      
      if (customerIds.length === 0 && !ticket) {
        return res.status(404).json({
          success: false,
          message: 'No customers found with the provided details'
        });
      }
      
      // If we have customer IDs but no ticket, search by customer IDs
      if (customerIds.length > 0) {
        query.customer = { $in: customerIds };
      }
    }
    
    // Find repairs with the built query
    const repairs = await Repair.find(query)
      .populate({
        path: 'customer',
        select: 'name phone email address',
        // If customer is not found, still return the repair
        options: { allowNull: true }
      })
      .sort({ receivedDate: -1 });
    
    if (!repairs || repairs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No repairs found with the provided details'
      });
    }
    
    // Format the response
    const response = repairs.map(repair => ({
      ticketNumber: repair._id,
      status: repair.status,
      device: repair.deviceType ? `${repair.deviceType} ${repair.brand || ''} ${repair.model || ''}`.trim() : 'N/A',
      issue: repair.issueDescription || 'No description provided',
      receivedDate: repair.receivedDate,
      estimatedCompletion: repair.estimatedCompletion,
      totalCost: repair.totalCost || 0,
      customer: {
        name: repair.customer?.name || 'N/A',
        phone: repair.customer?.phone || 'N/A',
        email: repair.customer?.email || 'N/A',
        address: {
          line1: repair.customer?.address?.line1 || '',
          line2: repair.customer?.address?.line2 || '',
          city: repair.customer?.address?.city || '',
          state: repair.customer?.address?.state || '',
          pincode: repair.customer?.address?.pincode || ''
        }
      }
    }));
    
    res.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error tracking repair:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new repair
router.post(
  '/',
  [
    // Validate request body
    body('customer').isMongoId().withMessage('Valid customer ID is required'),
    body('deviceType').notEmpty().withMessage('Device type is required'),
    body('brand').notEmpty().withMessage('Device brand is required'),
    body('model').notEmpty().withMessage('Device model is required'),
    body('issueDescription').notEmpty().withMessage('Issue description is required'),
    body('repairCost').isNumeric().withMessage('Repair cost must be a number'),
    body('partsCost').optional().isNumeric().withMessage('Parts cost must be a number'),
    body('laborCost').optional().isNumeric().withMessage('Labor cost must be a number'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
          message: 'Validation failed',
        });
      }

      // Check if customer exists
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      // Create new repair
      const newRepair = new Repair({
        customer: req.body.customer,
        deviceType: req.body.deviceType,
        brand: req.body.brand,
        model: req.body.model,
        serialNumber: req.body.serialNumber,
        issueDescription: req.body.issueDescription,
        diagnosis: req.body.diagnosis || 'Pending diagnosis',
        repairCost: parseFloat(req.body.repairCost) || 0,
        partsCost: parseFloat(req.body.partsCost) || 0,
        laborCost: parseFloat(req.body.laborCost) || 0,
        status: 'received',
        priority: req.body.priority || 'medium',
        estimatedCompletion: req.body.estimatedCompletion || null,
        technician: req.body.technician || '',
        notes: req.body.notes || 'Repair created',
      });

      // Save to database
      const savedRepair = await newRepair.save();

      // Populate customer details in the response
      const populatedRepair = await Repair.findById(savedRepair._id).populate('customer');

      res.status(201).json({
        success: true,
        message: 'Repair created successfully',
        data: populatedRepair,
      });
    } catch (error) {
      console.error('Error creating repair:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating repair',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;
