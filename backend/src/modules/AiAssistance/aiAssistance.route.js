import express from "express";
import * as aiAssistanceController from "./aiAssistance.controller.js";
import { protect } from "../../utils/middlewares/auth.middleware.js";

const router = express.Router();
router.post("/ask", protect, aiAssistanceController.askAI);

export default router;
