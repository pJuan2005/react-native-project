export function isBackendUploadImage(src?: string | null) {
  return typeof src === "string" && src.includes("/uploads/");
}
