import axios from 'axios';

// Create central Axios client mapping our development Vite API Proxy path
export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Request Interceptor:
 * Intercepts every outgoing client request and automatically binds Bearer Session Tokens
 * if present in storage.
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Secure, self-healing JWT session token auto-refresher. If an API request fails with a 401 (Expired token),
 * it transparently triggers a silent refresh call, updates storage, and replays the original request!
 */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 (Unauthorized) and not already a retried request or auth attempt
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
            if (isRefreshing) {
                // If token refresh is already in progress, queue up subsequent requests
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                isRefreshing = false;
                clearSession();
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Session Token expired. Executing silent token refresh flow...');
                
                // Call public token refresh endpoint proxy
                const refreshResponse = await axios.post('/api/auth/refresh', { refreshToken });

                if (refreshResponse.data && refreshResponse.data.accessToken) {
                    const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    console.log('✓ Token refresh successful! Replaying original queued requests...');
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    processQueue(null, accessToken);
                    isRefreshing = false;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('✗ Silent session refresh failed. Clearing active sessions:', refreshError);
                processQueue(refreshError, null);
                isRefreshing = false;
                clearSession();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Safely clears storage and signs the client session out
 */
export const clearSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    // Dispatch custom event to notify React stores instantly
    window.dispatchEvent(new Event('auth-logout'));
};
