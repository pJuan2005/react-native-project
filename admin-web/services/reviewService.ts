import { apiRequest } from "@/lib/apiClient";

export interface ReviewRecord {
  id: number;
  bookingId: number;
  propertyId: number;
  guestId: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export async function createReview(payload: {
  bookingId: number;
  rating: number;
  comment: string;
}) {
  const response = await apiRequest<{ message: string; data: ReviewRecord }>(
    "/api/reviews",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response;
}
