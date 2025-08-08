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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 5001;

// ====== CORS Config ======
const allowedOrigins = [
  "http://localhost:5173",
  "https://full-ecom-front-end.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Cookies allow
  })
);

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

// ====== Login Route ======
app.post("/api/v1/login", async (req, res) => {
  let reqBody = req.body;
  if (!reqBody.email || !reqBody.password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  const email = reqBody.email.toLowerCase();
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  try {
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const isMatched = bcrypt.compareSync(
      reqBody.password,
      result.rows[0].password
    );
    if (!isMatched) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const SECRET = process.env.SECRET_TOKEN;
    const token = jwt.sign(
      {
        id: result.rows[0].id,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        email: result.rows[0].email,
        user_role: result.rows[0].user_role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      SECRET
    );

    // ✅ Cookie Settings - Secure in prod, cross-site allowed
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      message: "Login successful",
      user: {
        user_id: result.rows[0].user_id,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        user_role: result.rows[0].user_role,
        profile: result.rows[0].profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
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

// Serve frontend only locally
if (process.env.NODE_ENV !== "production") {
  app.use("/", express.static(path.join(__dirname, "frontend", "dist")));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
  });
}

// Local listen
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}

export default app;
