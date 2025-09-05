const fs = require("fs").promises;
const path = require("path");

const deleteImageFiles = async (imagePaths) => {
  try {
    if (!imagePaths || imagePaths.length === 0) return;

    for (const imagePath of imagePaths) {
      if (imagePath && imagePath.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), imagePath);
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error("Error deleting image files:", error);
  }
};

const deleteSingleImage = async (imagePath) => {
  try {
    if (imagePath && imagePath.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), imagePath);
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error("Error deleting image file:", error);
  }
};

const getFileExtension = (filename) => {
  return path.extname(filename);
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  deleteImageFiles,
  deleteSingleImage,
  getFileExtension,
  fileExists,
};
