import { ApiError } from "./api";
import type { Locale } from "./messages";

/** API error code → user-facing message, per locale. Screens branch on `code`, not text. */
const CODE_MESSAGES: Record<Locale, Record<string, string>> = {
  es: {
    VALIDATION_FAILED: "Revisa los campos marcados.",
    NOTE_REQUIRED: "Se requiere una nota de al menos 5 caracteres.",
    UPLOAD_INCOMPLETE: "La carga no terminó. Inténtalo de nuevo.",
    UNAUTHENTICATED: "Tu sesión expiró. Inicia sesión de nuevo.",
    FORBIDDEN: "No tienes permiso para hacer eso.",
    NOT_FOUND: "No se encontró el recurso.",
    CONFLICT: "El cambio entra en conflicto con el estado actual. Actualiza e inténtalo de nuevo.",
    INVALID_STATUS_TRANSITION: "Ese cambio de estado no está permitido.",
    DOCUMENT_LOCKED: "Este documento está bloqueado en su estado actual y no acepta un archivo nuevo.",
    NOT_ENTITLED: "Esa acción no está disponible para este documento todavía.",
    ACCOUNT_PENDING: "Tu cuenta está pendiente de aprobación.",
    ACCOUNT_SUSPENDED: "Tu cuenta está suspendida. Contáctanos para reactivarla.",
    ONBOARDING_INCOMPLETE: "Completa tu perfil para continuar.",
    PHASE_INVALID_TRANSITION: "Ese cambio de fase no está permitido.",
    MANAGER_REQUIRED: "Se requiere un gestor asignado para esta acción.",
    UPLOAD_EXPIRED: "La ventana de carga expiró. Inicia la carga de nuevo.",
    FILE_TOO_LARGE: "El archivo supera el límite de 25 MB.",
    FILE_TYPE_NOT_ALLOWED: "Ese tipo de archivo no se acepta.",
    RATE_LIMITED: "Demasiadas solicitudes. Espera un momento.",
    INTERNAL_ERROR: "Algo salió mal de nuestro lado. Inténtalo de nuevo.",
    NETWORK: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",
  },
  en: {
    VALIDATION_FAILED: "Check the highlighted fields.",
    NOTE_REQUIRED: "A note of at least 5 characters is required.",
    UPLOAD_INCOMPLETE: "The upload did not finish. Please try again.",
    UNAUTHENTICATED: "Your session has expired. Please sign in again.",
    FORBIDDEN: "You do not have permission to do that.",
    NOT_FOUND: "We could not find that resource.",
    CONFLICT: "That change conflicts with the current state. Refresh and try again.",
    INVALID_STATUS_TRANSITION: "That status change is not allowed.",
    DOCUMENT_LOCKED: "This document is locked in its current status and cannot take a new file.",
    NOT_ENTITLED: "That action is not available for this document yet.",
    ACCOUNT_PENDING: "Your account is pending approval.",
    ACCOUNT_SUSPENDED: "Your account is suspended. Please contact us to reactivate it.",
    ONBOARDING_INCOMPLETE: "Complete your profile to continue.",
    PHASE_INVALID_TRANSITION: "That phase change is not allowed.",
    MANAGER_REQUIRED: "An assigned manager is required for this action.",
    UPLOAD_EXPIRED: "The upload window expired. Start the upload again.",
    FILE_TOO_LARGE: "That file is larger than the 25 MB limit.",
    FILE_TYPE_NOT_ALLOWED: "That file type is not accepted.",
    RATE_LIMITED: "Too many requests. Please wait a moment.",
    INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
    NETWORK: "We couldn't connect. Check your connection and try again.",
  },
};

/**
 * The message to show a user for any thrown value. Prefers the mapped message for the
 * API's `code`, then the API's own message, then the localized network fallback — never
 * raw error text or a browser "Failed to fetch".
 */
export function messageForError(error: unknown, locale: Locale): string {
  const table = CODE_MESSAGES[locale];
  if (error instanceof ApiError) {
    if (error.code && table[error.code]) return table[error.code];
    if (error.message) return error.message;
  }
  return table.NETWORK;
}

export { CODE_MESSAGES };
