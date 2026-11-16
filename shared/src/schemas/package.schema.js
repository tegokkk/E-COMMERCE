import { z } from 'zod';
import { PUBLICATION_STATUS, PUBLICATION_STATUS_VALUES } from '../constants/publication-status.js';
import { AVAILABILITY_STATUS, AVAILABILITY_STATUS_VALUES } from '../constants/availability-status.js';

export const packageBaseSchema = z.object({
  counterId: z.string({ error: 'Konter wajib dipilih' }).guid({ message: 'ID Konter tidak valid' }),
  providerId: z.string({ error: 'Provider wajib dipilih' }).guid({ message: 'ID Provider tidak valid' }),
  name: z
    .string({ error: 'Nama paket wajib diisi' })
    .trim()
    .min(2, 'Nama paket minimal 2 karakter')
    .max(100, 'Nama paket maksimal 100 karakter'),
  quotaSummary: z
    .string({ error: 'Ringkasan kuota wajib diisi' })
    .trim()
    .min(1, 'Ringkasan kuota wajib diisi (contoh: 14 GB)')
    .max(100, 'Ringkasan kuota maksimal 100 karakter'),
  quotaDetails: z
    .string()
    .trim()
    .max(500, 'Rincian kuota maksimal 500 karakter')
    .optional()
    .default(''),
  activePeriod: z
    .string({ error: 'Masa aktif wajib diisi' })
    .trim()
    .min(1, 'Masa aktif wajib diisi (contoh: 30 Hari)')
    .max(50, 'Masa aktif maksimal 50 karakter'),
  price: z
    .number({ error: 'Harga wajib diisi' })
    .int('Harga harus berupa bilangan bulat')
    .positive('Harga harus lebih besar dari nol'),
  terms: z
    .string()
    .trim()
    .max(1000, 'Syarat & ketentuan maksimal 1000 karakter')
    .optional()
    .default(''),
  availabilityStatus: z.enum(AVAILABILITY_STATUS_VALUES).default(AVAILABILITY_STATUS.AVAILABLE),
  publicationStatus: z.enum(PUBLICATION_STATUS_VALUES).default(PUBLICATION_STATUS.DRAFT),
  displayUntil: z
    .string()
    .datetime({ message: 'Batas penayangan harus format ISO 8601' })
    .or(z.literal(''))
    .nullable()
    .optional(),
});

function refineCreate(data, ctx) {
  if (data.publicationStatus === PUBLICATION_STATUS.PUBLISHED) {
    if (data.displayUntil) {
      const untilDate = new Date(data.displayUntil);
      if (isNaN(untilDate.getTime()) || untilDate < new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['displayUntil'],
          message: 'Batas penayangan tidak boleh tanggal yang sudah lewat untuk paket diterbitkan',
        });
      }
    }
  }
}

export const packageCreateSchema = packageBaseSchema.superRefine(refineCreate);
// The parent URL supplies the owner; a supplied body owner is checked by the service.
export const counterPackageCreateSchema = packageBaseSchema.extend({
  counterId: packageBaseSchema.shape.counterId.optional(),
}).superRefine(refineCreate);

export const packageListQuerySchema = z.object({
  counterId: z.string().guid().optional(),
  providerId: z.string().guid().optional(),
  q: z.string().trim().max(100).optional(),
  publicationStatus: z.enum(PUBLICATION_STATUS_VALUES).optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const counterPackageParamsSchema = z.object({
  counterId: z.string().guid(),
  id: z.string().guid().optional(),
});
export const packageUpdateSchema = packageBaseSchema.extend({
  quotaDetails: packageBaseSchema.shape.quotaDetails.removeDefault(),
  terms: packageBaseSchema.shape.terms.removeDefault(),
  availabilityStatus: packageBaseSchema.shape.availabilityStatus.removeDefault(),
  publicationStatus: packageBaseSchema.shape.publicationStatus.removeDefault(),
}).partial();
