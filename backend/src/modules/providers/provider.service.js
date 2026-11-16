import { ProviderRepository } from './provider.repository.js';
import { AppError } from '../../lib/app-error.js';

export class ProviderService {
  constructor() {
    this.repo = new ProviderRepository();
  }

  async list() {
    return this.repo.findAll();
  }

  async getById(id) {
    const provider = await this.repo.findById(id);
    if (!provider) {
      throw new AppError('Provider tidak ditemukan', 404, 'NOT_FOUND');
    }
    return provider;
  }

  async create(data) {
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw new AppError('Provider dengan nama tersebut sudah terdaftar.', 400, 'DUPLICATE_NAME');
    }
    return this.repo.create(data);
  }

  async update(id, data) {
    await this.getById(id);

    if (data.name) {
      const existing = await this.repo.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError('Provider dengan nama tersebut sudah terdaftar.', 400, 'DUPLICATE_NAME');
      }
    }

    return this.repo.update(id, data);
  }

  async getImpact(id) {
    await this.getById(id);
    return this.repo.countImpact(id);
  }

  async remove(id) {
    await this.getById(id);
    const packageCount = await this.repo.countPackages(id);
    if (packageCount) {
      throw new AppError(`Provider masih dipakai oleh ${packageCount} paket. Hapus atau pindahkan paket terlebih dahulu.`, 409, 'PROVIDER_IN_USE');
    }
    try {
      await this.repo.remove(id);
    } catch (error) {
      if (error.code === '23503') {
        throw new AppError('Provider masih dipakai oleh paket. Hapus atau pindahkan paket terlebih dahulu.', 409, 'PROVIDER_IN_USE');
      }
      throw error;
    }
  }
}

