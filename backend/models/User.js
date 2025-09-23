const bcrypt = require('bcryptjs');

class User {
  constructor(pool) {
    this.pool = pool;
  }

  async create(userData) {
    const { name, email, password, phone, role = 'citizen', department } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password_hash, phone, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, role, department, is_active, created_at
    `;
    
    const values = [name, email, password_hash, phone, role, department];
    const result = await this.pool.query(query, values);
    
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1 AND is_active = true`;
    const result = await this.pool.query(query, [email.toLowerCase()]);
    return result.rows[0];
  }

  async findById(id) {
    const query = `
      SELECT id, name, email, phone, role, department, is_active, created_at
      FROM users WHERE id = $1 AND is_active = true
    `;
    const result = await this.pool.query(query, [parseInt(id)]);
    return result.rows[0];
  }

  async findOfficials() {
    const query = `
      SELECT id, name, email, department, role
      FROM users 
      WHERE role IN ('official', 'admin') AND is_active = true
      ORDER BY department, name
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async findAll(filters = {}) {
    let query = `
      SELECT id, name, email, phone, role, department, is_active, created_at
      FROM users 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (filters.role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      values.push(filters.role);
    }

    if (filters.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(filters.department);
    }

    if (filters.is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async updateRole(id, role, department = null) {
    const query = `
      UPDATE users 
      SET role = $1, department = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND is_active = true
      RETURNING id, name, email, phone, role, department, is_active, created_at
    `;
    
    const result = await this.pool.query(query, [role, department, parseInt(id)]);
    return result.rows[0];
  }

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
    `;
    
    await this.pool.query(query, [password_hash, parseInt(id)]);
    return true;
  }

  async updateProfile(id, updateData) {
    const { name, phone, department } = updateData;
    const query = `
      UPDATE users 
      SET name = $1, phone = $2, department = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND is_active = true
      RETURNING id, name, email, phone, role, department, is_active, created_at
    `;
    
    const result = await this.pool.query(query, [name, phone, department, parseInt(id)]);
    return result.rows[0];
  }

  async deactivateUser(id) {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, is_active
    `;
    
    const result = await this.pool.query(query, [parseInt(id)]);
    return result.rows[0];
  }
}

module.exports = User;
