import { db } from '../../database/connection.js';

export class SettingsRepository {
  async getSettings() {
    const row = await db('platform_settings').where({ id: 1 }).first();
    if (!row) return null;
    return {
      platformName: row.platform_name,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      logoUrl: row.logo_url,
      description: row.description,
      managerWhatsapp: row.manager_whatsapp,
      publicContactEmail: row.public_contact_email,
      pilotRegion: row.pilot_region,
      faqs: typeof row.faqs === 'string' ? JSON.parse(row.faqs) : row.faqs || [],
      updatedAt: row.updated_at,
    };
  }

  async updateSettings(data) {
    const updatePayload = {
      updated_at: db.fn.now(),
    };

    if (data.platformName !== undefined) updatePayload.platform_name = data.platformName;
    if (data.heroTitle !== undefined) updatePayload.hero_title = data.heroTitle;
    if (data.heroSubtitle !== undefined) updatePayload.hero_subtitle = data.heroSubtitle;
    if (data.logoUrl !== undefined) updatePayload.logo_url = data.logoUrl || null;
    if (data.description !== undefined) updatePayload.description = data.description || null;
    if (data.managerWhatsapp !== undefined) updatePayload.manager_whatsapp = data.managerWhatsapp;
    if (data.publicContactEmail !== undefined) updatePayload.public_contact_email = data.publicContactEmail || null;
    if (data.pilotRegion !== undefined) updatePayload.pilot_region = data.pilotRegion;
    if (data.faqs !== undefined) updatePayload.faqs = JSON.stringify(data.faqs);

    await db('platform_settings').where({ id: 1 }).update(updatePayload);
    return this.getSettings();
  }
}

