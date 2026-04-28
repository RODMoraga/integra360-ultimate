import axios from "axios";

/**
 * Shared Axios instance for all frontend HTTP requests.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  timeout: 10000
});

/**
 * Guard flag to avoid multiple redirects when several requests fail with 401.
 */
let isRedirectingOnUnauthorized = false;

/**
 * Global response interceptor.
 * When a non-auth endpoint returns 401, clears local session and redirects to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl: string = error?.config?.url ?? "";
    const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint && !isRedirectingOnUnauthorized) {
      isRedirectingOnUnauthorized = true;

      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      delete api.defaults.headers.common["Authorization"];

      const currentPath = window.location.pathname + window.location.search;
      const redirectQuery = currentPath && currentPath !== "/login" ? `?redirect=${encodeURIComponent(currentPath)}` : "";

      window.location.replace(`/login${redirectQuery}`);
    }

    return Promise.reject(error);
  }
);