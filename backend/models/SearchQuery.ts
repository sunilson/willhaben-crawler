export type SearchQuery = {
  category?: string;
  keyword?: string;
  minPrice: number | null;
  maxPrice: number | null;
  shippingRequired: boolean;
  refreshRate: number;
  lastRefresh?: number;
};
