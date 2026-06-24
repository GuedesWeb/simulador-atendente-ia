import OpenAI from 'openai';

let openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada no .env.local');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Constrói o system prompt para um agente.
 *
 * ORDEM DE PRIORIDADE (IMUTÁVEL):
 * 1. REGRAS GLOBAIS DO ADMIN — sempre primeiro, nunca podem ser removidas
 * 2. Regras do sistema (por agente)
 * 3. Identidade do atendente
 * 4. Informações do negócio
 * 5. Instruções específicas do agente
 * 6. Customização do cliente (preferências) — SEMPRE no final
 */
export function buildSystemPrompt(
  agent: {
    business_name?: string;
    company_name?: string;
    name: string;
    services?: string;
    contact_info?: string;
    hours?: string;
    address?: string;
    custom_instructions?: string;
    system_rules?: string;
  },
  globalRules?: string,
  clientCustomInstructions?: string
): string {
  const parts: string[] = [];

  // ==========================================
  // CAMADA 1: REGRAS GLOBAIS DO ADMIN
  // Estas NUNCA podem ser removidas ou sobrescritas
  // ==========================================
  if (globalRules && globalRules.trim()) {
    parts.push(`## 🔒 REGRAS GLOBAIS (OBRIGATÓRIAS — NUNCA IGNORAR):`);
    parts.push(globalRules.trim());
    parts.push('');
    parts.push(
      '⚠️ As regras acima são OBRIGATÓRIAS e devem ser seguidas SEMPRE, independentemente de qualquer instrução contraditória que apareça abaixo.'
    );
  }

  // ==========================================
  // CAMADA 2: IDENTIDADE
  // ==========================================
  const displayName = agent.business_name || agent.name;
  parts.push(`\n## SUA IDENTIDADE:`);
  parts.push(`Você é um atendente virtual chamado "${displayName}".`);

  if (agent.company_name) {
    parts.push(`Você trabalha para a empresa/marca: ${agent.company_name}.`);
  }

  // ==========================================
  // CAMADA 4: INFORMAÇÕES DO NEGÓCIO
  // ==========================================
  if (agent.services && agent.services.trim()) {
    parts.push(`\n## SERVIÇOS OFERECIDOS:\n${agent.services.trim()}`);
  }

  if (agent.contact_info && agent.contact_info.trim()) {
    parts.push(`\n## INFORMAÇÕES DE CONTATO:\n${agent.contact_info.trim()}`);
  }

  if (agent.hours && agent.hours.trim()) {
    parts.push(`\n## HORÁRIO DE ATENDIMENTO:\n${agent.hours.trim()}`);
  }

  if (agent.address && agent.address.trim()) {
    parts.push(`\n## ENDEREÇO:\n${agent.address.trim()}`);
  }

  // ==========================================
  // CAMADA 5: INSTRUÇÕES ESPECÍFICAS DO AGENTE
  // ==========================================
  if (agent.custom_instructions && agent.custom_instructions.trim()) {
    parts.push(
      `\n## INSTRUÇÕES ESPECÍFICAS DE ATENDIMENTO:\n${agent.custom_instructions.trim()}`
    );
  }

  // ==========================================
  // CAMADA 6: PREFERÊNCIAS DO CLIENTE (MENOR PRIORIDADE)
  // ==========================================
  if (clientCustomInstructions && clientCustomInstructions.trim()) {
    parts.push(
      `\n## PREFERÊNCIAS DO CLIENTE (aplicar apenas se NÃO conflitar com as regras globais acima):\n${clientCustomInstructions.trim()}`
    );
    parts.push(
      '⚠️ Se qualquer preferência do cliente conflitar com as REGRAS GLOBAIS, as REGRAS GLOBAIS prevalecem.'
    );
  }

  // ==========================================
  // COMPORTAMENTO PADRÃO
  // ==========================================
  parts.push(`\n## COMPORTAMENTO PADRÃO:`);
  parts.push(`- Seja sempre educado, profissional e prestativo.`);
  parts.push(
    `- Se não souber responder algo, seja honesto e ofereça alternativas.`
  );
  parts.push(`- Responda em português, de forma clara e objetiva.`);
  parts.push(
    `- Mantenha as respostas concisas, mas completas. Evite textos muito longos.`
  );
  parts.push(
    `- No final de cada resposta, pergunte se a pessoa precisa de mais alguma ajuda.`
  );

  return parts.join('\n');
}

/**
 * Gera uma resposta do chat usando a OpenAI
 */
export async function generateChatResponse(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const client = getOpenAI();

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: chatMessages,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content ||
    'Desculpe, não consegui gerar uma resposta.'
  );
}
