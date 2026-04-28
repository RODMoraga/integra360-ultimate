import { defineStore } from "pinia";

/**
 * Centralized auth session store (token + lightweight user profile).
 */
export const useSessionStore = defineStore("session", {
  state: () => ({
    token: "",
    user: null as null | { id: number; email: string; role: string }
  }),
  actions: {
    /**
     * Writes authenticated session values into store state.
     */
    setSession(token: string, user: { id: number; email: string; role: string }) {
      this.token = token;
      this.user = user;
    },
    /**
     * Clears current session data from store state.
     */
    clearSession() {
      this.token = "";
      this.user = null;
    }
  }
});