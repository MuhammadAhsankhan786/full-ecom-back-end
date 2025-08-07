import express from "express";
import upload from "../middleware/multer.js";
import db from "../db.js"; // ✅ Make sure to import your database connection

const router = express.Router();

// 👇 Product create route
router.post("/products", upload.single("product_image"), async (req, res) => {
  try {
    const { product_name, description, price, category_id } = req.body;
    const product_image = req.file?.path; // ✅ Image URL from Cloudinary

    // 🔴 Validate required fields
    if (
      !product_name ||
      !description ||
      !price ||
      !category_id ||
      !product_image
    ) {
      return res.status(400).json({
        error:
          "All fields (product_name, description, price, category_id, image) are required",
      });
    }

    // ✅ Insert product into database
    const query = `
      INSERT INTO products (product_name, description, price, product_image, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      product_name,
      description,
      price,
      product_image,
      category_id,
    ];
    const result = await db.query(query, values);

    // ✅ Respond success
    res.status(201).json({
      message: "✅ Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creating product:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
