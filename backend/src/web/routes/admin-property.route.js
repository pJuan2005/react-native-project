const express = require("express");
const property = require("../controllers/property.controller");
const { requireRoles } = require("../middlewares/auth.middleware");
const uploadPropertyImages = require("../middlewares/uploadProperty.middleware");

const router = express.Router();

router.use(requireRoles("admin"));

router.get("/", property.getAllPropertiesAdmin);
router.get("/:id", property.getAdminPropertyById);
router.post("/:id/manage-link/regenerate", property.regenerateAdminManageLink);
router.put("/:id/manage-link/status", property.updateAdminManageLinkState);
router.put(
  "/:id",
  uploadPropertyImages.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailImages", maxCount: 10 },
  ]),
  property.updatePropertyByAdmin,
);
router.put("/:id/status", property.updatePropertyStatus);
router.delete("/:id", property.deleteProperty);

module.exports = router;
