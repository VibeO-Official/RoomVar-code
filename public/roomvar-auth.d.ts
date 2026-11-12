import type { SupabaseClient, User } from '@supabase/supabase-js';
export const MIN_PASSWORD_LENGTH: number;
export function passwordValid(value: unknown): boolean;
export function emailValid(value: string): boolean;
export function installPasswordAuth(options: { doc: Document; sb: SupabaseClient; onUser: (user: User | null) => void | Promise<void> }): void;
