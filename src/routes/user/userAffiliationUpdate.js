import express from "express";
import { updateAffiliation } from "../../controllers/user/mypageController.js";
import { authenticate } from "../../middlewares/authMiddleware.js"; 

const router = express.Router();
router.put("/affiliationUpdate", authenticate, updateAffiliation);

export default router;