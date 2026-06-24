'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [globalRules, setGlobalRules] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar regras globais atuais
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const rules = data.find((s: any) => s.key === 'global_rules');
          if (rules) {
            setGlobalRules(rules.value);
          }
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ global_rules: globalRules }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Regras globais salvas com sucesso!' });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-gray-600 transition-colors">
          Agentes
        </Link>
        <span>/</span>
        <span className="text-gray-700">Regras Globais</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Regras Globais</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-lg">
          Estas regras são aplicadas em <strong>TODOS</strong> os agentes criados,
          antes de qualquer instrução específica. O cliente <strong>NUNCA</strong> pode
          ver ou modificar estas regras.
        </p>
      </div>

      {/* Alerta de segurança */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-amber-500 text-xl shrink-0">🔒</span>
        <div>
          <h3 className="font-semibold text-amber-800 text-sm mb-1">
            Acesso exclusivo do Admin
          </h3>
          <p className="text-sm text-amber-700">
            Estas regras ficam no background do sistema. Mesmo que o cliente
            personalize o atendente, estas regras globais <strong>sempre</strong> são
            aplicadas primeiro e não podem ser contornadas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card">
        <div>
          <label htmlFor="global_rules" className="form-label mb-2">
            Instruções que TODOS os agentes devem seguir
          </label>
          <textarea
            id="global_rules"
            className="textarea-field"
            rows={10}
            placeholder="Exemplos de regras globais:

- NUNCA invente informações ou preços. Se não souber, diga que vai consultar e retornar.
- Sempre seja educado e profissional, usando linguagem formal.
- Jamais mencione concorrentes ou faça comparações com outros negócios.
- Se o cliente pedir para falar com um humano, forneça o WhatsApp de contato.
- Não faça promessas que não possa cumprir (prazos de entrega, descontos não autorizados)."
            value={globalRules}
            onChange={(e) => setGlobalRules(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-2">
            Estas regras serão injetadas no início do prompt do sistema de
            <strong> todos os agentes</strong>. Nem o cliente nem a customização
            do cliente podem removê-las.
          </p>
        </div>

        {message && (
          <div
            className={`mt-4 text-sm px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end mt-6 pt-4 border-t border-[#f5f0e8]">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Salvando...' : '💾 Salvar Regras Globais'}
          </button>
        </div>
      </form>
    </div>
  );
}
