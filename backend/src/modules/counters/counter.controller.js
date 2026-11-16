import { CounterService } from './counter.service.js';

export class CounterController {
  constructor() {
    this.service = new CounterService();
  }

  list = async (req, res, next) => {
    try {
      const { items, meta } = await this.service.list(req.query);
      res.json({ data: items, meta });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getById(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getImpact = async (req, res, next) => {
    try {
      res.json({ data: await this.service.getImpact(req.params.id) });
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

  remove = async (req, res, next) => {
    try {
      await this.service.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

