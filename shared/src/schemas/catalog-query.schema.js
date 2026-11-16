import { z } from 'zod';

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  providerId: z.string().guid().or(z.literal('')).optional().default(''),
  regionId: z.string().guid().or(z.literal('')).optional().default(''),
  province: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const contactQuerySchema = z.object({
  counterId: z.string({ error: 'ID Konter wajib diisi' }).guid({ message: 'ID Konter tidak valid' }),
  packageId: z.string().guid({ message: 'ID Paket tidak valid' }).optional(),
});

