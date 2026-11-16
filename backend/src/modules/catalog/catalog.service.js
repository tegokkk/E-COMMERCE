import { CatalogRepository } from './catalog.repository.js';
import { formatPaginationMeta } from '../../lib/pagination.js';
import {
  createWhatsAppUrl,
  generatePackageInquiryMessage,
  generateGeneralCounterMessage,
} from '../../lib/whatsapp.js';
import { AppError } from '../../lib/app-error.js';

export class CatalogService {
  constructor() {
    this.repo = new CatalogRepository();
  }

  async getSettings() {
    return this.repo.getPublicSettings();
  }

  async getProviders() {
    return this.repo.getPublicProviders();
  }

  async getRegions() {
    return this.repo.getPublicRegions();
  }

  async getLocations() {
    return this.repo.getPublicLocations();
  }

  async getCounters(query) {
    const { q, providerId, regionId, province, city, page, limit } = query;
    const { counters, total } = await this.repo.findPublicCounters({
      q,
      providerId,
      regionId,
      province,
      city,
      page,
      limit,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { counters, meta };
  }

  async getCounterDetail(id, { providerId } = {}) {
    const counter = await this.repo.getPublicCounterDetail(id, { providerId });
    if (!counter) {
      throw new AppError('Konter tidak ditemukan atau belum diterbitkan', 404, 'NOT_FOUND');
    }
    return counter;
  }

  async generateContactUrl({ counterId, packageId }) {
    const settings = await this.repo.getPublicSettings();
    const platformName = settings?.platformName || 'KonterKuota';

    const result = await this.repo.validateContact({ counterId, packageId });

    if (!result.valid) {
      if (result.reason === 'DEMO_COUNTER') {
        throw new AppError('Konter ini adalah data contoh dan tidak menerima transaksi.', 409, 'DEMO_COUNTER');
      }
      if (result.reason === 'PACKAGE_UNAVAILABLE') {
        throw new AppError(
          'Paket yang Anda pilih sudah tidak tersedia atau telah kedaluwarsa. Silakan periksa daftar paket terbaru.',
          409,
          'PACKAGE_UNAVAILABLE'
        );
      }
      throw new AppError('Konter tidak ditemukan atau belum aktif.', 404, 'COUNTER_NOT_FOUND');
    }

    const counter = result.counter;
    let message = '';

    if (result.package) {
      const pkg = result.package;
      const formattedPrice = 'Rp' + pkg.price.toLocaleString('id-ID');
      message = generatePackageInquiryMessage({
        counterName: counter.name,
        platformName,
        packageName: pkg.name,
        providerName: pkg.providerName,
        quotaSummary: pkg.quotaSummary,
        activePeriod: pkg.activePeriod,
        priceFormatted: formattedPrice,
      });
    } else {
      message = generateGeneralCounterMessage({
        counterName: counter.name,
        platformName,
      });
    }

    const whatsappUrl = createWhatsAppUrl(counter.whatsapp, message);

    return {
      whatsappUrl,
      counterName: counter.name,
      packageName: result.package?.name || null,
    };
  }
}

