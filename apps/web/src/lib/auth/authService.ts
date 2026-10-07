import { getSupabaseClient } from "../supabase/client";
import type { Session, User, AuthError } from "@supabase/supabase-js";

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export function formatAuthError(error: AuthError | Error | null): string {
  if (!error) return "An unexpected error occurred. Please try again.";
  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid grant")) {
    return "Unable to sign in. Please check your email and password.";
  }
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return "An account with this email address already exists. Please sign in instead.";
  }
  if (msg.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("jwt expired") || msg.includes("session expired")) {
    return "Your session has expired. Please sign in again.";
  }
  if (msg.includes("network error") || msg.includes("failed to fetch")) {
    return "Network connection issue. Please check your internet connection.";
  }

  return error.message || "An authentication error occurred. Please try again.";
}

export class AuthService {
  private client = getSupabaseClient();

  async signUp({ email, password, fullName }: SignUpParams) {
    // SECURITY: Only legitimate user metadata (full_name) is sent. Role assignment is strictly server/database-side.
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    return data;
  }

  async signIn({ email, password }: SignInParams) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    return data;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new Error(formatAuthError(error));
    }
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) {
      return null;
    }
    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  }
}

export const authService = new AuthService();
