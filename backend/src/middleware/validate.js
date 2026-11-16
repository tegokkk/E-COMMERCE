import { AppError } from '../lib/app-error.js';

export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
      const parsed = await schema.parseAsync(data);

      if (source === 'query') {
        req.query = parsed;
      } else if (source === 'params') {
        req.params = parsed;
      } else {
        req.body = parsed;
      }

      next();
    } catch (err) {
      if (Array.isArray(err.issues)) {
        const fields = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.') || 'root';
          if (!fields[path]) {
            fields[path] = issue.message;
          }
        }
        return next(new AppError('Periksa kembali data yang diisi.', 400, 'VALIDATION_ERROR', fields));
      }
      next(err);
    }
  };
}

