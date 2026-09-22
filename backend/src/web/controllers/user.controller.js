const User = require("../models/user.model");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return ["guest", "host", "admin"].includes(normalized)
    ? normalized
    : "";
}

function normalizeStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return ["active", "blocked"].includes(normalized)
    ? normalized
    : "";
}

function validateAdminUserPayload(body) {
  const errors = {};

  const fullName = String(body.fullName || "").trim();
  const email = normalizeEmail(body.email);
  const role = normalizeRole(body.role);
  const phone = String(body.phone || "").trim();
  const location = String(body.location || "").trim();
  const website = String(body.website || "").trim();
  const languages = String(body.languages || "").trim();
  const bio = String(body.bio || "").trim();
  const status = normalizeStatus(body.status);

  if (!fullName) {
    errors.fullName = "Full name is required";
  }

  if (!email || !email.includes("@")) {
    errors.email = "Email is invalid";
  }

  if (!role) {
    errors.role = "Role is invalid";
  }

  if (!phone) {
    errors.phone = "Phone number is required";
  }

  if (!status) {
    errors.status = "Status is invalid";
  }

  return {
    errors,
    payload: {
      fullName,
      email,
      role,
      phone,
      location,
      website,
      languages,
      bio,
      status,
    },
  };
}

exports.getAdminUsers = async (_req, res) => {
  try {
    const users = await User.getAllForAdmin();
    return res.json(users);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the user list.",
    });
  }
};

exports.getAdminUserById = async (req, res) => {
  try {
    const user = await User.getByIdForAdmin(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json(user);
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to load the user details.",
    });
  }
};

exports.updateAdminUser = async (req, res) => {
  const targetUserId = Number(req.params.id);
  const currentAdminId = Number(req.currentUser?.id);
  const { errors, payload } = validateAdminUserPayload(req.body);

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({
      message: "A valid user id is required.",
    });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "User payload is invalid.",
      errors,
    });
  }

  try {
    const existingUser = await User.findById(targetUserId);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const conflictUser = await User.findByEmail(payload.email);
    if (conflictUser && Number(conflictUser.id) !== targetUserId) {
      return res.status(409).json({
        message: "This email is already in use.",
      });
    }

    if (targetUserId === currentAdminId) {
      if (payload.role !== "admin") {
        return res.status(400).json({
          message: "You cannot remove your own admin role.",
        });
      }

      if (payload.status !== "active") {
        return res.status(400).json({
          message: "You cannot block your own account.",
        });
      }
    }

    await User.updateByAdmin(targetUserId, payload);
    const updatedUser = await User.getByIdForAdmin(targetUserId);

    return res.json({
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Unable to update the user right now.",
    });
  }
};
