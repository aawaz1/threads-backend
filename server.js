import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import postRoutes from './routes/postRoutes.js';
import {v2 as cloudinary} from 'cloudinary';
import {app ,server} from './socket/socket.js';

dotenv.config();

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
app.use("/api/messages", messageRoutes )

server.listen(PORT, () => console.log(`server started at http://localhost:${PORT}`))
