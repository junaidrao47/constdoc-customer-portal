export type DocumentStatus =
  "pending" | "under_review" | "approved" | "rejected" | "expiring_soon" | "expired";
export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}
export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}
export interface Service {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
}
/**
 * A public package. `sortOrder` is deliberately absent: the API orders the list
 * (`isFeatured DESC, sortOrder ASC, name ASC`) but does not serialise the field, so the
 * server's array order is the only ordering signal and must be preserved as received.
 * There is no `currency` either — prices are MXN, per `formatMoney`'s default.
 */
export interface Package {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isFeatured: boolean;
  price: number;
  durationDays: number;
  services: Service[];
}
export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
}
export interface CatalogImage {
  id: string;
  entityType: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  altText: string | null;
}
export interface CatalogItem {
  id: string;
  category: CatalogCategory | null;
  title: string;
  slug: string;
  entityType: string;
  shortDescription: string | null;
  fullDescription: string | null;
  status: string;
  isFeatured: boolean;
  price: number | null;
  isPublished: boolean;
  fields: Record<string, unknown>;
  images: CatalogImage[];
  createdAt: string;
  updatedAt: string;
}
export interface PaginatedCatalogItems {
  data: CatalogItem[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
}
export interface WorkerRange {
  id: string;
  minWorkers: number;
  maxWorkers: number | null;
  basePrice: number;
}
export interface Location {
  id: string;
  state: string;
  city: string;
  multiplier: number;
  cityFee: number;
}
export interface Industry {
  id: string;
  name: string;
  description: string | null;
}
export interface DocumentRecord {
  id: string;
  fileName: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  downloadUrl?: string;
  approvedFileName?: string | null;
  approvedS3Key?: string | null;
  approvedDownloadUrl?: string | null;
  approvedUploadedAt?: string | null;
}
export interface Dashboard {
  profile: User;
  stats: Record<string, number>;
  documents: DocumentRecord[];
  subscriptions: Array<Record<string, string>>;
  invoices: Array<Record<string, string | number | null>>;
  attention: { documents: number; unpaidInvoices: number };
}
export type QuotationStatus =
  "draft" | "sent" | "under_review" | "accepted" | "rejected" | "expired";
export interface Quotation {
  id: string;
  customerId: string;
  totalPrice: string;
  currency?: string;
  status: QuotationStatus;
  workerCount: number;
  expiresAt: string | null;
  createdAt: string;
  rejectionReason?: string | null;
  items?: Array<{ serviceId: string; price: string; service?: { name: string } }>;
}
