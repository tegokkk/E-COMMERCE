import { CounterRepository } from './counter.repository.js';
import { formatPaginationMeta } from '../../lib/pagination.js';
import { AppError } from '../../lib/app-error.js';
import { normalizeWhatsAppNumber } from '../../lib/whatsapp.js';
import { INDONESIAN_PHONE_REGEX } from '@konter/shared';
import { removeUnreferencedCounterPhoto } from '../uploads/upload-storage.js';

export class CounterService {
  constructor() {
    this.repo = new CounterRepository();
  }

  async list(filters) {
    const { q, publicationStatus, regionId, page = 1, limit = 10 } = filters;
    const { items, total } = await this.repo.findAll({
      q,
      publicationStatus,
      regionId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async getById(id) {
    const counter = await this.repo.findById(id);
    if (!counter) {
      throw new AppError('Konter tidak ditemukan', 404, 'NOT_FOUND');
    }
    return counter;
  }

  async getImpact(id) {
    await this.getById(id);
    return this.repo.countImpact(id);
  }

  async create(data) {
    const payload = {
      ...data,
      whatsapp: normalizeWhatsAppNumber(data.whatsapp),
    };
    return this.repo.create(payload);
  }

  async update(id, data) {
    const existing = await this.getById(id);
    const payload = { ...data };

    if (data.whatsapp) {
      payload.whatsapp = normalizeWhatsAppNumber(data.whatsapp);
    }

    const merged = { ...existing, ...payload };
    if (merged.publicationStatus === 'published') {
      if (!merged.address || merged.address.trim().length < 5) {
        throw new AppError(
          'Alamat lengkap wajib diisi minimal 5 karakter untuk konter yang diterbitkan',
          400,
          'VALIDATION_ERROR',
          { address: 'Alamat minimal 5 karakter' }
        );
      }
      if (!merged.whatsapp || !INDONESIAN_PHONE_REGEX.test(merged.whatsapp.trim())) {
        throw new AppError(
          'Nomor WhatsApp wajib valid untuk konter yang diterbitkan',
          400,
          'VALIDATION_ERROR',
          { whatsapp: 'Nomor WhatsApp wajib valid' }
        );
      }
    }

    const updated = await this.repo.update(id, payload);
    if (!updated) throw new AppError('Konter tidak ditemukan', 404, 'NOT_FOUND');
    if (data.photoUrl !== undefined && existing.photoUrl && existing.photoUrl !== updated.photoUrl) {
      await removeUnreferencedCounterPhoto(existing.photoUrl, this.repo);
    }
    return updated;
  }

  async remove(id) {
    const existing = await this.getById(id);
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new AppError('Konter tidak ditemukan', 404, 'NOT_FOUND');
    if (existing.photoUrl) await removeUnreferencedCounterPhoto(existing.photoUrl, this.repo);
  }
}
