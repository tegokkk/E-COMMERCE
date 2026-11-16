import { PackageService } from './package.service.js';

export class PackageController {
  constructor() {
    this.service = new PackageService();
  }

  list = async (req, res, next) => {
    try {
      const { items, meta } = await this.service.list(req.query, req.params.counterId);
      res.json({ data: items, meta });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getById(req.params.id, req.params.counterId);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body, req.params.counterId);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body, req.params.counterId);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req, res, next) => {
    try {
      await this.service.remove(req.params.id, req.params.counterId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

