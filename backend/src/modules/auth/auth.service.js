import { AuthRepository } from './auth.repository.js';
import { verifyPassword } from '../../lib/password.js';
import { AppError } from '../../lib/app-error.js';

export class AuthService {
  constructor() {
    this.repo = new AuthRepository();
  }

  async login(email, password) {
    const admin = await this.repo.findByEmail(email);

    // Generic error message without revealing if email exists (PRD FR-12 / TECH_STACK)
    if (!admin || !admin.is_active) {
      throw new AppError('Email atau password tidak sesuai.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await verifyPassword(admin.password_hash, password);
    if (!isValid) {
      throw new AppError('Email atau password tidak sesuai.', 401, 'INVALID_CREDENTIALS');
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  async getMe(adminId) {
    const admin = await this.repo.findById(adminId);
    if (!admin || !admin.isActive) {
      throw new AppError('Akun admin tidak aktif.', 401, 'UNAUTHORIZED');
    }
    return admin;
  }
}

