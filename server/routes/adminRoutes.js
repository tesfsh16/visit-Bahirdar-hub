import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin-only route
router.get("/dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
  });
});

export default router;
