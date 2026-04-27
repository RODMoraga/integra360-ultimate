import { api } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
  companyId?: number;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName?: string;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "auth_user";

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
        companyId: credentials.companyId || 1 // Default company ID
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
        companyId: data.companyId || 1
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
   * Clear user data from localStorage
   */
  private clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Handle API errors
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
