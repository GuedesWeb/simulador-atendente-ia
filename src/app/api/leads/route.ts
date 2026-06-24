import { NextRequest, NextResponse } from 'next/server';
import { getPublicDb } from '@/lib/db';
import { nanoid } from 'nanoid';

// POST: Capturar lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, name, email, whatsapp = '' } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: 'ID do agente é obrigatório.' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email é obrigatório.' },
        { status: 400 }
      );
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido.' },
        { status: 400 }
      );
    }

    const db = getPublicDb();

    // Verificar se o agente existe
    const { data: agent } = await db
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .single();

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente não encontrado.' },
        { status: 404 }
      );
    }

    const id = nanoid(12);

    const { error } = await db.from('leads').insert({
      id,
      agent_id: agentId,
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
    });

    if (error) {
      console.error('Erro ao salvar lead:', error);
      return NextResponse.json(
        { error: 'Erro interno ao salvar lead.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao capturar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar lead.' },
      { status: 500 }
    );
  }
}
