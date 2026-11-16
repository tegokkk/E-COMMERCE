import { AppError } from '../lib/app-error.js';
import { db } from '../database/connection.js';

export async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return next(new AppError('Sesi tidak valid atau telah berakhir. Silakan login kembali.', 401, 'UNAUTHORIZED'));
  }

  try {
    const admin = await db('admins')
      .where({ id: req.session.adminId, is_active: true })
      .first();

    if (!admin) {
      // Hapus sesi jika akun dinonaktifkan atau dihapus
      req.session.destroy(() => {});
      return next(new AppError('Akun admin tidak ditemukan atau telah dinonaktifkan.', 401, 'UNAUTHORIZED'));
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

