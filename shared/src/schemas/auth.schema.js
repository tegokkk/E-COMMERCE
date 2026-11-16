import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email wajib diisi' })
    .trim()
    .email('Format email tidak valid'),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Password saat ini wajib diisi' })
    .min(1, 'Password saat ini wajib diisi'),
  newPassword: z
    .string({ error: 'Password baru wajib diisi' })
    .min(8, 'Password baru minimal 8 karakter'),
});

