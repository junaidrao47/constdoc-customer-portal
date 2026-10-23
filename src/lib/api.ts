import type { Session } from "./types";
import { acceptLanguage, readClientLocale } from "./locale";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
type Store = { getAccessToken: () => string | null; refresh: () => Promise<string | null> };
let store: Store | null = null;
export class ApiError extends Error {
  readonly code?: string;
  readonly requestId?: string;

  constructor(
    message: string,
    readonly status: number,
    options: { code?: string; requestId?: string } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.requestId = options.requestId;
  }
}

/** The API's error envelope: { success:false, error:{ code, message, details?, requestId } }. */
interface ErrorPayloadObject {
  error?:
    | string
    | { code?: string; message?: string; details?: Record<string, string[]>; requestId?: string };
  message?: unknown;
  // Tolerated legacy location for field errors.
  details?: { fieldErrors?: Record<string, string[]> };
}
type ErrorPayload = ErrorPayloadObject | null;

function errorObject(payload: ErrorPayload) {
  return payload?.error && typeof payload.error === "object" ? payload.error : undefined;
}

function readableError(payload: ErrorPayload, fallback: string) {
  const err = errorObject(payload);
  const fields =
    err?.details ??
    payload?.details?.fieldErrors ??
    (err as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors;
  const first = Object.entries(fields ?? {}).find(([, messages]) => messages.length > 0);
  if (first) return `${first[0]}: ${first[1][0]}`;
  if (err?.message) return err.message;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  return fallback;
}
export function configureApiTokens(next: Store | null) {
  store = next;
}
async function parse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as ({ data?: T } & ErrorPayloadObject) | null;
  if (!response.ok) {
    const err = errorObject(body);
    throw new ApiError(
      readableError(
        body,
        response.status === 401
          ? "Your session has expired. Please sign in again."
          : "The API request failed.",
      ),
      response.status,
      { code: err?.code, requestId: err?.requestId },
    );
  }
  return (body && "data" in body ? body.data : body) as T;
}
let refreshInFlight: Promise<string | null> | null = null;
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (!headers.has("Accept-Language")) headers.set("Accept-Language", acceptLanguage(readClientLocale()));
  const token = store?.getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && store && !retried) {
    refreshInFlight ??= store.refresh().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (refreshed) return apiRequest<T>(path, init, true);
  }
  return parse<T>(response);
}
export const loginRequest = (email: string, password: string) =>
  apiRequest<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const registerRequest = (email: string, password: string, name: string) =>
  apiRequest<Session>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
export const refreshRequest = (refreshToken: string) =>
  fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).then(parse<Session>);
export const logoutRequest = (refreshToken: string) =>
  apiRequest<void>("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) });
export async function downloadRequest(path: string, filename: string) {
  const headers = new Headers();
  const token = store?.getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) throw new ApiError("The download could not be completed.", response.status);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
