import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET: Listar todos os agentes (admin)
export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar agentes:', error);
    return NextResponse.json({ error: 'Erro ao buscar agentes.' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Criar novo agente (admin)
export async function POST(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      company_name = '',
      business_name = '',
      services = '',
      contact_info = '',
      hours = '',
      address = '',
      custom_instructions = '',
      system_rules = '',
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome do agente é obrigatório.' },
        { status: 400 }
      );
    }

    const id = nanoid(12);
    const slug = nanoid(8);

    const db = getDb();
    const { data, error } = await db
      .from('agents')
      .insert({
        id,
        slug,
        name: name.trim(),
        company_name: company_name.trim(),
        business_name: business_name.trim(),
        services: services.trim(),
        contact_info: contact_info.trim(),
        hours: hours.trim(),
        address: address.trim(),
        custom_instructions: custom_instructions.trim(),
        system_rules: system_rules.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar agente:', error);
      return NextResponse.json(
        { error: 'Erro interno ao criar agente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar agente.' },
      { status: 500 }
    );
  }
}
