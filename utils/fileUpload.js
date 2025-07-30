const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Upload directory created');
  }
};

// Delete file
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    await fs.unlink(fullPath);
    console.log('File deleted:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Validate file type
const isValidFileType = (filename, allowedTypes) => {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
};

// Validate image file
const isValidImage = (filename) => {
  const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return isValidFileType(filename, allowedImageTypes);
};

// Validate document file
const isValidDocument = (filename) => {
  const allowedDocTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
  return isValidFileType(filename, allowedDocTypes);
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
  
  return `${name}-${timestamp}-${random}${ext}`;
};

// Get file info
const getFileInfo = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const stats = await fs.stat(fullPath);
    
    return {
      size: stats.size,
      formattedSize: formatFileSize(stats.size),
      created: stats.birthtime,
      modified: stats.mtime,
      extension: getFileExtension(filePath),
      exists: true
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

// Create file URL
const createFileUrl = (filename, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// Validate file size
const isValidFileSize = (fileSize, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

// Clean filename (remove special characters)
const cleanFilename = (filename) => {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const cleanName = name
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
  
  return cleanName + ext;
};

// Create thumbnail (placeholder for image processing)
const createThumbnail = async (imagePath, thumbnailPath, width = 200, height = 200) => {
  // This would require a library like Sharp or Jimp
  // For now, just return the original path
  console.log(`Thumbnail creation placeholder: ${imagePath} -> ${thumbnailPath}`);
  return imagePath;
};

// Get MIME type
const getMimeType = (filename) => {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.rtf': 'application/rtf'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

// Validate upload limits
const validateUpload = (file, options = {}) => {
  const {
    maxSize = 5, // MB
    allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'],
    required = false
  } = options;
  
  const errors = [];
  
  if (required && !file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  if (!file) {
    return { isValid: true, errors: [] };
  }
  
  if (!isValidFileSize(file.size, maxSize)) {
    errors.push(`File size must be less than ${maxSize}MB`);
  }
  
  if (!isValidFileType(file.originalname, allowedTypes)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Organize files by date
const getDatePath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};

// Ensure date directory exists
const ensureDateDir = async (datePath) => {
  const fullPath = path.join(__dirname, '..', 'uploads', datePath);
  try {
    await fs.mkdir(fullPath, { recursive: true });
    return datePath;
  } catch (error) {
    console.error('Error creating date directory:', error);
    return '';
  }
};

module.exports = {
  ensureUploadDir,
  deleteFile,
  getFileExtension,
  isValidFileType,
  isValidImage,
  isValidDocument,
  formatFileSize,
  generateUniqueFilename,
  getFileInfo,
  createFileUrl,
  isValidFileSize,
  cleanFilename,
  createThumbnail,
  getMimeType,
  validateUpload,
  getDatePath,
  ensureDateDir
};
