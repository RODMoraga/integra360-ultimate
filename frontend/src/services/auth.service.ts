import { api } from "./api";

/**
 * Default company identifier used when request does not provide one.
 */
export const DEFAULT_COMPANY_ID = 2;

/**
 * Login request contract.
 */
export interface LoginRequest {
  email: string;
  password: string;
  companyId?: number;
}

/**
 * Login response contract.
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

/**
 * Minimal authenticated user representation used in local storage.
 */
export interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
  companyId?: number;
  role?: string;
}

/**
 * Decoded JWT payload shape used by frontend session bootstrap.
 */
export interface TokenPayload {
  id: number;
  email: string;
  companyId: number;
  iat?: number;
  exp?: number;
}

/**
 * Frontend authentication service.
 * Handles token lifecycle, auth requests and persisted user state.
 */
class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "auth_user";

  /**
   * Bootstrap auth state from persisted token
   */
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
        companyId: credentials.companyId ?? DEFAULT_COMPANY_ID
      });

      // Store token
      if (response.data.accessToken) {
        this.setToken(response.data.accessToken);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validates credentials without persisting or mutating the current session.
   */
  async verifyCredentials(credentials: LoginRequest): Promise<boolean> {
    try {
      await api.post<LoginResponse>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
        companyId: credentials.companyId ?? DEFAULT_COMPANY_ID
      });
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   */
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    companyId?: number;
  }) {
    try {
      const response = await api.post("/auth/register", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        companyId: data.companyId ?? DEFAULT_COMPANY_ID
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout and clear stored credentials
   */
  logout(): void {
    this.clearToken();
    this.clearUser();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    // Add token to API default headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Clear token from localStorage
   */
  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Set user data in localStorage
   */
  setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data from localStorage
   */
  getUser(): AuthUser | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Decodes the current JWT payload (base64url) without external libraries.
   */
  getTokenPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) {
      return null;
    }

    try {
      const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      const json = atob(padded);
      const parsed = JSON.parse(json) as TokenPayload;

      if (!parsed?.id || !parsed?.email || !parsed?.companyId) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Returns current authenticated user from persisted profile or JWT payload fallback.
   */
  getCurrentUser(): AuthUser | null {
    const persisted = this.getUser();
    if (persisted?.id && persisted?.email) {
      return persisted;
    }

    const payload = this.getTokenPayload();
    if (!payload) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      companyId: payload.companyId,
      role: persisted?.role ?? "Usuario"
    };
  }

  /**
   * Clear user data from localStorage
   */
  private clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Normalizes request errors into user-friendly Error instances.
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText;
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error("No response from server. Please check your connection.");
    } else {
      // Error in request setup
      return new Error(error.message || "An error occurred");
    }
  }
}

export const authService = new AuthService();
