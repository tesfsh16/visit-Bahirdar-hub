import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Create listing (only providers)
router.post(
  "/",
  protect,
  authorizeRoles("user", "provider", "admin"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        title,
        description,
        category,
        price,
        location,
        latitude,
        longitude,
      } = req.body;

      // 1. Get provider id using user id
      const provider = await pool.query(
        "SELECT * FROM service_providers WHERE user_id = $1",
        [userId],
      );

      if (provider.rows.length === 0) {
        return res.status(400).json({
          message: "You are not a registered provider",
        });
      }

      const providerId = provider.rows[0].id;

      // 2. Insert listing
      const newListing = await pool.query(
        `INSERT INTO listings 
      (provider_id, title, description, category, price, location, latitude, longitude)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
        [
          providerId,
          title,
          description,
          category,
          price,
          location,
          latitude,
          longitude,
        ],
      );

      res.status(201).json({
        message: "Listing created successfully",
        listing: newListing.rows[0],
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  },

  
);

// Get all listings (public)
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;

    let query = "SELECT * FROM listings WHERE 1=1";
    let values = [];

    // Filter by category
    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    // Filter by min price
    if (minPrice) {
      values.push(minPrice);
      query += ` AND price >= $${values.length}`;
    }

    // Filter by max price
    if (maxPrice) {
      values.push(maxPrice);
      query += ` AND price <= $${values.length}`;
    }

    const result = await pool.query(query, values);

    // ✅ Convert lat/lng to numbers
    const listings = result.rows.map((item) => ({
      ...item,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      price: parseFloat(item.price),
    }));

    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
