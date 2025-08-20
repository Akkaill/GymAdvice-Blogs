import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

let authOk = true;

vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    if (!authOk) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { _id: 'u1' };
    next();
  }
}));

vi.mock('../models/notification.model.js', () => ({
  default: {
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  }
}));

import notificationRoutes from '../routes/notification.route.js';
import Notification from '../models/notification.model.js';

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
});

beforeEach(() => {
  vi.clearAllMocks();
  authOk = true;
});

describe('Notification controller', () => {
  it('returns notifications for authenticated user', async () => {
    Notification.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ _id: 'n1', message: 'hi' }]),
    });

    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('handles errors when fetching notifications', async () => {
    Notification.find.mockImplementation(() => { throw new Error('DB error'); });

    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(500);
  });

  it('marks notification as read', async () => {
    Notification.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app).post('/api/notifications/123/read');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 when marking read fails', async () => {
    Notification.findByIdAndUpdate.mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app).post('/api/notifications/123/read');
    expect(res.statusCode).toBe(500);
  });
});
