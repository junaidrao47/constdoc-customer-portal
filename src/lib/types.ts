export type DocumentStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "submitted_to_government"
  | "rejected"
  | "expiring_soon"
  | "expired";

/** The localized category embedded on a public service/package. */
export interface PublicCategoryRef {
  id: string;
  name: string;
  slug: string;
}

/** A public category with its published item count (`/public/categories`). */
export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  serviceCount?: number;
  packageCount?: number;
}
export type AccountStatus = "pending_approval" | "approved" | "suspended";
export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  /** Approval gate (§11.1). Absent on older sessions — treat a missing value as approved. */
  accountStatus?: AccountStatus;
  preferredLocale?: string | null;
}
export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** The customer's assigned manager, exposed on the dashboard (§11.8). */
export interface ManagerSummary {
  id: string;
  name: string | null;
  email: string;
}

export type PhaseStatus = "not_started" | "in_progress" | "completed" | "rejected";
export interface PhaseProgress {
  completed: number;
  total: number;
  percent: number;
}
/** One approval phase of a document (§11.5). The customer view is read-only. */
export interface DocumentPhase {
  id: string;
  documentId: string;
  position: number;
  nameEn: string;
  nameEs: string;
  department: string | null;
  targetDate: string | null;
  status: PhaseStatus;
  completedAt: string | null;
  completedBy: string | null;
  note: string | null;
  resultVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}
/** GET /documents/:id — a single document with its phases and progress. */
export interface DocumentDetail extends DocumentRecord {
  customerId: string;
  serviceId: string | null;
  targetDate: string | null;
  previewUrl?: string;
  phases: DocumentPhase[];
  progress: PhaseProgress;
}

/** Onboarding profile (§11.4). GET/PUT /customers/me/onboarding. */
export interface Onboarding {
  persona: string | null;
  legalName: string | null;
  contactName: string | null;
  notificationEmails: string[];
  phone: string | null;
  state: string | null;
  city: string | null;
  needs: string[];
  completedAt: string | null;
  completed: boolean;
}
export interface OnboardingResponse {
  onboarding: Onboarding;
  personas: string[];
}
export interface ServiceProcessStep {
  title: string;
  description: string;
}
export interface Service {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  whatsIncluded?: string[];
  processSteps?: ServiceProcessStep[];
  basePrice: number;
  category?: PublicCategoryRef | null;
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
  /** Per-package marketing image from the admin upload; null falls back to the category image. */
  imageUrl?: string | null;
  services: Service[];
  category?: PublicCategoryRef | null;
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
/** A row from GET /customers/me/documents, enriched with phase/service summary (§11.6). */
export interface CustomerServiceRef {
  id: string;
  nameEn: string;
  nameEs: string;
}
export interface CustomerDocument extends DocumentRecord {
  customerId: string;
  serviceId: string | null;
  service: CustomerServiceRef | null;
  targetDate: string | null;
  nextTargetDate: string | null;
  progress: PhaseProgress;
  phaseStatuses: PhaseStatus[];
}

export type DocumentVersionKind = "customer" | "staff_on_behalf" | "official" | "phase_result";
export interface DocumentVersion {
  id: string;
  versionNo: number;
  kind: DocumentVersionKind;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: "intent" | "ready";
  createdAt: string;
}
export interface DocumentHistoryEntry {
  id: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  note: string | null;
  createdAt: string;
  changedBy: { id: string; name?: string | null; email: string } | null;
}
export interface StatusContract {
  statuses: { value: DocumentStatus; key: string; terminal: boolean }[];
  transitionsByRole: Record<string, Partial<Record<DocumentStatus, DocumentStatus[]>>>;
}
export interface ChecklistRequirement {
  id: string;
  name: string | null;
  description: string | null;
  isRequired: boolean;
  documentId: string | null;
  status: DocumentStatus | null;
  submitted: boolean;
}
export interface ChecklistService {
  serviceId: string;
  serviceName: string | null;
  requirements: ChecklistRequirement[];
  completion: number;
}
export interface Checklist {
  services: ChecklistService[];
  completion: number;
  requiredTotal: number;
  requiredSubmitted: number;
}

export interface Dashboard {
  profile: User;
  stats: Record<string, number>;
  manager: ManagerSummary | null;
  documents: CustomerDocument[];
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
