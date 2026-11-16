import { CatalogService } from './catalog.service.js';

export class CatalogController {
  constructor() {
    this.service = new CatalogService();
  }

  getSettings = async (req, res, next) => {
    try {
      const data = await this.service.getSettings();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getProviders = async (req, res, next) => {
    try {
      const data = await this.service.getProviders();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getRegions = async (req, res, next) => {
    try {
      const data = await this.service.getRegions();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getCounters = async (req, res, next) => {
    try {
      const { counters, meta } = await this.service.getCounters(req.query);
      res.json({ data: counters, meta });
    } catch (err) {
      next(err);
    }
  };

  getLocations = async (req, res, next) => {
    try {
      res.json({ data: await this.service.getLocations() });
    } catch (err) {
      next(err);
    }
  };

  getCounterDetail = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { providerId } = req.query;
      const data = await this.service.getCounterDetail(id, { providerId });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getContact = async (req, res, next) => {
    try {
      const { counterId, packageId } = req.query;
      const data = await this.service.generateContactUrl({ counterId, packageId });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };
}

