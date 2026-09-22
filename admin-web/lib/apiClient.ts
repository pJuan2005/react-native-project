const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

function buildHeaders(options: RequestInit = {}) {
  if (options.body instanceof FormData) {
    return options.headers;
  }

  return {
    "Content-Type": "application/json",
    ...options.headers,
  };
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...options,
    headers: buildHeaders(options),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.message || "Unable to process the request on the server.";
    throw new Error(message);
  }

  return payload as T;
}

export function buildAssetUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }

  const legacyPropertyImage = url.match(/^\/img\/property(\d+)\.jpg$/i);
  if (legacyPropertyImage) {
    const propertyId = Number(legacyPropertyImage[1]);
    const extension = propertyId <= 3 ? "png" : "jpg";
    return `/img/home${propertyId}.${extension}`;
  }

  return url;
}

export { API_BASE_URL };
