export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (
    err as { response?: { data?: { message?: unknown } } } | undefined
  )?.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) {
    return typeof message[0] === "string" ? message[0] : fallback;
  }
  if (typeof message === "string" && message !== "Unauthorized") {
    return message;
  }
  return fallback;
}
