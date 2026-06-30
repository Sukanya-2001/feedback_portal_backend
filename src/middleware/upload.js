import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createUpload = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `feedback_portal/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const nameWithoutExt = path.parse(file.originalname).name;
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");
        return `${safeName}-${uniqueSuffix}`;
      },
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimeType && extName) {
      return cb(null, true);
    }

    cb(new Error("Only images are allowed (jpeg, jpg, png, webp, gif)."));
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
};
