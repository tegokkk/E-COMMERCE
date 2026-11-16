import { ProviderService } from './provider.service.js';

export class ProviderController {
  constructor() {
    this.service = new ProviderService();
  }

  list = async (req, res, next) => {
    try {
      const data = await this.service.list();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getImpact = async (req, res, next) => {
    try {
      const data = await this.service.getImpact(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req, res, next) => {
    try {
      await this.service.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

