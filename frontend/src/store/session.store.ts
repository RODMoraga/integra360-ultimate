import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", {
  state: () => ({
    token: "",
    user: null as null | { id: number; email: string; role: string }
  }),
  actions: {
    setSession(token: string, user: { id: number; email: string; role: string }) {
      this.token = token;
      this.user = user;
    },
    clearSession() {
      this.token = "";
      this.user = null;
    }
  }
});