import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import {v2 as cloudinary} from 'cloudinary'

dotenv.config();
const app = express();
connectDB();

const PORT = process.env.PORT   || 6000
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUDNAME,
    api_key : process.env.CLOUDINARY_KEY,
    api_secret : process.env.CLOUDINARY_APISECRET
});

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser())

// routes 
app.use("/api/users", userRoutes )
app.use("/api/posts", postRoutes )

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}`))
