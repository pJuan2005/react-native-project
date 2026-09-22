const fs = require("fs/promises");
const path = require("path");

const ROOT_UPLOAD_DIR = path.join(__dirname, "../../..", "uploads", "bookings");
const URL_PREFIX = "/uploads/bookings";

function getFileExtension(originalName) {
  const extension = path.extname(originalName || "").toLowerCase();
  return extension || ".jpg";
}

function buildFileName(prefix, originalName) {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const randomNumber = Math.round(Math.random() * 1e9);
  return `${prefix}-${timestamp}-${randomNumber}${extension}`;
}

async function savePaymentProof(file, bookingId) {
  const directoryPath = path.join(
    ROOT_UPLOAD_DIR,
    String(bookingId),
    "payment-proof",
  );
  const fileName = buildFileName("payment-proof", file.originalname);
  const filePath = path.join(directoryPath, fileName);

  await fs.mkdir(directoryPath, { recursive: true });
  await fs.writeFile(filePath, file.buffer);

  return path.posix.join(
    URL_PREFIX,
    String(bookingId),
    "payment-proof",
    fileName,
  );
}

module.exports = {
  savePaymentProof,
};
