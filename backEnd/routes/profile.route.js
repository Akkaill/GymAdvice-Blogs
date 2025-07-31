import express from "express";
import {
  getMyProfile,
  updateUserInfo,
  updateAvatar,
  deleteAvatar,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyProfile);
router.put("/update-info", updateUserInfo);

router.put("/avatar", upload.single("avatar"), updateAvatar);
router.delete("/avatar", deleteAvatar);

export default router;
