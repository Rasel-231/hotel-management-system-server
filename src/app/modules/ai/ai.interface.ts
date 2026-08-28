export interface ParsedFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  priceMax?: number;
  guests?: number;
  amenities?: string[];
  rating?: number;
}

export interface RecommendationInput {
  userId: string;
  limit?: number;
}
