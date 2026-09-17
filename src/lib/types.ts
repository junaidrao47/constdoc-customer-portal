export type DocumentStatus = "pending" | "under_review" | "approved" | "rejected" | "expiring_soon" | "expired";
export interface User { id: string; email: string; name?: string | null; role: string; }
export interface Session { user: User; accessToken: string; refreshToken: string; }
export interface Service { id: string; name: string; description: string | null; basePrice: number; }
export interface Package { id: string; name: string; type: string; price: number; durationDays: number; services: Service[]; }
export interface WorkerRange { id: string; minWorkers: number; maxWorkers: number | null; basePrice: number; }
export interface Location { id: string; state: string; city: string; multiplier: number; cityFee: number; }
export interface Industry { id: string; name: string; description: string | null; }
export interface DocumentRecord { id: string; fileName: string; status: DocumentStatus; createdAt: string; updatedAt: string; expiresAt: string | null; downloadUrl?: string; }
export interface Dashboard { profile: User; stats: Record<string, number>; documents: DocumentRecord[]; subscriptions: Array<Record<string, string>>; invoices: Array<Record<string, string | number | null>>; attention: { documents: number; unpaidInvoices: number }; }
export type QuotationStatus = "draft" | "sent" | "under_review" | "accepted" | "rejected" | "expired";
export interface Quotation { id: string; customerId: string; totalPrice: string; status: QuotationStatus; workerCount: number; expiresAt: string | null; createdAt: string; rejectionReason?: string | null; items?: Array<{ serviceId: string; price: string; service?: { name: string } }> }