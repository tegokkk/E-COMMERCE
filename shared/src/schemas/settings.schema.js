import { z } from 'zod';
import { INDONESIAN_PHONE_REGEX } from './counter.schema.js';

export const faqItemSchema = z.object({
  question: z.string().trim().min(3, 'Pertanyaan minimal 3 karakter'),
  answer: z.string().trim().min(3, 'Jawaban minimal 3 karakter'),
});

export const platformSettingsSchema = z.object({
  platformName: z
    .string({ error: 'Nama platform wajib diisi' })
    .trim()
    .min(2, 'Nama platform minimal 2 karakter')
    .max(100, 'Nama platform maksimal 100 karakter'),
  heroTitle: z.string().trim().max(150).optional().default('Cari Paket Data dari Konter di Wilayah Pilihanmu'),
  heroSubtitle: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default('Lihat rincian paket dan harga yang dicantumkan konter, lalu tanyakan ketersediaannya lewat WhatsApp.'),
  logoUrl: z
    .string()
    .trim()
    .url('Format URL logo tidak valid')
    .or(z.literal(''))
    .nullable()
    .optional(),
  description: z.string().trim().max(500).optional().default('Direktori pemasaran bersama konter kuota UMKM.'),
  managerWhatsapp: z
    .string({ error: 'Nomor WhatsApp pengelola wajib diisi' })
    .trim()
    .regex(INDONESIAN_PHONE_REGEX, 'Nomor WhatsApp pengelola wajib valid (contoh: 08123456789)')
    .or(z.literal('')),
  publicContactEmail: z
    .string()
    .trim()
    .email('Format email tidak valid')
    .or(z.literal(''))
    .nullable()
    .optional(),
  pilotRegion: z
    .string({ error: 'Wilayah pilot wajib diisi' })
    .trim()
    .min(2, 'Wilayah pilot minimal 2 karakter'),
  faqs: z.array(faqItemSchema).default([]),
});

export const platformSettingsUpdateSchema = platformSettingsSchema.extend({
  heroTitle: platformSettingsSchema.shape.heroTitle.removeDefault(),
  heroSubtitle: platformSettingsSchema.shape.heroSubtitle.removeDefault(),
  description: platformSettingsSchema.shape.description.removeDefault(),
  faqs: platformSettingsSchema.shape.faqs.removeDefault(),
}).partial();

