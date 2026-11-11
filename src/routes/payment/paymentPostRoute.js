import express from "express";
import multer from "multer";
import { paymentPostController } from "../../controllers/payment/paymentPostController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/paymentPictures");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/post",
  authenticate,
  upload.single("paymentPicture"),
  paymentPostController
);

export default router;
