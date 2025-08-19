import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

let supabase: SupabaseClient;

export function initializeSupabase(supabaseUrl?: string, supabaseKey?: string): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const url = supabaseUrl || process.env.SUPABASE_URL;
  const key = supabaseKey || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });

  return supabase;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call initializeSupabase first.');
  }
  return supabase;
}

// Auth helper functions
export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // Sign up with email and password
  async signUp(email: string, password: string, userData?: { name?: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Sign out
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<SupabaseUser | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Get current session
  async getCurrentSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Reset password
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Update password
  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Update user metadata
  async updateUserMetadata(userData: any) {
    const { error } = await this.supabase.auth.updateUser({
      data: userData
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

// JWT token validation middleware helper
export function extractUserFromToken(authHeader: string | null): { userId: string; email: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    // In a real implementation, you would verify the JWT token here
    // For now, we'll assume the token is valid and extract user info
    // This should be implemented with proper JWT verification
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    return {
      userId: decoded.sub,
      email: decoded.email
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
}

export default AuthService;