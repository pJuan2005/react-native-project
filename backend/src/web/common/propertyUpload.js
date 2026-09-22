const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const ROOT_UPLOAD_DIR = path.join(__dirname, "../../..", "uploads", "properties");
const URL_PREFIX = "/uploads/properties";
const PROPERTY_UPLOAD_PREFIX = "/uploads/properties/";
const IMAGE_VARIANT_SPECS = {
  thumb: {
    width: 480,
    height: 320,
    fit: "cover",
    quality: 76,
  },
  medium: {
    width: 1280,
    quality: 84,
  },
};

function getFileExtension(originalName) {
  const extension = path.extname(originalName || "").toLowerCase();
  if (extension) {
    return extension;
  }

  return ".jpg";
}

function buildFileName(prefix, originalName) {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const randomNumber = Math.round(Math.random() * 1e9);
  return `${prefix}-${timestamp}-${randomNumber}${extension}`;
}

function buildDirectoryPath(propertyId, imageType) {
  return path.join(ROOT_UPLOAD_DIR, String(propertyId), imageType);
}

function buildUrlPath(propertyId, imageType, fileName) {
  return path.posix.join(URL_PREFIX, String(propertyId), imageType, fileName);
}

function getFileBaseName(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function isGeneratedVariantFile(fileName) {
  return /-(thumb|medium)\.webp$/i.test(fileName || "");
}

function buildVariantFileName(fileName, variant) {
  return `${getFileBaseName(fileName)}-${variant}.webp`;
}

function buildVariantUrl(filePath, variant = "original") {
  if (variant === "original" || !isUploadPath(filePath)) {
    return filePath;
  }

  const normalizedPath = String(filePath).replace(/\\/g, "/");
  if (isGeneratedVariantFile(path.posix.basename(normalizedPath))) {
    return normalizedPath;
  }
  const extension = path.posix.extname(normalizedPath);
  if (!extension) {
    return normalizedPath;
  }

  return normalizedPath.replace(
    new RegExp(`${extension.replace(".", "\\.")}$`, "i"),
    `-${variant}.webp`,
  );
}

function resolveUploadPath(filePath) {
  const relativePath = filePath.replace(/^\/uploads\//, "");
  return path.join(__dirname, "..", "uploads", relativePath);
}

async function ensureImageVariantsFromSource(source, targetDirectory, fileName) {
  const sourceSharp = source.buffer ? sharp(source.buffer) : sharp(source.filePath);
  const metadata = await sourceSharp.metadata();
  const isAnimated = Boolean(metadata.pages && metadata.pages > 1);

  if (isAnimated) {
    return;
  }

  for (const [variantName, spec] of Object.entries(IMAGE_VARIANT_SPECS)) {
    const variantFileName = buildVariantFileName(fileName, variantName);
    const variantFilePath = path.join(targetDirectory, variantFileName);
    const imagePipeline = source.buffer ? sharp(source.buffer) : sharp(source.filePath);

    let transformed = imagePipeline.rotate();

    if (spec.height) {
      transformed = transformed.resize(spec.width, spec.height, {
        fit: spec.fit || "cover",
        position: "centre",
        withoutEnlargement: true,
      });
    } else {
      transformed = transformed.resize({
        width: spec.width,
        withoutEnlargement: true,
      });
    }

    await transformed.webp({
      quality: spec.quality,
      effort: 4,
    }).toFile(variantFilePath);
  }
}

async function saveImageFile(file, propertyId, imageType, prefix) {
  const directoryPath = buildDirectoryPath(propertyId, imageType);
  const fileName = buildFileName(prefix, file.originalname);
  const filePath = path.join(directoryPath, fileName);

  await fs.mkdir(directoryPath, { recursive: true });
  await fs.writeFile(filePath, file.buffer);
  await ensureImageVariantsFromSource({ buffer: file.buffer }, directoryPath, fileName);

  return buildUrlPath(propertyId, imageType, fileName);
}

async function saveFileList(files, propertyId, imageType, prefix) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const results = [];
  for (const file of files) {
    const url = await saveImageFile(file, propertyId, imageType, prefix);
    results.push(url);
  }

  return results;
}

function isUploadPath(filePath) {
  return typeof filePath === "string" && filePath.startsWith("/uploads/");
}

function isPropertyUploadPath(filePath) {
  return typeof filePath === "string" && filePath.startsWith(PROPERTY_UPLOAD_PREFIX);
}

async function ensureVariantsForExistingUpload(filePath) {
  if (!isPropertyUploadPath(filePath)) {
    return;
  }

  const absolutePath = resolveUploadPath(filePath);
  const fileName = path.basename(filePath);
  const directoryPath = path.dirname(absolutePath);

  await ensureImageVariantsFromSource(
    { filePath: absolutePath },
    directoryPath,
    fileName,
  );
}

async function removeManagedFile(filePath) {
  if (!isUploadPath(filePath)) {
    return;
  }

  const absolutePath = resolveUploadPath(filePath);
  await fs.rm(absolutePath, { force: true });

  if (isPropertyUploadPath(filePath)) {
    await Promise.all(
      Object.keys(IMAGE_VARIANT_SPECS).map((variant) =>
        fs.rm(resolveUploadPath(buildVariantUrl(filePath, variant)), {
          force: true,
        }),
      ),
    );
  }
}

module.exports = {
  IMAGE_VARIANT_SPECS,
  buildVariantUrl,
  ensureVariantsForExistingUpload,
  isGeneratedVariantFile,
  saveImageFile,
  saveFileList,
  removeManagedFile,
  isUploadPath,
  isPropertyUploadPath,
};
