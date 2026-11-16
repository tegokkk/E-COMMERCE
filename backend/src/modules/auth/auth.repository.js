import { db } from '../../database/connection.js';

export class AuthRepository {
  async findByEmail(email) {
    return db('admins').where({ email: email.toLowerCase().trim() }).first();
  }

  async findById(id) {
    return db('admins')
      .select('id', 'email', 'name', 'role', 'is_active as isActive', 'created_at as createdAt')
      .where({ id })
      .first();
  }
}

