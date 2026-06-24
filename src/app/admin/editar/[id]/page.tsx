'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditarAgentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    business_name: '',
    services: '',
    contact_info: '',
    hours: '',
    address: '',
    custom_instructions: '',
    slug: '',
  });

  // Carregar dados do agente
  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch(`/api/agents/${id}`);
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          return;
        }
        const data = await res.json();
        setFormData({
          name: data.name || '',
          company_name: data.company_name || '',
          business_name: data.business_name || '',
          services: data.services || '',
          contact_info: data.contact_info || '',
          hours: data.hours || '',
          address: data.address || '',
          custom_instructions: data.custom_instructions || '',
          slug: data.slug || '',
        });
      } catch {
        setError('Erro ao carregar dados do agente.');
      } finally {
        setLoadingData(false);
      }
    }
    loadAgent();
  }, [id]);

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
      const res = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao atualizar agente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Agente não encontrado
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          O agente que você procura não existe ou foi removido.
        </p>
        <Link href="/admin" className="btn-primary">
          Voltar para Agentes
        </Link>
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
        <span className="text-gray-700">Editar: {formData.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Agente</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atualize as configurações do atendente de IA
          </p>
        </div>
        <Link
          href={`/chat/${formData.slug}`}
          target="_blank"
          className="btn-secondary text-sm"
        >
          👁️ Visualizar Chat
        </Link>
      </div>

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
            </div>
          </div>
        </div>

        {/* Seção: Informações do Negócio */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            📋 Informações do Negócio
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="company_name_edit" className="form-label">
                Nome da Empresa / Marca
              </label>
              <input
                id="company_name_edit"
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
                placeholder="Descreva os serviços/produtos..."
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
                placeholder="Ex: WhatsApp (11) 99999-9999"
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
                  placeholder="Ex: Rua X, 123"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Personalização */}
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
                placeholder="Ex: Sempre oferecer desconto de 10%..."
                value={formData.custom_instructions}
                onChange={(e) =>
                  updateField('custom_instructions', e.target.value)
                }
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Erro e Botões */}
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
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
