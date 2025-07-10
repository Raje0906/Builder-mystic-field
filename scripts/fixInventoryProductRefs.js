import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

dotenv.config();

async function fixInventoryProductRefs() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const inventoryItems = await Inventory.find({ $or: [ { product: { $exists: false } }, { product: null } ] });
  console.log(`Found ${inventoryItems.length} inventory items missing product reference.`);

  let updated = 0;
  for (const item of inventoryItems) {
    let product = null;
    // Try to match by SKU first
    if (item.sku) {
      product = await Product.findOne({ sku: item.sku });
    }
    // If not found by SKU, try name and brand
    if (!product) {
      product = await Product.findOne({ name: item.name, brand: item.brand });
    }
    if (product) {
      item.product = product._id;
      await item.save();
      updated++;
      console.log(`Updated inventory '${item.name}' (${item._id}) with product '${product.name}' (${product._id})`);
    } else {
      console.warn(`No matching product found for inventory '${item.name}' (ID: ${item._id}) [SKU: ${item.sku || 'N/A'}]`);
    }
  }

  console.log(`Updated ${updated} inventory items with product references.`);
  process.exit(0);
}

fixInventoryProductRefs().catch(err => {
  console.error('Error fixing inventory product refs:', err);
  process.exit(1);
}); 