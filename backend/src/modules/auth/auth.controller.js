import { AuthService } from './auth.service.js';
import { generateToken } from '../../config/csrf.js';

export class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  getCsrf = (req, res) => {
    const csrfToken = generateToken(req);
    res.json({
      data: {
        csrfToken,
      },
    });
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const admin = await this.service.login(email, password);

      // Regenerasi ID sesi untuk mencegah Session Fixation
      req.session.regenerate((err) => {
        if (err) return next(err);

        req.session.adminId = admin.id;
        const newCsrfToken = generateToken(req, true);

        res.json({
          data: {
            admin,
            csrfToken: newCsrfToken,
          },
        });
      });
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req, res, next) => {
    try {
      const admin = await this.service.getMe(req.session.adminId);
      res.json({ data: admin });
    } catch (err) {
      next(err);
    }
  };

  logout = (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('konter_sid');
      res.status(204).end();
    });
  };
}

