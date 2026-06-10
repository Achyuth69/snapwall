import express from "express";
import { submitPromotion } from "../controllers/promotion.controller.js";

const router = express.Router();

router.post("/submit", submitPromotion);

export default router;
