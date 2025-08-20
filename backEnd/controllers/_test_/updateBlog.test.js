import { describe, it, expect } from "vitest";
import * as BlogModel from "../../models/blogs.model.js";
import { updateBlog } from "../blog.controller.js";

describe("updateBlog", () => {
  it("forwards errors when save fails", async () => {
    const saveError = new Error("Save failed");

    const fakeBlog = {
      user: { equals: () => true },
      save: async () => {
        throw saveError;
      },
    };

    const originalFindById = BlogModel.default.findById;
    BlogModel.default.findById = async () => fakeBlog;

    const req = {
      params: { id: "1" },
      body: {},
      user: { _id: "1", role: "user" },
    };

    const res = {
      status: () => res,
      json: () => {},
    };

    let receivedError;
    const next = (err) => {
      receivedError = err;
    };
    await updateBlog(req, res, next);

    expect(receivedError).toBe(saveError);

    BlogModel.default.findById = originalFindById;
  });
});
