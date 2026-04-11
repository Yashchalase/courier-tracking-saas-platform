import axios from "axios";

const GENERIC = "Something went wrong. Please try again.";

function clampMessage(s: string, max = 200): string {
  const t = s.trim();
  if (!t) return GENERIC;
  if (t.length <= max) return t;
  return GENERIC;
}

/**
 * Maps common API / network wording to plain language for end users.
 */
export function humanizeApiMessage(raw: string, status?: number): string {
  const t = raw.trim();
  if (!t && status != null) {
    if (status === 401) return "Your session expired. Please sign in again.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "We couldn't find what you were looking for.";
    if (status === 409) return "This action conflicts with the current data. Refresh and try again.";
    if (status === 429) return "Too many attempts. Please wait a moment.";
    if (status >= 500) return "Our service had a problem. Please try again in a moment.";
    return GENERIC;
  }
  if (!t) return GENERIC;
  const low = t.toLowerCase();

  if (status === 401 || low.includes("unauthorized") || low.includes("jwt"))
    return "Your session expired. Please sign in again.";
  if (status === 403 || low.includes("forbidden"))
    return "You don't have permission to do that.";
  if (status === 404 || low.includes("not found"))
    return "We couldn't find what you were looking for.";
  if (
    status === 409 ||
    low.includes("already") ||
    low.includes("conflict") ||
    low.includes("in use")
  )
    return "This action conflicts with the current data. Refresh the page and try again.";
  if (status === 429 || low.includes("too many"))
    return "Too many attempts. Please wait a moment.";
  if (status != null && status >= 500)
    return "Our service had a problem. Please try again in a moment.";
  if (
    low.includes("network") ||
    low.includes("econnrefused") ||
    low.includes("enotfound") ||
    low === "network error"
  )
    return "We couldn't reach the server. Check your connection.";
  if (low.includes("timeout") || low.includes("timed out"))
    return "The request took too long. Try again.";
  if (low.includes("internal server") || low.includes("500"))
    return "Our service had a problem. Please try again in a moment.";

  return clampMessage(t);
}

function firstValidationMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const errors = (data as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const first = errors[0] as { msg?: string; message?: string };
  const msg =
    typeof first?.msg === "string"
      ? first.msg
      : typeof first?.message === "string"
        ? first.message
        : null;
  return msg && msg.trim() ? msg.trim() : null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as
      | { error?: string; message?: string; errors?: unknown }
      | undefined;

    const validationMsg = firstValidationMessage(data);
    if (validationMsg)
      return humanizeApiMessage(validationMsg, status);

    if (data && typeof data === "object") {
      if (typeof data.error === "string" && data.error)
        return humanizeApiMessage(data.error, status);
      if (typeof data.message === "string" && data.message)
        return humanizeApiMessage(data.message, status);
    }

    if (!err.response) {
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        return "We couldn't reach the server. Check your connection.";
      }
      if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
        return "The request took too long. Try again.";
      }
    }

    if (typeof err.message === "string" && err.message && !err.response) {
      return humanizeApiMessage(err.message, status);
    }

    if (status != null) {
      const byStatus = humanizeApiMessage("", status);
      return byStatus !== GENERIC ? byStatus : fallback;
    }
  }

  if (err instanceof Error && err.message) {
    if (err.message === "Network Error")
      return "We couldn't reach the server. Check your connection.";
    const h = humanizeApiMessage(err.message, undefined);
    return h === GENERIC ? fallback : h;
  }

  return fallback;
}
