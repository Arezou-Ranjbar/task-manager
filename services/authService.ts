import { AUTH_STORAGE_KEY, FAKE_LATENCY_MS } from "@/lib/constants";
import type { LoginInput, User } from "@/types/auth";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  async login(input: LoginInput): Promise<User> {
    await delay(FAKE_LATENCY_MS);

    if (!input.email || !input.password) {
      throw new Error("Email and password are required.");
    }
    if (input.password.length < 4) {
      throw new Error("Incorrect email or password.");
    }

    const namePart = input.email.split("@")[0] ?? "User";
    const name = namePart
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p[0]!.toUpperCase() + p.slice(1))
      .join(" ");

    const user: User = {
      id: `user_${input.email}`,
      name: name || "Demo User",
      email: input.email,
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }

    return user;
  },

  async logout(): Promise<void> {
    await delay(150);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
};
