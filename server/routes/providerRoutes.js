import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Become a provider
router.post("/become-provider", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { business_name, phone } = req.body;

    // 1. Check if already provider
    const existing = await pool.query(
      "SELECT * FROM service_providers WHERE user_id = $1",
      [userId],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "User is already a provider",
      });
    }

    // 2. Insert provider
    const newProvider = await pool.query(
      `INSERT INTO service_providers (user_id, business_name, phone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, business_name, phone],
    );

    res.status(201).json({
      message: "Provider registration submitted for verification",
      provider: newProvider.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
