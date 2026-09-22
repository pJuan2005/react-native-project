const Property = require("../models/property.model");
const {
  saveImageFile,
  saveFileList,
  removeManagedFile,
} = require("../common/propertyUpload");

function getHostId(req) {
  const source = req.currentUser?.id || req.body.hostId || req.query.hostId;
  const hostId = Number(source);

  if (!Number.isInteger(hostId) || hostId <= 0) {
    return null;
  }

  return hostId;
}

function parseArrayInput(rawValue) {
  if (!rawValue) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof rawValue === "string") {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (_error) {
      return rawValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function parseBoolean(rawValue, defaultValue = false) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return defaultValue;
  }

  if (typeof rawValue === "boolean") {
    return rawValue;
  }

  if (typeof rawValue === "number") {
    return rawValue === 1;
  }

  const normalized = String(rawValue).toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function parseInteger(rawValue, defaultValue = 0) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    return defaultValue;
  }

  return Math.trunc(value);
}

function parseNumber(rawValue, defaultValue = 0) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    return defaultValue;
  }

  return value;
}

function normalizePropertyPayload(body, hostId = null) {
  return {
    hostId,
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    type: String(body.type || body.propertyType || "").trim(),
    price: parseNumber(body.price),
    address: String(body.address || body.streetAddress || "").trim(),
    city: String(body.city || "").trim(),
    country: String(body.country || "").trim(),
    maxGuests: parseInteger(body.maxGuests || body.max_guests),
    bedrooms: parseInteger(body.bedrooms),
    bathrooms: parseInteger(body.bathrooms),
    featured: parseBoolean(body.featured),
    status: String(body.status || "pending").trim().toLowerCase(),
    amenities: parseArrayInput(body.amenities),
    coverImagePath: String(body.coverImagePath || "").trim(),
    detailImagePaths: parseArrayInput(body.detailImagePaths),
    removedDetailImages: parseArrayInput(body.removedDetailImages),
  };
}

function validatePropertyPayload(payload, options = {}) {
  const errors = {};
  const requireCoverImage = options.requireCoverImage || false;
  const validStatuses = ["pending", "approved", "rejected"];

  if (!payload.title) {
    errors.title = "Property title is required.";
  }

  if (!payload.type) {
    errors.type = "Property type is required.";
  }

  if (!payload.address) {
    errors.address = "Address is required.";
  }

  if (!payload.city) {
    errors.city = "City is required.";
  }

  if (!payload.country) {
    errors.country = "Country is required.";
  }

  if (!payload.description || payload.description.length < 20) {
    errors.description = "Description must be at least 20 characters.";
  }

  if (payload.price <= 0) {
    errors.price = "Price per night must be greater than 0.";
  }

  if (payload.maxGuests <= 0) {
    errors.maxGuests = "Maximum guests must be greater than 0.";
  }

  if (payload.bedrooms < 0) {
    errors.bedrooms = "Bedrooms value is invalid.";
  }

  if (payload.bathrooms < 0) {
    errors.bathrooms = "Bathrooms value is invalid.";
  }

  if (!validStatuses.includes(payload.status)) {
    errors.status = "Property status is invalid.";
  }

  if (requireCoverImage && !payload.coverImagePath && !options.hasCoverFile) {
    errors.coverImage = "A cover image is required when creating a property.";
  }

  return errors;
}

function sendValidationError(res, errors) {
  return res.status(400).json({
    message: "Validation failed.",
    errors,
  });
}

exports.getAllProperties = async (req, res) => {
  const filters = {
    location: String(req.query.location || "").trim(),
    type: String(req.query.type || "").trim(),
    guests: parseInteger(req.query.guests, 0),
    checkIn: String(req.query.checkIn || "").trim(),
    checkOut: String(req.query.checkOut || "").trim(),
  };

  if (
    filters.checkIn &&
    filters.checkOut &&
    new Date(filters.checkOut) <= new Date(filters.checkIn)
  ) {
    return res.status(400).json({
      message: "Check-out date must be after check-in date.",
    });
  }

  try {
    const data = await Property.getAll(filters);
    res.json(data);
  } catch (_error) {
    res.status(500).json({
      message: "Unable to load the property list.",
    });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const data = await Property.getById(req.params.id);
    if (!data) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    res.json(data);
  } catch (_error) {
    res.status(500).json({
      message: "Unable to load the property details.",
    });
  }
};

exports.getPropertyAvailability = async (req, res) => {
  const filters = {
    checkIn: String(req.query.checkIn || "").trim(),
    checkOut: String(req.query.checkOut || "").trim(),
  };

  if (!filters.checkIn || !filters.checkOut) {
    return res.status(400).json({
      message: "Check-in and check-out dates are required.",
    });
  }

  if (new Date(filters.checkOut) <= new Date(filters.checkIn)) {
    return res.status(400).json({
      message: "Check-out date must be after check-in date.",
    });
  }

  try {
    const result = await Property.checkAvailability(req.params.id, filters);

    if (!result.exists) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    return res.json({
      available: result.available,
      message:
        result.reason ||
        (result.available
          ? "Selected dates are available for booking."
          : "Selected dates are unavailable."),
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to verify property availability right now.",
    });
  }
};

exports.getPropertyUnavailableDates = async (req, res) => {
  try {
    const result = await Property.getUnavailableDateRanges(req.params.id);

    if (!result.exists) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    return res.json({
      ranges: result.ranges,
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load unavailable dates right now.",
    });
  }
};

exports.getAllPropertiesAdmin = async (_req, res) => {
  try {
    const data = await Property.getAllAdmin();
    res.json(data);
  } catch (_error) {
    res.status(500).json({
      message: "Unable to load the admin property list.",
    });
  }
};

exports.getAdminPropertyById = async (req, res) => {
  try {
    const data = await Property.getAdminById(req.params.id);
    if (!data) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    res.json(data);
  } catch (_error) {
    res.status(500).json({
      message: "Unable to load the admin property details.",
    });
  }
};

exports.getHostProperties = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  try {
    const data = await Property.getByHost(hostId);
    res.json(data);
  } catch (_error) {
    res.status(500).json({
      message: "Unable to load the host property list.",
    });
  }
};

exports.getHostPropertyById = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  try {
    const data = await Property.getHostById(req.params.id, hostId);
    if (!data) {
      return res.status(404).json({
        message: "Host property not found.",
      });
    }

    res.json(data);
  } catch (_error) {
    res.status(500).json({
      message: "Unable to load the host property details.",
    });
  }
};

exports.createHostProperty = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  const payload = normalizePropertyPayload(req.body, hostId);
  const hasCoverFile = Boolean(req.files?.coverImage?.[0]);
  const errors = validatePropertyPayload(payload, {
    requireCoverImage: true,
    hasCoverFile,
  });

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    const propertyId = await Property.create({
      ...payload,
      status: "pending",
      coverImage: payload.coverImagePath || null,
    });

    let coverImage = payload.coverImagePath || null;
    if (req.files?.coverImage?.[0]) {
      coverImage = await saveImageFile(
        req.files.coverImage[0],
        propertyId,
        "cover",
        "cover",
      );
    }

    if (coverImage) {
      await Property.updateCoverImage(propertyId, coverImage);
    }

    const detailImageUrls = [
      ...payload.detailImagePaths,
      ...(await saveFileList(
        req.files?.detailImages || [],
        propertyId,
        "details",
        "detail",
      )),
    ];

    if (detailImageUrls.length > 0) {
      await Property.addImages(propertyId, detailImageUrls);
    }

    await Property.replaceAmenities(propertyId, payload.amenities);

    const data = await Property.getHostById(propertyId, hostId);
    res.status(201).json({
      message: "Property created successfully.",
      data,
    });
  } catch (_error) {
    res.status(500).json({
      message: "Unable to create the property.",
    });
  }
};

exports.updateHostProperty = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  const propertyId = Number(req.params.id);
  const existingProperty = await Property.getHostById(propertyId, hostId);
  if (!existingProperty) {
    return res.status(404).json({
      message: "Host property not found.",
    });
  }

  const payload = normalizePropertyPayload(req.body, hostId);
  if (req.body.featured === undefined) {
    payload.featured = Boolean(existingProperty.featured);
  }
  if (req.body.status === undefined) {
    payload.status = String(existingProperty.status || "pending").toLowerCase();
  }

  const errors = validatePropertyPayload(payload);
  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    await Property.update(propertyId, payload, hostId);
    await Property.replaceAmenities(propertyId, payload.amenities);

    if (req.files?.coverImage?.[0] || payload.coverImagePath) {
      const nextCoverImage = req.files?.coverImage?.[0]
        ? await saveImageFile(
            req.files.coverImage[0],
            propertyId,
            "cover",
            "cover",
          )
        : payload.coverImagePath;

      await removeManagedFile(
        existingProperty.coverImageOriginal || existingProperty.image,
      );
      await Property.updateCoverImage(propertyId, nextCoverImage);
    }

    if (payload.removedDetailImages.length > 0) {
      await Property.deleteImagesByUrls(propertyId, payload.removedDetailImages);
      for (const imageUrl of payload.removedDetailImages) {
        await removeManagedFile(imageUrl);
      }
    }

    const detailImageUrls = [
      ...payload.detailImagePaths,
      ...(await saveFileList(
        req.files?.detailImages || [],
        propertyId,
        "details",
        "detail",
      )),
    ];

    if (detailImageUrls.length > 0) {
      await Property.addImages(propertyId, detailImageUrls);
    }

    if (String(existingProperty.status).toLowerCase() === "approved") {
      await Property.updateStatus(propertyId, "pending");
    }

    const data = await Property.getHostById(propertyId, hostId);
    res.json({
      message: "Property updated successfully.",
      data,
    });
  } catch (_error) {
    res.status(500).json({
      message: "Unable to update the property.",
    });
  }
};

exports.updatePropertyByAdmin = async (req, res) => {
  const propertyId = Number(req.params.id);
  const existingProperty = await Property.getAdminById(propertyId);

  if (!existingProperty) {
    return res.status(404).json({
      message: "Property not found.",
    });
  }

  const payload = normalizePropertyPayload(req.body, existingProperty.hostId);
  if (req.body.featured === undefined) {
    payload.featured = Boolean(existingProperty.featured);
  }
  if (req.body.status === undefined) {
    payload.status = String(existingProperty.status || "pending").toLowerCase();
  }

  const errors = validatePropertyPayload(payload);
  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    await Property.update(propertyId, payload);
    await Property.replaceAmenities(propertyId, payload.amenities);

    if (req.files?.coverImage?.[0] || payload.coverImagePath) {
      const nextCoverImage = req.files?.coverImage?.[0]
        ? await saveImageFile(
            req.files.coverImage[0],
            propertyId,
            "cover",
            "cover",
          )
        : payload.coverImagePath;

      await removeManagedFile(
        existingProperty.coverImageOriginal || existingProperty.image,
      );
      await Property.updateCoverImage(propertyId, nextCoverImage);
    }

    if (payload.removedDetailImages.length > 0) {
      await Property.deleteImagesByUrls(propertyId, payload.removedDetailImages);
      for (const imageUrl of payload.removedDetailImages) {
        await removeManagedFile(imageUrl);
      }
    }

    const detailImageUrls = [
      ...payload.detailImagePaths,
      ...(await saveFileList(
        req.files?.detailImages || [],
        propertyId,
        "details",
        "detail",
      )),
    ];

    if (detailImageUrls.length > 0) {
      await Property.addImages(propertyId, detailImageUrls);
    }

    if (String(existingProperty.status).toLowerCase() !== payload.status) {
      await Property.updateStatus(propertyId, payload.status);
    }

    const data = await Property.getAdminById(propertyId);
    res.json({
      message: "Property updated successfully.",
      data,
    });
  } catch (_error) {
    res.status(500).json({
      message: "Unable to update the property.",
    });
  }
};

exports.deleteHostProperty = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  try {
    const deleted = await Property.softDelete(req.params.id, hostId);
    if (!deleted) {
      return res.status(404).json({
        message: "Host property not found.",
      });
    }

    res.json({
      message: "Property deleted successfully.",
    });
  } catch (_error) {
    res.status(500).json({
      message: "Unable to delete the property.",
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.softDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    res.json({
      message: "Property deleted successfully.",
    });
  } catch (_error) {
    res.status(500).json({
      message: "Unable to delete the property.",
    });
  }
};

exports.updatePropertyStatus = async (req, res) => {
  const status = String(req.body.status || "").toLowerCase();
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "Property status is invalid.",
    });
  }

  try {
    const updated = await Property.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    res.json({
      message: "Property status updated successfully.",
      data: {
        id: Number(req.params.id),
        status,
      },
    });
  } catch (_error) {
    res.status(500).json({
      message: "Unable to update the property status.",
    });
  }
};

exports.regenerateHostManageLink = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  try {
    const property = await Property.getHostById(req.params.id, hostId);
    if (!property) {
      return res.status(404).json({
        message: "Host property not found.",
      });
    }

    if (String(property.status).toLowerCase() !== "approved") {
      return res.status(400).json({
        message: "Quick management links are only available after admin approval.",
      });
    }

    const manageToken = await Property.regenerateManageToken(req.params.id, hostId);
    if (!manageToken) {
      return res.status(404).json({
        message: "Host property not found.",
      });
    }

    return res.json({
      message: "Quick management link regenerated successfully.",
      data: {
        id: Number(req.params.id),
        manageToken,
        manageTokenActive: true,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to regenerate the quick management link.",
    });
  }
};

exports.updateHostManageLinkState = async (req, res) => {
  const hostId = getHostId(req);
  if (!hostId) {
    return res.status(400).json({
      message: "A valid hostId is required.",
    });
  }

  const isActive = req.body.isActive;
  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be provided as a boolean value.",
    });
  }

  try {
    const property = await Property.getHostById(req.params.id, hostId);
    if (!property) {
      return res.status(404).json({
        message: "Host property not found.",
      });
    }

    const updated = await Property.setManageTokenActive(req.params.id, isActive, hostId);
    if (!updated) {
      return res.status(404).json({
        message: "Host property not found.",
      });
    }

    return res.json({
      message: `Quick management link ${isActive ? "enabled" : "disabled"} successfully.`,
      data: {
        id: Number(req.params.id),
        manageToken: property.manageToken || "",
        manageTokenActive: isActive,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to update the quick management link status.",
    });
  }
};

exports.regenerateAdminManageLink = async (req, res) => {
  try {
    const property = await Property.getAdminById(req.params.id);
    if (!property) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    if (String(property.status).toLowerCase() !== "approved") {
      return res.status(400).json({
        message: "Quick management links are only available after admin approval.",
      });
    }

    const manageToken = await Property.regenerateManageToken(req.params.id);
    if (!manageToken) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    return res.json({
      message: "Quick management link regenerated successfully.",
      data: {
        id: Number(req.params.id),
        manageToken,
        manageTokenActive: true,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to regenerate the quick management link.",
    });
  }
};

exports.updateAdminManageLinkState = async (req, res) => {
  const isActive = req.body.isActive;
  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be provided as a boolean value.",
    });
  }

  try {
    const property = await Property.getAdminById(req.params.id);
    if (!property) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    const updated = await Property.setManageTokenActive(req.params.id, isActive);
    if (!updated) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    return res.json({
      message: `Quick management link ${isActive ? "enabled" : "disabled"} successfully.`,
      data: {
        id: Number(req.params.id),
        manageToken: property.manageToken || "",
        manageTokenActive: isActive,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to update the quick management link status.",
    });
  }
};
