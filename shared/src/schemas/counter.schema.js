import { z } from 'zod';
import { PUBLICATION_STATUS, PUBLICATION_STATUS_VALUES } from '../constants/publication-status.js';

// Regex nomor WhatsApp Indonesia: diawali 08, 628, atau +628, minimal 9 digit dan maksimal 15 digit
export const INDONESIAN_PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;

const imageHosts = new Set(
  (process.env.IMAGE_ALLOWED_HOSTS || 'lh3.googleusercontent.com,images.unsplash.com')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
);

export function isAllowedPhotoUrl(value) {
  if (!value) return true;
  if (/^\/api\/v1\/uploads\/counters\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i.test(value)) {
    return true;
  }
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp|avif|svg)$/i.test(value) && !value.includes('..')) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && imageHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function isAllowedMapUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      url.hostname === 'maps.google.com' ||
      url.hostname === 'maps.app.goo.gl' ||
      ((url.hostname === 'google.com' || url.hostname === 'www.google.com') && url.pathname.startsWith('/maps'))
    );
  } catch {
    return false;
  }
}

export const counterBaseSchema = z.object({
  name: z
    .string({ error: 'Nama konter wajib diisi' })
    .trim()
    .min(2, 'Nama konter minimal 2 karakter')
    .max(100, 'Nama konter maksimal 100 karakter'),
  description: z.string().trim().max(1000, 'Deskripsi maksimal 1000 karakter').optional().default(''),
  photoUrl: z
    .string()
    .trim()
    .refine(isAllowedPhotoUrl, 'Unggah foto, gunakan path /images/..., atau HTTPS dari host gambar yang diizinkan')
    .nullable()
    .optional(),
  province: z.string().trim().max(100, 'Nama provinsi maksimal 100 karakter').optional().default(''),
  city: z.string().trim().max(100, 'Nama kota/kabupaten maksimal 100 karakter').optional().default(''),
  regionId: z.string().guid({ message: 'ID Wilayah tidak valid' }).nullable().optional(),
  address: z.string().trim().max(255, 'Alamat maksimal 255 karakter').optional().default(''),
  mapUrl: z
    .string()
    .trim()
    .refine(isAllowedMapUrl, 'Gunakan tautan HTTPS Google Maps yang valid')
    .nullable()
    .optional(),
  whatsapp: z.string().trim().optional().default(''),
  operatingHours: z.string().trim().max(100, 'Jam operasional maksimal 100 karakter').optional().default(''),
  publicationStatus: z.enum(PUBLICATION_STATUS_VALUES).default(PUBLICATION_STATUS.DRAFT),
});

function refineCreate(data, ctx) {
  if (data.publicationStatus === PUBLICATION_STATUS.PUBLISHED) {
    if (!data.city && !data.regionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['city'],
        message: 'Kota/Kabupaten atau Wilayah wajib dipilih untuk konter yang diterbitkan',
      });
    }
    if (!data.address || data.address.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: 'Alamat lengkap wajib diisi minimal 5 karakter untuk konter yang diterbitkan',
      });
    }
    if (!data.whatsapp || !INDONESIAN_PHONE_REGEX.test(data.whatsapp.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['whatsapp'],
        message: 'Nomor WhatsApp wajib valid (contoh: 08123456789 atau 628123456789)',
      });
    }
  }
}

export const counterCreateSchema = counterBaseSchema.superRefine(refineCreate);
export const counterUpdateSchema = counterBaseSchema.extend({
  description: counterBaseSchema.shape.description.removeDefault(),
  province: counterBaseSchema.shape.province.removeDefault(),
  city: counterBaseSchema.shape.city.removeDefault(),
  address: counterBaseSchema.shape.address.removeDefault(),
  whatsapp: counterBaseSchema.shape.whatsapp.removeDefault(),
  operatingHours: counterBaseSchema.shape.operatingHours.removeDefault(),
  publicationStatus: counterBaseSchema.shape.publicationStatus.removeDefault(),
}).partial();
