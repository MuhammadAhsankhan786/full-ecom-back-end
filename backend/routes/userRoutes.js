import express from "express";
import { getUserDetails } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/me", verifyToken, getUserDetails);

export default router;
