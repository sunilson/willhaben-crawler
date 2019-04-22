import {FirebaseCompatible} from './FirebaseCompatible';

export interface SearchQuery extends FirebaseCompatible {
  id: string;
  category?: string;
  keyword?: string;
  minPrice: number | null;
  maxPrice: number | null;
  shippingRequired: boolean;
  refreshRate: number;
  lastRefresh?: number;
}
