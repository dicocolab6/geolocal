const db = require('../config/database');
const bcrypt = require('bcryptjs');
class AdminUser {
  static async findByEmail(email) {
    const r = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    return r.rows[0] || null;
  }
  static async validatePassword(plain, hash) {
    return await bcrypt.compare(plain, hash);
  }
}
module.exports = AdminUser;
