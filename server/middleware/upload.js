const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage: disk storage for large video files (temp before YouTube upload)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `video-${unique}${path.extname(file.originalname)}`);
  },
});

// Storage: memory storage for images (thumbnails go straight to Cloudinary)
const imageMemoryStorage = multer.memoryStorage();

// Video file filter — only allow MP4, MOV, AVI, MKV, WebM
const videoFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
  const allowedExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, AVI, MKV, and WebM videos are allowed.'), false);
  }
};

// Image file filter — only allow JPEG, PNG, WebP
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Subtitle filter — only allow .srt, .vtt
const subtitleFilter = (req, file, cb) => {
  const allowedExts = ['.srt', '.vtt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .srt and .vtt subtitle files are allowed.'), false);
  }
};

// Upload configurations
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 4 * 1024 * 1024 * 1024, // 4GB max
  },
});

const uploadImage = multer({
  storage: imageMemoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for images
  },
});

const uploadSubtitle = multer({
  storage: multer.memoryStorage(),
  fileFilter: subtitleFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Handle multer errors gracefully
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File is too large. Maximum size allowed is 4GB for videos and 10MB for images.',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { uploadVideo, uploadImage, uploadSubtitle, handleMulterError };
