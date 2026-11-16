import { SettingsRepository } from './settings.repository.js';
import { normalizeWhatsAppNumber } from '../../lib/whatsapp.js';

export class SettingsService {
  constructor() {
    this.repo = new SettingsRepository();
  }

  async get() {
    return this.repo.getSettings();
  }

  async update(data) {
    const payload = { ...data };
    if (data.managerWhatsapp) {
      payload.managerWhatsapp = normalizeWhatsAppNumber(data.managerWhatsapp);
    }
    return this.repo.updateSettings(payload);
  }
}

