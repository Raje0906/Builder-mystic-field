import db from '../database/db.js';

class Sale {
  static create(saleData) {
    const {
      customer_id, items, total_amount, discount = 0, tax = 0,
      payment_method, payment_status = 'pending', notes
    } = saleData;

    // Start transaction
    const transaction = db.transaction(() => {
      // Create sale record
      const saleStmt = db.prepare(`
        INSERT INTO sales (customer_id, total_amount, discount, tax, payment_method, payment_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const saleResult = saleStmt.run(customer_id, total_amount, discount, tax, payment_method, payment_status, notes);
      const saleId = saleResult.lastInsertRowid;

      // Create sale items and update product stock
      const itemStmt = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const stockStmt = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      for (const item of items) {
        itemStmt.run(saleId, item.product_id, item.quantity, item.unit_price, item.total_price);
        stockStmt.run(item.quantity, item.product_id);
      }

      return saleId;
    });

    const saleId = transaction();
    return this.findById(saleId);
  }

  static findAll(page = 1, limit = 20, startDate = null, endDate = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT s.*, c.name as customer_name, c.phone as customer_phone
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM sales s';
    const params = [];

    if (startDate && endDate) {
      query += ' WHERE s.sale_date BETWEEN ? AND ?';
      countQuery += ' WHERE s.sale_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY s.sale_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const sales = db.prepare(query).all(...params);
    const countParams = params.slice(0, -2); // Remove limit and offset for count
    const totalResult = db.prepare(countQuery).get(...countParams);
    
    return {
      sales,
      total: totalResult.total,
      page,
      totalPages: Math.ceil(totalResult.total / limit)
    };
  }

  static findById(id) {
    const sale = db.prepare(`
      SELECT s.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `).get(id);

    if (sale) {
      const items = db.prepare(`
        SELECT si.*, p.name as product_name, p.brand, p.model
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `).all(id);
      
      sale.items = items;
    }

    return sale;
  }

  static update(id, saleData) {
    const { payment_status, notes } = saleData;
    const stmt = db.prepare(`
      UPDATE sales 
      SET payment_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(payment_status, notes, id);
    return this.findById(id);
  }

  static delete(id) {
    // Start transaction to restore stock and delete sale
    const transaction = db.transaction(() => {
      // Get sale items to restore stock
      const items = db.prepare('SELECT product_id, quantity FROM sale_items WHERE sale_id = ?').all(id);
      
      // Restore stock
      const stockStmt = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      for (const item of items) {
        stockStmt.run(item.quantity, item.product_id);
      }

      // Delete sale (items will be deleted by CASCADE)
      const deleteStmt = db.prepare('DELETE FROM sales WHERE id = ?');
      return deleteStmt.run(id);
    });

    return transaction();
  }

  static getStats(startDate = null, endDate = null) {
    let dateCondition = '';
    const params = [];

    if (startDate && endDate) {
      dateCondition = ' WHERE sale_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const totalSales = db.prepare(`SELECT COUNT(*) as count FROM sales${dateCondition}`).get(...params);
    const totalRevenue = db.prepare(`SELECT SUM(total_amount) as revenue FROM sales${dateCondition}`).get(...params);
    const avgSale = db.prepare(`SELECT AVG(total_amount) as avg FROM sales${dateCondition}`).get(...params);

    return {
      totalSales: totalSales.count,
      totalRevenue: totalRevenue.revenue || 0,
      averageSale: avgSale.avg || 0
    };
  }

  static getDailySales(days = 30) {
    return db.prepare(`
      SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        SUM(total_amount) as revenue
      FROM sales
      WHERE sale_date >= date('now', '-${days} days')
      GROUP BY DATE(sale_date)
      ORDER BY date DESC
    `).all();
  }
}

export default Sale;