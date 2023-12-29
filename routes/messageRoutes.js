import express from "express";
import {  getConversations, getMessages, sendMessage } from "../controllers/messageController.js";
import protectRoute from "../middlewares/protectRoute.js";


const router = express.Router();

router.post("/", protectRoute, sendMessage);
router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
// router.put("/conversations", protectRoute, getConversations);

export default router;
