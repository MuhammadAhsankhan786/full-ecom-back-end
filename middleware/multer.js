import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import "dotenv/config";

// Log config to verify
// console.log("Cloudinary Config in multer.js:", {
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET ? "****" : undefined,
// });

//Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//Test Cloudinary connection
// cloudinary.api.ping((error, result) => {
//   if (error) console.error("❌ Cloudinary Connection Error:", error);
//   else console.log("✅ Cloudinary Connected:", result);
// });

// Setup Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Initialize multer
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("🟡 Processing file:", {
      name: file.originalname,
      mimetype: file.mimetype,
    });
    if (!file.mimetype.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.mimetype);
      return cb(
        new Error("Sirf image files allowed hain (jpg, jpeg, png, webp)!")
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
