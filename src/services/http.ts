/**
 * The shared JSON transport for both platform clients. It adds bearer auth,
 * retries transient failures (rate limit / server hiccups) with a short backoff,
 * and turns error responses into a readable `Label: message` string. Token
 * lifecycle stays in each platform's auth module; this layer just carries the
 * token it is handed.
 */

interface RequestOptions {
  /** Platform name used to prefix error messages, e.g. "Spotify". */
  label: string
  method?: string
  /** Bearer token; sent as `Authorization: Bearer <token>` when present. */
  token?: string
  /** JSON request body; serialized and sent with a JSON content-type. */
  body?: unknown
  /** Max retries for 429 / 5xx. Defaults to 2. */
  retries?: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function errorMessage(res: Response, label: string): Promise<string> {
  try {
    const data = await res.json()
    const detail =
      data?.error?.message ??
      data?.error_description ??
      (typeof data?.error === "string" ? data.error : undefined)
    if (detail) return `${label}: ${detail}`
  } catch {
    // Non-JSON error body; fall back to the status.
  }
  return `${label} request failed (${res.status}).`
}

/** Fetch JSON with bearer auth, transient-failure retries, and parsed errors. */
export async function request<T>(url: string, options: RequestOptions): Promise<T> {
  const { label, method = "GET", token, body, retries = 2 } = options
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers["Content-Type"] = "application/json"

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (res.ok) return res.json() as Promise<T>
    // Retry only rate limits and server hiccups; 4xx (quota, auth, bad request)
    // are terminal.
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await delay(400 * (attempt + 1))
      continue
    }
    throw new Error(await errorMessage(res, label))
  }
}
