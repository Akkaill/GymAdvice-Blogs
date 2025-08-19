import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlog, getBlogById } from './blog.controller.js';

// Hoisted mocks so they are available when module is mocked
const { save, mockFindById } = vi.hoisted(() => ({
  save: vi.fn(),
  mockFindById: vi.fn(),
}));

vi.mock('../models/blogs.model.js', () => {
  function MockBlog(data) {
    return { ...data, save };
  }
  MockBlog.findById = mockFindById;
  return { default: MockBlog };
});

function createRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createBlog', () => {
  it('returns 401 if user is missing', async () => {
    const req = {
      body: { title: 't', subtitle: 's', description: 'd', image: 'i' }
    };
    const res = createRes();

    await createBlog(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
  });

  it('returns 400 if required fields are missing', async () => {
    const req = {
      body: { title: 't', subtitle: 's', description: 'd' },
      user: { _id: 'u1' }
    };
    const res = createRes();

    await createBlog(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Please provide all fields' });
  });

  it('saves blog and returns 201 on success', async () => {
    const req = {
      body: { title: 't', subtitle: 's', description: 'd', image: 'i' },
      user: { _id: 'u1' }
    };
    const res = createRes();
    save.mockResolvedValueOnce();

    await createBlog(req, res);

    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Blog created', data: expect.objectContaining({ title: 't' }) });
  });
});

describe('getBlogById', () => {
  it('returns 404 if blog not found', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();

    mockFindById.mockReturnValueOnce({
      populate: () => ({
        populate: () => ({
          lean: () => Promise.resolve(null)
        })
      })
    });

    await getBlogById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Blog not found' });
  });

  it('returns blog data when found', async () => {
    const req = { params: { id: '1' } };
    const res = createRes();
    const blogData = { _id: '1', title: 't' };

    mockFindById.mockReturnValueOnce({
      populate: () => ({
        populate: () => ({
          lean: () => Promise.resolve(blogData)
        })
      })
    });

    await getBlogById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: blogData });
  });
});