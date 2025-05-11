import express from "express"
import { createBlog, deleteBlog, getBlogById, getBlogs, updateBlog } from "../controllers/blog.controller.js";


const router = express.Router()

router.get("/",getBlogs)
router.get('/:id',getBlogById)
router.post('/',createBlog )
router.put('/:id',updateBlog)
router.delete('/:id',deleteBlog)

console.log(process.env.MONGO_URI)
export default router