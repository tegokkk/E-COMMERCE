import { z } from 'zod';
import { hashPassword } from './password.js';

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(2).max(100).default('Admin KonterKuota'),
  password: z.string().min(12).refine((value) => !/CHANGE_ME|REPLACE_WITH|AdminPassword123!/i.test(value)),
});

/** Creates only the first admin; never replaces accounts or resets passwords. */
export async function ensureInitialAdmin(database, credentials) {
  return database.transaction(async (trx) => {
    await trx.raw("SELECT pg_advisory_xact_lock(hashtext('konterkuota-initial-admin'))");
    if (await trx('admins').first('id')) return { created: false };
    const parsed = credentialsSchema.safeParse(credentials);
    if (!parsed.success) {
      throw new Error('Database masih kosong. Isi INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD (minimal 12 karakter, bukan password contoh), dan opsional INITIAL_ADMIN_NAME di environment Vercel.');
    }
    const { email, password, name } = parsed.data;
    await trx('admins').insert({ email, name, password_hash: await hashPassword(password), role: 'admin', is_active: true });
    return { created: true };
  });
}
