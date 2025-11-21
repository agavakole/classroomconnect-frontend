import { ACCESS_TOKEN_KEY } from '../constants/storage';

export class ApiError extends Error {
	status: number;
	data: unknown;

	constructor(status: number, message: string, data: unknown) {
		super(message);
		this.status = status;
		this.data = data;
	}
}

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

function resolveApiBase() {
	const configured = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

	// When someone opens the app from another device (e.g., phone on the same Wi‑Fi),
	// a localhost API URL won't work. If we detect that situation, swap the hostname
	// to the one serving the frontend so the backend on the dev machine is reachable.
	if (typeof window !== 'undefined') {
		try {
			const url = new URL(configured);
			const isLocalApiHost = LOCAL_HOSTNAMES.has(url.hostname);
			const isRemoteClient = !LOCAL_HOSTNAMES.has(window.location.hostname);

			if (isLocalApiHost && isRemoteClient) {
				url.hostname = window.location.hostname;
				return url.toString().replace(/\/$/, '');
			}

			return url.toString().replace(/\/$/, '');
		} catch {
			// Fall through to configured value if URL parsing fails
		}
	}

	return configured;
}

const API_BASE = resolveApiBase();

// Useful for verifying which API base got baked into the build
console.log('API_BASE', API_BASE);

type ApiClientOptions = RequestInit & {
	skipAuth?: boolean;
};

export async function apiClient<T>(
	path: string,
	{ headers, skipAuth, ...rest }: ApiClientOptions = {}
): Promise<T> {
	const requestHeaders = new Headers(headers ?? {});

	if (rest.body && !requestHeaders.has('Content-Type')) {
		requestHeaders.set('Content-Type', 'application/json');
	}

	if (!skipAuth) {
		const token = localStorage.getItem(ACCESS_TOKEN_KEY);
		if (token && !requestHeaders.has('Authorization')) {
			requestHeaders.set('Authorization', `Bearer ${token}`);
		}
	}

	const response = await fetch(`${API_BASE}${path}`, {
		...rest,
		headers: requestHeaders,
	});

	let data: unknown = null;
	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		data = await response.json();
	} else if (response.status !== 204) {
		data = await response.text();
	}

	if (!response.ok) {
		const message =
			typeof data === 'object' && data !== null && 'detail' in data
				? String((data as { detail?: unknown }).detail)
				: response.statusText || 'Request failed';
		throw new ApiError(response.status, message, data);
	}

	return data as T;
}
