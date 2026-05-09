import { API_BASE_URL } from "@/lib/config";
import { ApiError, type ApiErrorPayload } from "./types";

export type TokenGetter = () => string | null;
export type TokenSetter = (token: string | null) => void;
export type RefreshFn = () => Promise<string | null>;

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;
  retryOnAuthFailure?: boolean;
};

function parseApiError(status: number, payload: unknown) {
  const maybe = payload as Partial<ApiErrorPayload> | null;
  const errObj =
    typeof maybe === "object" && maybe && "error" in maybe && typeof (maybe as { error?: unknown }).error === "object"
      ? (maybe as { error?: { code?: string; message?: string } }).error
      : undefined;
  const code = errObj?.code;
  const message =
    errObj?.message ??
    (typeof maybe === "object" && maybe && "message" in maybe ? (maybe as { message?: string }).message : undefined);

  return new ApiError({
    status,
    message: message || `Request failed (${status})`,
    code,
    payload,
  });
}

async function readPayload(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  if (ct.includes("text/")) return await res.text();
  // file downloads etc: caller should handle separately
  return await res.arrayBuffer();
}

export function createHttpClient(opts: {
  getToken: TokenGetter;
  setToken: TokenSetter;
  refresh: RefreshFn;
}) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

    const auth = options.auth !== false;
    const token = auth ? opts.getToken() : null;

    const headers: Record<string, string> = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"] && options.body) {
      headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return (await res.json()) as T;
      return (await readPayload(res)) as unknown as T;
    }

    // Handle 401 with one refresh+retry (if enabled)
    if (res.status === 401 && auth && options.retryOnAuthFailure !== false) {
      const newToken = await opts.refresh();
      if (newToken) {
        opts.setToken(newToken);
        return await request<T>(path, { ...options, retryOnAuthFailure: false });
      }
    }

    const payload = await readPayload(res).catch(() => undefined);
    throw parseApiError(res.status, payload);
  }

  return { request };
}

