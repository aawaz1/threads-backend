import express from "express";

import {   logOutUser, followUnfollowedUser, updateUser, getUserProfile, signupUser, loginUser } from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile );
router.post("/signup", signupUser  );
router.post("/login", loginUser );
router.post("/logout", logOutUser );
router.post("/follow/:id",protectRoute,  followUnfollowedUser);
router.put("/update/:id",protectRoute, updateUser );


export default router;