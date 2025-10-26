import express from "express";
import { handleAsk } from "../controllers/chatController.js";

const router = express.Router();
router.post("/", handleAsk);
export default router;
