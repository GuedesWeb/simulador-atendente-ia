import { getDb } from '@/lib/db';
import type { Agent } from '@/lib/db';
import Link from 'next/link';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { DeleteAgentButton } from '@/components/DeleteAgentButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = getDb();
  const { data: agents = [] } = await db
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false });

  const typedAgents = agents as Agent[];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seus Agentes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os atendentes de IA que você criou
          </p>
        </div>
        <Link href="/admin/criar" className="btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Agente
        </Link>
      </div>

      {/* Lista de agentes */}
      {typedAgents.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum agente criado ainda
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Crie seu primeiro atendente de IA personalizado para começar a
            compartilhar com seus clientes.
          </p>
          <Link href="/admin/criar" className="btn-primary">
            Criar Primeiro Agente
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {typedAgents.map((agent) => (
            <div key={agent.id} className="card flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {agent.business_name || agent.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Criado em {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="badge badge-green shrink-0 ml-2">Ativo</span>
              </div>

              {agent.services && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                  {agent.services}
                </p>
              )}
              {!agent.services && <div className="flex-1" />}

              {/* Link compartilhável */}
              <div className="bg-[#faf6f0] rounded-lg px-3 py-2 mb-3 flex items-center justify-between gap-2">
                <code className="text-xs text-gray-600 truncate">
                  {baseUrl}/chat/{agent.slug}
                </code>
                <CopyLinkButton slug={agent.slug} baseUrl={baseUrl} />
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#f5f0e8]">
                <Link
                  href={`/admin/editar/${agent.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Editar
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href={`/chat/${agent.slug}`}
                  target="_blank"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Visualizar
                </Link>
                <div className="flex-1" />
                <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
