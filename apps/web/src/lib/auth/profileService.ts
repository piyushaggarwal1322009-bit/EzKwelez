import { getSupabaseClient } from "../supabase/client";
import { UserProfile, UpdateProfileDTO, UserRole } from "@ezykwelez/shared";

export class ProfileService {
  private client = getSupabaseClient();

  async getCurrentProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, full_name, role, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      // If table doesn't exist or query fails in offline/mock mode, return a fallback profile with default student role
      return {
        id: userId,
        fullName: null,
        role: UserRole.STUDENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      role: (data.role as UserRole) || UserRole.STUDENT,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateCurrentProfile(userId: string, updates: UpdateProfileDTO): Promise<UserProfile> {
    // SECURITY: Users can only update permitted personal fields (fullName). Role cannot be modified client-side.
    const payload: Record<string, any> = {};
    if (updates.fullName !== undefined) {
      payload.full_name = updates.fullName;
    }

    const { data, error } = await this.client
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("id, full_name, role, created_at, updated_at")
      .single();

    if (error) {
      throw new Error("We couldn't update your profile. Please try again.");
    }

    return {
      id: data.id,
      fullName: data.full_name,
      role: (data.role as UserRole) || UserRole.STUDENT,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const profileService = new ProfileService();
