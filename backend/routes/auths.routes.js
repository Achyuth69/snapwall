import express from "express";
import {
  createProfile,
  forgotPassword,
  checkUser,
} from "../controllers/auth.controller.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.post("/create-profile", verifyFirebaseToken, createProfile);
router.post("/forgot-password", forgotPassword);
router.post("/check-user", verifyFirebaseToken, checkUser);

export default router;
