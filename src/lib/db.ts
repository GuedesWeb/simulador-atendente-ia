import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

/**
 * Retorna o cliente Supabase para operações server-side (API Routes).
 * Usa a SERVICE_ROLE_KEY que tem acesso total ao banco.
 * NUNCA use esta função em componentes client-side!
 */
export function getDb(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env.local'
      );
    }

    supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

/**
 * Retorna o cliente Supabase para uso público (client-side ou API pública).
 * Usa a ANON KEY que respeita as políticas RLS.
 */
export function getPublicDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// Tipos
export interface Agent {
  id: string;
  slug: string;
  name: string;
  company_name: string;
  business_name: string;
  services: string;
  contact_info: string;
  hours: string;
  address: string;
  custom_instructions: string;
  system_rules: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  agent_id: string;
  name: string;
  email: string;
  whatsapp: string;
  created_at: string;
}

export interface Message {
  id: number;
  agent_id: string;
  lead_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}
