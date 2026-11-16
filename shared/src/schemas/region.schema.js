import { z } from 'zod';

export const regionSchema = z.object({
  name: z
    .string({ error: 'Nama wilayah wajib diisi' })
    .trim()
    .min(2, 'Nama wilayah minimal 2 karakter')
    .max(100, 'Nama wilayah maksimal 100 karakter'),
});

