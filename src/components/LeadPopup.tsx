'use client';

import { useState, FormEvent } from 'react';

interface LeadPopupProps {
  agentId: string;
  onComplete: (leadId: string) => void;
}

export default function LeadPopup({ agentId, onComplete }: LeadPopupProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          name: nome,
          email: email,
          whatsapp: whatsapp,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Salvar no localStorage para não mostrar de novo
        localStorage.setItem(`lead_${agentId}`, data.id);
        onComplete(data.id);
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Para continuar o seu teste
          </h2>
          <p className="text-sm text-gray-500">
            Preencha os dados abaixo para continuar conversando com nosso
            atendente virtual.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="lead-nome" className="form-label">
              Nome *
            </label>
            <input
              id="lead-nome"
              type="text"
              className="input-field"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="lead-email" className="form-label">
              Email *
            </label>
            <input
              id="lead-email"
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="lead-whatsapp" className="form-label">
              WhatsApp
            </label>
            <input
              id="lead-whatsapp"
              type="tel"
              className="input-field"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Continuar Conversa'}
          </button>
        </form>
      </div>
    </div>
  );
}
