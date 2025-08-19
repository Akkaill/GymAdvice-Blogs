import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'userId', role: 'user' };
    next();
  },
  isBlogOwner: (req, res, next) => next(),
}));

import blogRoutes from '../routes/blog.route.js';

const app = express();
app.use(express.json());
app.use('/api/blogs', blogRoutes);

describe('Blog validation', () => {
  it('should return 400 when required fields are missing on create', async () => {
    const res = await request(app).post('/api/blogs').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 when updating with empty title', async () => {
    const res = await request(app)
      .put('/api/blogs/123')
      .send({ title: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});