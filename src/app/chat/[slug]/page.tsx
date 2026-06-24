'use client';

import { useState, useEffect, useRef, FormEvent, use } from 'react';
import LeadPopup from '@/components/LeadPopup';
import CustomizeModal from '@/components/CustomizeModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentData {
  id: string;
  name: string;
  business_name: string;
  contact_info: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [leadReady, setLeadReady] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do agente
  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch(`/api/chat/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setAgent(data);

        // Verificar se já tem lead capturado
        const savedLead = localStorage.getItem(`lead_${data.id}`);
        if (savedLead) {
          setLeadDone(true);
        }

        // Carregar instruções customizadas salvas
        const savedCustom = localStorage.getItem(`custom_${data.id}`);
        if (savedCustom) {
          setCustomInstructions(savedCustom);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadAgent();
  }, [slug]);

  // Timer de 60s para popup de lead
  useEffect(() => {
    if (!agent || leadDone) return;

    const timer = setTimeout(() => {
      setLeadReady(true);
    }, 60000); // 60 segundos

    return () => clearTimeout(timer);
  }, [agent, leadDone]);

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  function handleLeadComplete(leadId: string) {
    setLeadDone(true);
    setLeadReady(false);
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch(`/api/chat/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          clientInstructions: customInstructions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Desculpe, ocorreu um erro. Tente novamente.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Erro de conexão. Verifique sua internet e tente novamente.',
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-5xl mb-4">🤖</div>
          <p className="text-gray-400">Carregando atendente...</p>
        </div>
      </div>
    );
  }

  // Agente não encontrado
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Atendente não encontrado
          </h2>
          <p className="text-sm text-gray-500">
            O link que você acessou não corresponde a nenhum atendente ativo.
            Verifique o link ou entre em contato com quem te enviou.
          </p>
        </div>
      </div>
    );
  }

  const displayName = agent?.business_name || agent?.name || 'Atendente Virtual';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#ebe3d5] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">
              {displayName}
            </h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de personalização ativa */}
          {customInstructions && (
            <span className="hidden sm:inline text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              ✨ Personalizado
            </span>
          )}
          {/* Botão Personalizar — visível e com texto */}
          <button
            onClick={() => setShowCustomize(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-[#ebe3d5] hover:border-blue-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span className="hidden sm:inline">Personalizar</span>
          </button>
        </div>
      </header>

      {/* Área do Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {/* Mensagem de boas-vindas */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Olá! Eu sou {displayName}
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Em que posso ajudar você hoje? Pode perguntar à vontade sobre
                nossos produtos e serviços.
              </p>

              {/* Card de personalização — visível e convidativo */}
              <div className="mt-6 inline-block">
                <button
                  onClick={() => setShowCustomize(true)}
                  className="flex items-center gap-3 bg-white border border-[#ebe3d5] hover:border-blue-300 rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all group text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      Personalizar este atendente
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {customInstructions
                        ? 'Você já personalizou — clique para ajustar'
                        : 'Adapte as respostas ao seu jeito'}
                    </p>
                  </div>
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
                    className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Banner sutil de personalização ativa durante a conversa */}
          {messages.length > 0 && customInstructions && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowCustomize(true)}
                className="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              >
                ✨ Atendente personalizado por você — clique para ajustar
              </button>
            </div>
          )}

          {/* Mensagens */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white border border-[#ebe3d5] text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#ebe3d5] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Área de input + botão de contato */}
      <div className="border-t border-[#ebe3d5] bg-white px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* Botão de contato */}
          {agent?.contact_info && (
            <div className="flex justify-center mb-3">
              <button
                onClick={() => {
                  const contact = agent.contact_info || '';
                  // Detectar se tem WhatsApp
                  const whatsappMatch = contact.match(
                    /(\+?\d{2}\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/
                  );
                  if (whatsappMatch) {
                    const number = whatsappMatch[0].replace(/\D/g, '');
                    window.open(
                      `https://wa.me/${number}`,
                      '_blank'
                    );
                  } else if (contact.includes('@')) {
                    window.location.href = `mailto:${contact}`;
                  } else {
                    // Abrir chat com alerta mostrando o contato
                    alert(`Entre em contato: ${contact}`);
                  }
                }}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Entrar em contato
              </button>
            </div>
          )}

          {/* Input de mensagem */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 input-field text-sm"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary !p-2 !rounded-lg shrink-0 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Popup de Lead (60s) */}
      {leadReady && agent && (
        <LeadPopup agentId={agent.id} onComplete={handleLeadComplete} />
      )}

      {/* Modal de Personalização */}
      {showCustomize && agent && (
        <CustomizeModal
          currentInstructions={customInstructions}
          onSave={(instructions) => {
            setCustomInstructions(instructions);
            // Salvar no localStorage
            localStorage.setItem(
              `custom_${agent.id}`,
              instructions
            );
            // Adicionar mensagem do sistema no chat
            if (instructions && messages.length > 0) {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: `✅ Entendi! Vou adaptar meu atendimento conforme suas preferências. Como posso ajudar?`,
                },
              ]);
            }
          }}
          onClose={() => setShowCustomize(false)}
        />
      )}
    </div>
  );
}
