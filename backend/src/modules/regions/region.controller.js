import { RegionService } from './region.service.js';

export class RegionController {
  constructor() {
    this.service = new RegionService();
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
      const data = await this.service.create(req.body.name);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body.name);
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

