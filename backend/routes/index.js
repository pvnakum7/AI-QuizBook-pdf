import express from "express";
import uploadRouter from "./upload.js";
import askRouter from "./ask.js";

const router = express.Router();
router.use("/upload", uploadRouter);
router.use("/ask", askRouter);

export default router;
