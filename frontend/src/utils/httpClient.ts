// Lightweight HTTP client with timeout, status mapping, and optional retry
// Usage:
//   const data = await httpClient.get('/api/endpoint');
//   const data = await httpClient.post('/api/endpoint', body);
//
// Notes:
// - Default timeout: 15000ms
// - Retries: disabled by default; enable via options.retries

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<TBody = any> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  timeoutMs?: number;
  retries?: number; // number of retry attempts on network/5xx
  retryDelayMs?: number; // delay between retries
  signal?: AbortSignal;
  suppressErrorMessage?: boolean; // do not trigger global error handler
}

export interface AppHttpError extends Error {
  status?: number;
  code: 'BAD_REQUEST' | 'UNPROCESSABLE' | 'NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  details?: any;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRY_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapStatusToMessage(status: number): Pick<AppHttpError, 'code' | 'message'> {
  if (status === 400) return { code: 'BAD_REQUEST', message: '请求参数错误' };
  if (status === 422) return { code: 'UNPROCESSABLE', message: '请求数据格式不正确' };
  if (status === 404) return { code: 'NOT_FOUND', message: '资源未找到' };
  if (status >= 500 && status <= 599) return { code: 'SERVER_ERROR', message: '服务器暂不可用，请稍后重试' };
  return { code: 'UNKNOWN', message: `请求失败（HTTP ${status}）` };
}

type HttpClientErrorHandler = (error: AppHttpError, context: { url: string; options: RequestOptions }) => void;
let globalErrorHandler: HttpClientErrorHandler | null = null;

export function setHttpClientErrorHandler(handler: HttpClientErrorHandler | null) {
  globalErrorHandler = handler;
}

async function doFetch<TResponse = any, TBody = any>(url: string, options: RequestOptions<TBody> = {}): Promise<TResponse> {
  const {
    method = 'GET',
    headers,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 0,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    signal,
    suppressErrorMessage = false,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const finalSignal = signal ?? controller.signal;

  const fetchOnce = async (): Promise<TResponse> => {
    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: finalSignal,
      });

      // Try parse json if available
      const contentType = resp.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await resp.json().catch(() => undefined) : undefined;

      if (!resp.ok) {
        const mapped = mapStatusToMessage(resp.status);
        const err: AppHttpError = Object.assign(new Error(mapped.message), {
          status: resp.status,
          code: mapped.code,
          details: payload?.error ?? payload,
          name: 'AppHttpError',
        });
        if (globalErrorHandler && !suppressErrorMessage) {
          try { globalErrorHandler(err, { url, options }); } catch {}
        }
        throw err;
      }

      // Prefer payload.data if our API schema uses { success, data, error }
      return (payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload) as TResponse;
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        const err = Object.assign(new Error('请求超时或被取消'), {
          code: 'TIMEOUT' as const,
          name: 'AppHttpError',
        }) as AppHttpError;
        if (globalErrorHandler && !suppressErrorMessage) {
          try { globalErrorHandler(err, { url, options }); } catch {}
        }
        throw err;
      }
      if (e?.code && typeof e.code === 'string') {
        // Already an AppHttpError
        throw e as AppHttpError;
      }
      const err = Object.assign(new Error(e?.message || '网络异常'), {
        code: 'NETWORK_ERROR' as const,
        details: e,
        name: 'AppHttpError',
      }) as AppHttpError;
      if (globalErrorHandler && !suppressErrorMessage) {
        try { globalErrorHandler(err, { url, options }); } catch {}
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let attempt = 0;
  while (true) {
    try {
      return await fetchOnce();
    } catch (err: any) {
      const shouldRetry =
        attempt < retries &&
        (err?.code === 'NETWORK_ERROR' || err?.code === 'TIMEOUT' || err?.code === 'SERVER_ERROR');
      if (!shouldRetry) throw err;
      attempt += 1;
      await sleep(retryDelayMs);
    }
  }
}

export const httpClient = {
  request: doFetch,
  get<TResponse = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return doFetch<TResponse>(url, { ...(options || {}), method: 'GET' });
  },
  post<TResponse = any, TBody = any>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return doFetch<TResponse, TBody>(url, { ...(options || {}), method: 'POST', body });
  },
  put<TResponse = any, TBody = any>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return doFetch<TResponse, TBody>(url, { ...(options || {}), method: 'PUT', body });
  },
  patch<TResponse = any, TBody = any>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return doFetch<TResponse, TBody>(url, { ...(options || {}), method: 'PATCH', body });
  },
  delete<TResponse = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return doFetch<TResponse>(url, { ...(options || {}), method: 'DELETE' });
  },
};

export default httpClient;


