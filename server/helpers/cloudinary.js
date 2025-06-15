const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Debug: Check if environment variables are loaded
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : undefined,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  try {
    console.log("Uploading to Cloudinary:", file.substring(0, 50) + "...");
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    console.log("Cloudinary upload success:", result.url);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
