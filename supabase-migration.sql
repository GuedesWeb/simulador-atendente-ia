-- ============================================================
-- Simulador de Atendente IA — Migração Supabase
-- Execute este script no SQL Editor do Supabase:
-- https://app.supabase.com → Seu Projeto → SQL Editor
-- ============================================================

-- Tabela de Agentes
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  services TEXT DEFAULT '',
  contact_info TEXT DEFAULT '',
  hours TEXT DEFAULT '',
  address TEXT DEFAULT '',
  custom_instructions TEXT DEFAULT '',
  system_rules TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por slug (usado no chat público)
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar leads por agente
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);

-- Tabela de Mensagens (histórico de conversa)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar mensagens por agente
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);

-- ============================================================
-- Políticas de Segurança (Row Level Security)
-- ============================================================

-- Habilitar RLS nas tabelas
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Agentes: leitura pública (para o chat), escrita apenas admin
CREATE POLICY "Agentes - leitura pública"
  ON agents FOR SELECT
  USING (true);

-- Leads: inserção pública, leitura apenas admin
CREATE POLICY "Leads - inserção pública"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Mensagens: inserção e leitura pública
CREATE POLICY "Mensagens - inserção pública"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Mensagens - leitura pública"
  ON messages FOR SELECT
  USING (true);

-- ============================================================
-- Tabela de Configurações Globais (acesso exclusivo admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão de regras globais
INSERT INTO settings (key, value) VALUES ('global_rules', '')
  ON CONFLICT (key) DO NOTHING;

-- Política RLS: ninguém pode ler ou escrever publicamente
-- Apenas a API com service_role pode acessar (admin)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Função para atualizar o updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
