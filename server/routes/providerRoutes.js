import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Become a provider
router.post("/become-provider", protect, (req, res) => {
  res.json({
    message: "Provider registration endpoint (next step)",
  });
});

export default router;
