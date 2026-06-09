'use strict';

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

jest.mock('../../../src/logs/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../src/services/studentPortfolioService');
const studentPortfolioService = require('../../../src/services/studentPortfolioService');

const portfolioRouter = require('../../../src/routes/portfolioRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/portfolio', portfolioRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests d'Intégration - Routes Portfolio Public (portfolioRoutes)", () => {

  describe('Endpoints Logic', () => {

    it('TC-PORT-PUB-01 : getPublicPortfolio -> 200', async () => {
      const mockPortfolio = { id: 'portfolio-123', slug: 'john-doe', student: { firstName: 'John' } };
      studentPortfolioService.getPublicPortfolioBySlug.mockResolvedValue(mockPortfolio);

      const res = await request(app).get('/api/portfolio/john-doe');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockPortfolio);
      expect(studentPortfolioService.getPublicPortfolioBySlug).toHaveBeenCalledWith('john-doe');
    });

    it('TC-PORT-PUB-02 : getPublicPortfolio - Non trouvé -> 404', async () => {
      studentPortfolioService.getPublicPortfolioBySlug.mockRejectedValue(new Error('PUBLIC_PORTFOLIO_NOT_FOUND'));

      const res = await request(app).get('/api/portfolio/inconnu');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Portfolio public introuvable/i);
    });

  });

});
