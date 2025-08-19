import test from 'node:test';
import assert from 'node:assert/strict';
import * as BlogModel from '../../models/blogs.model.js';
import { updateBlog } from '../blog.controller.js';

test('updateBlog forwards errors when save fails', async () => {
  const saveError = new Error('Save failed');

  const fakeBlog = {
    user: { equals: () => true },
    save: async () => { throw saveError; }
  };

  const originalFindById = BlogModel.default.findById;
  BlogModel.default.findById = async () => fakeBlog;

  const req = {
    params: { id: '1' },
    body: {},
    user: { _id: '1', role: 'user' }
  };

  const res = {
    status: () => res,
    json: () => {}
  };

  let receivedError;
  const next = (err) => {
    receivedError = err;
  };

  await updateBlog(req, res, next);

  assert.strictEqual(receivedError, saveError);

  BlogModel.default.findById = originalFindById;
});