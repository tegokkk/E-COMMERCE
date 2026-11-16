import { RegionRepository } from './region.repository.js';
import { AppError } from '../../lib/app-error.js';

export class RegionService {
  constructor() {
    this.repo = new RegionRepository();
  }

  async list() {
    return this.repo.findAll();
  }

  async create(name) {
    const existing = await this.repo.findByName(name);
    if (existing) {
      throw new AppError('Wilayah dengan nama tersebut sudah terdaftar.', 400, 'DUPLICATE_NAME');
    }
    return this.repo.create(name);
  }

  async update(id, name) {
    const region = await this.repo.findById(id);
    if (!region) {
      throw new AppError('Wilayah tidak ditemukan.', 404, 'NOT_FOUND');
    }

    const existing = await this.repo.findByName(name);
    if (existing && existing.id !== id) {
      throw new AppError('Wilayah dengan nama tersebut sudah terdaftar.', 400, 'DUPLICATE_NAME');
    }

    return this.repo.update(id, name);
  }

  async remove(id) {
    const region = await this.repo.findById(id);
    if (!region) throw new AppError('Wilayah tidak ditemukan.', 404, 'NOT_FOUND');
    const counterCount = await this.repo.countCounters(id);
    if (counterCount) {
      throw new AppError(`Wilayah masih dipakai oleh ${counterCount} konter. Pindahkan atau hapus konter terlebih dahulu.`, 409, 'REGION_IN_USE');
    }
    try {
      await this.repo.remove(id);
    } catch (error) {
      if (error.code === '23503') {
        throw new AppError('Wilayah masih dipakai oleh konter. Pindahkan atau hapus konter terlebih dahulu.', 409, 'REGION_IN_USE');
      }
      throw error;
    }
  }
}

