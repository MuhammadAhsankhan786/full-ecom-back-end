import express from "express";
import { db } from "./db.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import { getUserDetails } from "./controllers/userController.js";
import { verifyToken } from "./middleware/verifyToken.js";
import upload from "./middleware/multer.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import { fileURLToPath } from "url";

console.log("DATABASE_URL =>", process.env.DATABASE_URL); // Check if .env is loading

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// ---------- CORS Setup ----------
// const allowedOrigins = [
//   "http://localhost:5173", // Local development
//   "https://full-ecom-front-end.vercel.app", // Production frontend
//   /\.vercel\.app$/, // Allow all Vercel preview URLs
// ];

// app.use(
//   cors({
//     origin: ["http://localhost:5173 ,"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ frontend URL
    credentials: true, // ✅ cookies/session allow
  })
);

console.log("✅ CORS middleware applied");

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", userRoutes);
app.get("/api/v1/me", verifyToken, getUserDetails);

app.get("/api/v1/test", (req, res) => {
  res.status(200).send({ message: "✅ Test route is working!" });
});

// Sign-up route
app.post("/api/v1/sign-up", async (req, res) => {
  let reqBody = req.body;
  if (
    !reqBody.first_name ||
    !reqBody.last_name ||
    !reqBody.email ||
    !reqBody.password
  ) {
    return res.status(400).send({ message: "All fields are required" });
  }

  reqBody.email = reqBody.email.toLowerCase();

  try {
    const check = await db.query("SELECT * FROM users WHERE email = $1", [
      reqBody.email,
    ]);
    if (check.rows?.length > 0) {
      return res.status(409).send({ message: "Email already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(reqBody.password, salt);

    let role = parseInt(reqBody.user_role);
    if (isNaN(role) || (role !== 1 && role !== 4)) {
      role = 1;
    }

    const query = `
      INSERT INTO users (first_name, last_name, email, password, user_role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      reqBody.first_name,
      reqBody.last_name,
      reqBody.email,
      hash,
      role,
    ];

    const result = await db.query(query, values);
    res.status(201).send({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Login route
app.post("/api/v1/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    const lowerEmail = email.toLowerCase();
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      lowerEmail,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatched = bcrypt.compareSync(password, user.password || "");
    if (!isMatched) {
      return res.status(401).send({ message: "Invalid password" });
    }

    if (!process.env.SECRET_TOKEN) {
      console.error("❌ SECRET_TOKEN not set in environment variables!");
      return res.status(500).send({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      {
        id: user.user_id, // ✅ یہاں user_id رکھو
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_role: user.user_role,
      },
      process.env.SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // Use "None" for cross-site cookies in production
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_role: user.user_role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// ====== Logout Route ======
app.get("/api/v1/logout", (req, res) => {
  res.cookie("token", "", {
    maxAge: 1,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).send({ message: "User Logout" });
});

// Products list
app.get("/api/v1/products", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.product_id, p.product_name, p.price, p.product_image, p.description, p.created_at, c.category_name 
      FROM products AS p 
      INNER JOIN categories c ON p.category_id = c.category_id
    `);
    res.status(200).send({ message: "Product Found", products: result.rows });
  } catch (error) {
    console.error("Error fetching products", error.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Add product
app.post(
  "/api/v1/products",
  (req, res, next) => {
    upload.single("product_image")(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload error", error: err.message });
      }
      next();
    });
  },
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { product_name, description, price, category_id } = req.body;
      const product_image = req.file?.path;
      console.log("🟢 req.body:", req.body);
      console.log("🟢 req.file:", req.file);
      if (
        !product_name ||
        !description ||
        !price ||
        !category_id ||
        !product_image
      ) {
        return res.status(400).json({ message: "⚠️ All fields are required" });
      }

      const category = await db.query(
        "SELECT * FROM categories WHERE category_id = $1",
        [parseInt(category_id)]
      );
      if (category.rows.length === 0) {
        return res.status(400).json({ message: "Invalid category_id" });
      }

      const query = `
        INSERT INTO products (product_name, description, price, product_image, category_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [
        product_name,
        description,
        parseFloat(price),
        product_image,
        parseInt(category_id),
      ];

      const result = await db.query(query, values);

      res.status(201).json({
        message: "✅ Product created successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("❌ Error creating product:", error.stack);
      res
        .status(500)
        .json({ message: "❌ Internal Server Error", error: error.message });
    }
  }
);

// Categories
app.get("/api/v1/categories", async (req, res) => {
  try {
    let result = await db.query("SELECT * FROM categories");
    res.status(200).send({
      message: "Categories Found",
      categories: result.rows,
    });
  } catch (error) {
    console.error("Error fetching categories", error.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/api/v1/category", verifyToken, requireAdmin, async (req, res) => {
  const reqBody = req.body;
  if (!reqBody.category_name || !reqBody.description) {
    return res
      .status(400)
      .send({ message: "Category name and description are required" });
  }

  try {
    const query = `
      INSERT INTO categories (category_name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [reqBody.category_name, reqBody.description];
    const result = await db.query(query, values);

    res.status(201).send({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating category", error.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

// Serve frontend only locally //D:\Back-end-projects\6.backend-full-ecom\backend //D:\Back-end-projects\8.frontend-full ecom\frontend\dist

// {
//   app.use(
//     "/",
//     express.static(
//       path.join(
//         __dirname,
//         "..",
//         "..",
//         "8.frontend-full ecom",
//         "frontend",
//         "dist"
//       )
//     )
//   );
//   app.get("*", (req, res) => {
//     res.sendFile(
//       path.join(
//         __dirname,
//         "..",
//         "..",
//         "8.frontend-full ecom",
//         "frontend",
//         "dist",
//         "index.html"
//       )
//     );
//   });
// }

app.use("/", express.static(path.join(__dirname, "./frontend/dist")));
app.use("/*splat", express.static(path.join(__dirname, "./frontend/dist")));

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

export default app;
