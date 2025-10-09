const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    // file size maximumg is 50mb
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// File upload endpoint for EditorJS
app.post("/uploadFile", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: 0,
        message: "No file uploaded",
      });
    }

    // EditorJS expects this specific response format
    res.json({
      success: 1,
      file: {
        url: `http://localhost:${PORT}/uploads/${req.file.filename}`,
        name: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: 0,
      message: "File upload failed",
    });
  }
});

// URL fetch endpoint for EditorJS
app.post("/fetchUrl", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: 0,
        message: "No URL provided",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: 0,
        message: "Invalid URL format",
      });
    }

    // Download image from URL
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: 10000, // 10 second timeout
      headers: {
        "User-Agent": "EditorJS Image Tool",
      },
    });

    // Check if response is an image
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.startsWith("image/")) {
      return res.status(400).json({
        success: 0,
        message: "URL does not point to an image",
      });
    }

    // Generate filename from URL or use default
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath) || ".jpg";
    const filename = `url-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;
    const filePath = path.join(__dirname, "uploads", filename);

    // Save the image
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      // Get file stats for size
      const stats = fs.statSync(filePath);

      res.json({
        success: 1,
        file: {
          url: `http://localhost:${PORT}/uploads/${filename}`,
          name: filename,
          size: stats.size,
        },
      });
    });

    writer.on("error", (error) => {
      console.error("File write error:", error);
      res.status(500).json({
        success: 0,
        message: "Failed to save image from URL",
      });
    });
  } catch (error) {
    console.error("Fetch URL error:", error);

    if (error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
      return res.status(400).json({
        success: 0,
        message: "Could not fetch image from URL",
      });
    }

    res.status(500).json({
      success: 0,
      message: "Failed to fetch image from URL",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  // delay response by 2 seconds to simulate load
  console.log("Health check request received", req.method, req.url, req.query);
  return new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
    res.json({ status: "OK", message: "Server is running" });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: 0,
        message: "File too large. Maximum size is 50MB.",
      });
    }
  }

  console.error("Server error:", error);
  res.status(500).json({
    success: 0,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads will be served from http://localhost:${PORT}/uploads/`);
});
