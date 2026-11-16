import { PackageRepository } from './package.repository.js';
import { CounterRepository } from '../counters/counter.repository.js';
import { ProviderRepository } from '../providers/provider.repository.js';
import { formatPaginationMeta } from '../../lib/pagination.js';
import { AppError } from '../../lib/app-error.js';

export class PackageService {
  constructor() {
    this.repo = new PackageRepository();
    this.counterRepo = new CounterRepository();
    this.providerRepo = new ProviderRepository();
  }

  async list(filters, parentCounterId) {
    if (parentCounterId) await this.getCounter(parentCounterId);
    const { counterId = parentCounterId, q, providerId, publicationStatus, availabilityStatus, page = 1, limit = 10 } = filters;
    const { items, total } = await this.repo.findAll({
      counterId: parentCounterId || counterId,
      q,
      providerId,
      publicationStatus,
      availabilityStatus,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async getById(id, counterId) {
    const pkg = await this.repo.findById(id, counterId);
    if (!pkg) {
      throw new AppError('Paket tidak ditemukan', 404, 'NOT_FOUND');
    }
    return pkg;
  }

  async getCounter(counterId) {
    const counter = await this.counterRepo.findById(counterId);
    if (!counter) {
      throw new AppError('Konter tidak ditemukan.', 404, 'NOT_FOUND');
    }
    return counter;
  }

  async create(data, parentCounterId) {
    if (parentCounterId && data.counterId && data.counterId !== parentCounterId) {
      throw new AppError('Konter pemilik harus sesuai dengan halaman konter.', 400, 'COUNTER_MISMATCH');
    }
    const counterId = parentCounterId || data.counterId;
    const counter = await this.getCounter(counterId);
    if (counter.publicationStatus !== 'published') {
      throw new AppError('Terbitkan konter terlebih dahulu sebelum menambahkan paket.', 409, 'COUNTER_NOT_PUBLISHED');
    }

    const provider = await this.providerRepo.findById(data.providerId);
    if (!provider) {
      throw new AppError('Provider tidak valid atau tidak ditemukan.', 400, 'INVALID_PROVIDER');
    }

    return this.repo.create({ ...data, counterId });
  }

  async update(id, data, parentCounterId) {
    const pkg = await this.getById(id, parentCounterId);

    if (data.counterId && data.counterId !== pkg.counterId) {
      throw new AppError('Konter pemilik paket tidak dapat diubah.', 400, 'COUNTER_MISMATCH');
    }

    if (data.providerId) {
      const provider = await this.providerRepo.findById(data.providerId);
      if (!provider) throw new AppError('Provider tidak valid.', 400, 'INVALID_PROVIDER');
    }

    const updated = await this.repo.update(id, data, pkg.counterId);
    if (!updated) throw new AppError('Paket tidak ditemukan', 404, 'NOT_FOUND');
    return updated;
  }

  async remove(id, counterId) {
    const deleted = await this.repo.remove(id, counterId);
    if (!deleted) throw new AppError('Paket tidak ditemukan', 404, 'NOT_FOUND');
  }
}

