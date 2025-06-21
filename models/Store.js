import db from '../database/db.js';

class Store {
  static create(storeData) {
    const { name, address, phone, email, manager, status = 'active' } = storeData;
    const stmt = db.prepare(`
      INSERT INTO stores (name, address, phone, email, manager, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, address, phone, email, manager, status);
    return this.findById(result.lastInsertRowid);
  }

  static findAll() {
    return db.prepare('SELECT * FROM stores ORDER BY created_at DESC').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
  }

  static update(id, storeData) {
    const { name, address, phone, email, manager, status } = storeData;
    const stmt = db.prepare(`
      UPDATE stores 
      SET name = ?, address = ?, phone = ?, email = ?, manager = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(name, address, phone, email, manager, status, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM stores WHERE id = ?');
    return stmt.run(id);
  }
}

export default Store;