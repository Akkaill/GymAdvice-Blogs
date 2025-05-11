import Blog from '../models/blogs.model.js'
import mongoose from 'mongoose';


export const getBlogs =  async (req, res) => {
    try {
        const blogs = await Blog.find({})
        res.status(200).json({ success: true, data: blogs })
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" })
    }

}

export const getBlogById = async(req,res)=>{
    const {id}= req.params
    try{
        const Blog = await Blog.findById(id)
        res.status(200).json({success:true,data:Blog})

    }catch(error){
        res.status(500).json({success:false,message:"Failure to FetchById"})
    }
}

export const createBlog = async (req, res) => {
    const blog = req.body;
    if (!blog.title || !blog.subtitle || !blog.description || !blog.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" })
    }

    const newBlog = new Blog(blog)
    try {
        await newBlog.save()
        res.status(201).json({ success: true, data: newBlog })
    } catch (error) {
        console.error("Error in Create blog", error.message)
        res.status(500).json({ seccess: false, message: "Server error to create" })
    }
}

export const updateBlog = async (req, res) => {
    const { id } = req.params
    const blog = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "InvalidId" })
    }

    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
        res.status(200).json({ success: true, data: updateBlog })
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error to Update" })
    }
}

export const deleteBlog =  async (req, res) => {
    const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "InvalidId" })
    }
    try {
        await Blog.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: "deleted completely" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error to Delete" })
    }
    console.log('deleted', id)

}
