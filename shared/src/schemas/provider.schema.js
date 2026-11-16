import { z } from 'zod';

export const providerSchema = z.object({
  name: z
    .string({ error: 'Nama provider wajib diisi' })
    .trim()
    .min(2, 'Nama provider minimal 2 karakter')
    .max(50, 'Nama provider maksimal 50 karakter'),
  logoUrl: z
    .string()
    .trim()
    .url('Format URL logo tidak valid')
    .or(z.literal(''))
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
});

export const providerUpdateSchema = providerSchema.extend({
  isActive: providerSchema.shape.isActive.removeDefault(),
}).partial();

