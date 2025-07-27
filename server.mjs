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
import { verifyToken } from "./middleware/verifyToken.js"; // ✅ Only this one
import upload from "./middleware/multer.js";
import { requireAdmin } from "./middleware/requireAdmin.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.vercel.app", // 🔁 apna actual Vercel frontend URL yahan lagao
    ],
    credentials: true,
  })
);
app.use("/api/v1", userRoutes); // 👈 Add this line

app.use(cookieParser());

const SECRET = process.env.SECRET_TOKEN; // Replace with your actual secret key

app.get("/api/v1/me", verifyToken, getUserDetails);

app.post("/api/v1/sign-up", async (req, res) => {
  let reqBody = req.body;

  // ✅ 1. Required Fields Check
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
    // ✅ 2. Check if Email Already Exists
    const check = await db.query("SELECT * FROM users WHERE email = $1", [
      reqBody.email,
    ]);
    if (check.rows?.length > 0) {
      return res.status(409).send({ message: "Email already exists" });
    }

    // ✅ 3. Password Hashing
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(reqBody.password, salt);

    // ✅ 4. Handle user_role safely
    let role = parseInt(reqBody.user_role);
    if (isNaN(role) || (role !== 1 && role !== 4)) {
      role = 1; // default to 'user'
    }

    // ✅ 5. Insert into DB
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

    // ✅ 6. Respond
    res.status(201).send({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/api/v1/login", async (req, res) => {
  let reqBody = req.body;
  if (!reqBody.email || !reqBody.password) {
    res.status(400).send({ message: "Email and password are required" });
    return;
  }
  const email = reqBody.email.toLowerCase();
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [reqBody.email];
  try {
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).send({ message: "User not found" });
      return;
      // const user = result.rows[0];
    }
    const isMatched = bcrypt.compareSync(
      reqBody.password,
      result.rows[0].password
    ); // true
    if (!isMatched) {
      res.status(401).send({ message: "Invalid password" });
      return;
    }
    const token = jwt.sign(
      {
        id: result.rows[0].id,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        email: result.rows[0].email,
        password: result.rows[0].password,
        user_role: result.rows[0].user_role,
        iat: Date.now() / 1000, // Current time in seconds
        exp: Math.floor(Date.now() / 1000) + 1000 * 60 * 60 * 24, // Token valid for 24 hours
      },
      SECRET
    );
    res.cookie("token", token, {
      httpOnly: true, // 🔐 Cookie browser se JS me access nahi hogi
      secure: process.env.NODE_ENV === "production", // 🔒 Production me HTTPS ho to hi secure flag lagega
      maxAge: 24 * 60 * 60 * 1000, // 🕐 1 din tak valid
      sameSite: "Lax", // CSRF attacks se protection
    });

    res.status(200);
    res.send({
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
    res.status(500).send({ message: "Internal Server Error" });
    // console.error("Error executing query", error.stack);
  }
});

app.get("/api/v1/logout", (req, res) => {
  res.cookie("token", "", {
    maxAge: 1, // 1ms mein cookie expire
    httpOnly: true, // ✅ secure: client JS access nahin kar sakta
    secure: true, // ✅ sirf HTTPS pe send ho
    sameSite: "lax", // optional but safer
  });
  res.status(200).send({ message: "User Logout" });
});

app.get("/api/v1/products", async (req, res) => {
  try {
    let result = await db.query(
      `SELECT p.product_id, p.product_name, p.price,p.product_image, p.description, p.created_at, c.category_name 
        FROM products AS p 
        INNER JOIN categories c ON p.category_id = c.category_id`
    );
    res.status(200).send({ message: "Product Found", products: result.rows });
  } catch (error) {
    console.error("Error fetching products", error.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post(
  "/api/v1/products",
  (req, res, next) => {
    upload.single("product_image")(req, res, (err) => {
      if (err) {
        console.error("❌ Multer Error:", err.message);
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
      console.log("🟡 Starting /api/v1/products");
      const { product_name, description, price, category_id } = req.body;
      const product_image = req.file?.path; // Cloudinary URL
      console.log("🟡 REQ BODY:", req.body);
      console.log("🟡 REQ FILE:", req.file);

      if (
        !product_name ||
        !description ||
        !price ||
        !category_id ||
        !product_image
      ) {
        console.log("🟡 Validation failed:", {
          product_name,
          description,
          price,
          category_id,
          product_image,
        });
        return res.status(400).json({ message: "⚠️ All fields are required" });
      }

      // Validate category_id
      const category = await db.query(
        "SELECT * FROM categories WHERE category_id = $1",
        [parseInt(category_id)]
      );
      if (category.rows.length === 0) {
        console.log("🟡 Invalid category_id:", category_id);
        return res.status(400).json({ message: "Invalid category_id" });
      }

      console.log("🟡 Validated, running query...");
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
      console.log("🟡 Query values:", values);

      const result = await db.query(query, values);
      console.log("🟡 Query success:", result.rows[0]);

      res.status(201).json({
        message: "✅ Product created successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("❌ Error creating product:", {
        message: error.message,
        stack: error.stack,
      });
      res
        .status(500)
        .json({ message: "❌ Internal Server Error", error: error.message });
    }
  }
);

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

  // ✅ Validation fix
  if (!reqBody.category_name || !reqBody.description) {
    res
      .status(400)
      .send({ message: "Category name and description are required" });
    return;
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

const __dirname = path.resolve(); //D:\Back-end-projects\6.Complete.Ecom\E-Commerce
app.use("/", express.static(path.join(__dirname, "/E-Commerce/dist")));
app.use("/*splat", express.static(path.join(__dirname, "/E-Commerce/dist")));

app.listen(PORT, () => {
  console.log("Server is running on port 5001");
});
