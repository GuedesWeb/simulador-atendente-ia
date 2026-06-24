import { NextRequest, NextResponse } from 'next/server';
import { getPublicDb } from '@/lib/db';
import { buildSystemPrompt, generateChatResponse } from '@/lib/openai';

// POST: Enviar mensagem e receber resposta da IA
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getPublicDb();

    // Buscar agente pelo slug (acesso público via RLS)
    const { data: agent, error: agentError } = await db
      .from('agents')
      .select('*')
      .eq('slug', slug)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agente não encontrado.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { message, history = [], leadId = null, clientInstructions = '' } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória.' },
        { status: 400 }
      );
    }

    // Buscar regras globais do admin (tabela settings)
    let globalRules = '';
    try {
      const { data: settings } = await db
        .from('settings')
        .select('value')
        .eq('key', 'global_rules')
        .single();

      if (settings) {
        globalRules = settings.value;
      }
    } catch {
      // Se não conseguir buscar, segue sem regras globais
    }

    // Construir system prompt com a hierarquia correta:
    // 1. Regras globais (admin)
    // 2. Regras do agente
    // 3. Instruções do agente
    // 4. Customização do cliente (sempre por último)
    const systemPrompt = buildSystemPrompt(agent, globalRules, clientInstructions);

    // Gerar resposta da IA
    const response = await generateChatResponse(
      systemPrompt,
      history,
      message
    );

    // Salvar mensagens (melhor esforço, não falha se der erro)
    try {
      const now = new Date().toISOString();
      await db.from('messages').insert([
        {
          agent_id: agent.id,
          lead_id: leadId,
          role: 'user',
          content: message.trim(),
          created_at: now,
        },
        {
          agent_id: agent.id,
          lead_id: leadId,
          role: 'assistant',
          content: response,
          created_at: now,
        },
      ]);
    } catch {
      // Não falhar se não conseguir salvar mensagens
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Erro no chat:', error);

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error:
            'Serviço temporariamente indisponível. Tente novamente em alguns instantes.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}

// GET: Obter configuração pública do agente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getPublicDb();

  const { data: agent, error } = await db
    .from('agents')
    .select('id, slug, name, business_name, services, contact_info, hours, address, custom_instructions, created_at, updated_at')
    .eq('slug', slug)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { error: 'Agente não encontrado.' },
      { status: 404 }
    );
  }

  return NextResponse.json(agent);
}
