import { SettingsService } from './settings.service.js';

export class SettingsController {
  constructor() {
    this.service = new SettingsService();
  }

  get = async (req, res, next) => {
    try {
      const data = await this.service.get();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };
}

