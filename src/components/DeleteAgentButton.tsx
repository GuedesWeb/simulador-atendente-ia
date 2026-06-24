'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteAgentButton({
  agentId,
  agentName,
}: {
  agentId: string;
  agentName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Erro ao excluir o agente.');
      }
    } catch {
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:text-red-800 px-1"
        >
          {loading ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-gray-400 hover:text-red-600 transition-colors"
      title={`Excluir ${agentName}`}
    >
      🗑️
    </button>
  );
}
