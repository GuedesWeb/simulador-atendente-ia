'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CriarAgentePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    business_name: '',
    services: '',
    contact_info: '',
    hours: '',
    address: '',
    custom_instructions: '',
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('O nome do agente é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao criar agente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-gray-600 transition-colors">
          Agentes
        </Link>
        <span>/</span>
        <span className="text-gray-700">Novo Agente</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Criar Novo Agente
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Configure o atendente de IA para o negócio do seu cliente. Após criar,
        você receberá um link compartilhável.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Seção: Identidade */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            🏷️ Identidade do Atendente
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="form-label">
                Nome do Agente *
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Ex: Atendente Virtual — Loja X"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Nome interno para identificar no painel. O cliente não vê.
              </p>
            </div>
            <div>
              <label htmlFor="business_name" className="form-label">
                Nome do Atendente (aparece para o cliente)
              </label>
              <input
                id="business_name"
                type="text"
                className="input-field"
                placeholder="Ex: Ana — Atendente da Loja X"
                value={formData.business_name}
                onChange={(e) => updateField('business_name', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Caso queira personalizar o nome que aparece no chat. Se vazio,
                usa o nome do agente.
              </p>
            </div>
          </div>
        </div>

        {/* Seção: Informações do Negócio */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            📋 Informações do Negócio
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Essas informações serão usadas pela IA para responder os clientes.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="company_name" className="form-label">
                Nome da Empresa / Marca
              </label>
              <input
                id="company_name"
                type="text"
                className="input-field"
                placeholder="Ex: Loja XPTO, Escritório ABC"
                value={formData.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="services" className="form-label">
                Serviços Oferecidos
              </label>
              <textarea
                id="services"
                className="textarea-field"
                placeholder="Descreva os serviços/produtos que o negócio oferece..."
                value={formData.services}
                onChange={(e) => updateField('services', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="contact_info" className="form-label">
                Informações de Contato
              </label>
              <input
                id="contact_info"
                type="text"
                className="input-field"
                placeholder="Ex: WhatsApp (11) 99999-9999 | email@loja.com"
                value={formData.contact_info}
                onChange={(e) => updateField('contact_info', e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hours" className="form-label">
                  Horário de Atendimento
                </label>
                <input
                  id="hours"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Seg-Sex 9h às 18h"
                  value={formData.hours}
                  onChange={(e) => updateField('hours', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="address" className="form-label">
                  Endereço
                </label>
                <input
                  id="address"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Rua X, 123 — Bairro Y"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Personalização Avançada */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            ⚙️ Personalização do Atendimento
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="custom_instructions" className="form-label">
                Instruções Específicas de Atendimento
              </label>
              <textarea
                id="custom_instructions"
                className="textarea-field"
                placeholder="Ex: Sempre oferecer desconto de 10% na primeira compra. Nunca falar sobre política de devolução sem o cliente perguntar..."
                value={formData.custom_instructions}
                onChange={(e) =>
                  updateField('custom_instructions', e.target.value)
                }
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">
                Instruções para guiar o comportamento do atendente.
              </p>
            </div>
          </div>
        </div>

        {/* Erro e Botão */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Link href="/admin" className="btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Agente'}
          </button>
        </div>
      </form>
    </div>
  );
}
