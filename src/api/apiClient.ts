import axios from 'axios';

export const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

const REQUEST_TIMEOUT_MS = 10000;

interface ApiErrorOptions {
  status?: number;
  isNetworkError?: boolean;
  isCanceled?: boolean;
}

/**
 * The only error type that leaves this module. `message` is always
 * user-presentable; Axios internals never reach hooks or UI.
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;
  readonly isCanceled: boolean;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.isNetworkError = options.isNetworkError ?? false;
    this.isCanceled = options.isCanceled ?? false;
  }
}

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Aborted via AbortSignal – callers ignore these, so no user-facing copy needed.
  if (axios.isCancel(error)) {
    return new ApiError('Request cancelled.', { isCanceled: true });
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('The request timed out. Please try again.', {
        isNetworkError: true,
      });
    }

    if (error.response) {
      const { status } = error.response;
      const message =
        status >= 500
          ? 'The recipe service is temporarily unavailable. Please try again later.'
          : 'We couldn’t load this right now. Please try again.';
      return new ApiError(message, { status });
    }

    // Request was made but no response arrived → offline / DNS / connection refused.
    return new ApiError(
      'No internet connection. Check your network and try again.',
      { isNetworkError: true },
    );
  }

  return new ApiError(GENERIC_ERROR_MESSAGE);
}

/** Safe message for any thrown value – use this in hooks' catch blocks. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE;
}

export function isCanceledError(error: unknown): boolean {
  return error instanceof ApiError && error.isCanceled;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

type QueryParams = Record<string, string | number | undefined>;

export interface RequestOptions {
  params?: QueryParams;
  /** Abort the request when the caller unmounts or inputs change. */
  signal?: AbortSignal;
}

/**
 * Single entry point for all requests. Resolves with the parsed body only,
 * so callers never see raw Axios responses, and rejects with ApiError only.
 */
async function get<T>(
  path: string,
  { params, signal }: RequestOptions = {},
): Promise<T> {
  try {
    const response = await axiosInstance.get<T>(path, { params, signal });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export const apiClient = { get };
