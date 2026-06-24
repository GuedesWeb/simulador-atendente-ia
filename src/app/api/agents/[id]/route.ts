import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { getDb, getPublicDb } from '@/lib/db';

// GET: Obter um agente específico (admin ou público via slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = getAuthFromRequest(request);
  const { id } = await params;

  // Admin usa service_role, público usa anon key
  const db = isAdmin ? getDb() : getPublicDb();

  // Tenta buscar por ID primeiro, depois por slug
  let { data: agent } = await db
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (!agent && !isAdmin) {
    const { data: bySlug } = await db
      .from('agents')
      .select('*')
      .eq('slug', id)
      .single();
    agent = bySlug;
  }

  if (!agent) {
    return NextResponse.json(
      { error: 'Agente não encontrado.' },
      { status: 404 }
    );
  }

  // Se for acesso público, não retornar system_rules
  if (!isAdmin) {
    const { system_rules, ...publicAgent } = agent;
    return NextResponse.json(publicAgent);
  }

  return NextResponse.json(agent);
}

// PUT: Atualizar um agente (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      company_name,
      business_name,
      services,
      contact_info,
      hours,
      address,
      custom_instructions,
      system_rules,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome do agente é obrigatório.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verifica se existe
    const { data: existing } = await db
      .from('agents')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Agente não encontrado.' },
        { status: 404 }
      );
    }

    const { data: agent, error } = await db
      .from('agents')
      .update({
        name: name.trim(),
        company_name: company_name?.trim() ?? '',
        business_name: business_name?.trim() ?? '',
        services: services?.trim() ?? '',
        contact_info: contact_info?.trim() ?? '',
        hours: hours?.trim() ?? '',
        address: address?.trim() ?? '',
        custom_instructions: custom_instructions?.trim() ?? '',
        system_rules: system_rules?.trim() ?? '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar agente:', error);
      return NextResponse.json(
        { error: 'Erro interno ao atualizar agente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Erro ao atualizar agente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar agente.' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir um agente (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    const { data: existing } = await db
      .from('agents')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Agente não encontrado.' },
        { status: 404 }
      );
    }

    await db.from('agents').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir agente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir agente.' },
      { status: 500 }
    );
  }
}
