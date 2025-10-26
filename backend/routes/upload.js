import express from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { handleUpload } from "../controllers/pdfController.js";

const router = express.Router();

router.post("/", (req, res) => {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err.message });
    const file = files.file || files.pdf;
    const buffer = fs.readFileSync(file[0].filepath);
    try {
      const data = await handleUpload(buffer, file[0].originalFilename);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

export default router;
