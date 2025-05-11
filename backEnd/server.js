import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js';
import blogRoutes from "./routes/blog.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT
app.use(express.json());
app.use("/api/blogs", blogRoutes)



app.listen(PORT, () => {
    connectDB();
    console.log("Sever started at http://localhost:" + PORT);
});

